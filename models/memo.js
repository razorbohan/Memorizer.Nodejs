const mongoose = require('mongoose')

const memoSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    unique: true,
  },
  answer: {
    type: String,
    required: true,
  },
  repeatDate: {
    type: Date,
    required: true,
  },
  postponeLevel: {
    type: Number,
    required: true,
  },
  scores: {
    type: Number,
    required: true,
  }
})

module.exports = mongoose.model('Memo', memoSchema)