const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    sparse: true,
    minlength: 6,
    maxlength: 100,
    validate: {
      validator: (email) => /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/.test(email),
      message: props => `${props.value} is not a valid email!`
    },
  },
  hash: {
    type: String,
  },
  salt: {
    type: String,
  },
  externalLogins: [{
    _id: false,
    serviceName: {
      type: String,
    },
    profileId: {
      type: String,
    }
  }]
});

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

userSchema.methods.validatePassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

module.exports = mongoose.model('User', userSchema)