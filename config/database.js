const mongoose = require('mongoose');

const server = process.env.DB_SERVER;

class Database {
  constructor() {
    mongoose.set('useFindAndModify', false);
    this._connect()
  }

  async _connect() {
    try {
      await mongoose.connect(`mongodb://${server}/memosdb`, { useNewUrlParser: true })

      //mongoose.connection.db.dropDatabase();
      console.log('Database connection successful')
    }
    catch (err) {
      console.error('Database connection error')
    }
  }
}

module.exports = new Database();