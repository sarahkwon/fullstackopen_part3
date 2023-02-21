const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(result => {
    console.log('Connected to MongoDB!')
  })
  .catch((error) => {
    console.log('There was an error connecting to MongoDB: ', error.message)
  })

//tells Mongoose how the note objects are to be stored in the database
const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
})

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Contact', contactSchema)