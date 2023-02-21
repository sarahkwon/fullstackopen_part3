require('dotenv').config()

const Contact = require('./models/contact')

const express = require('express')
const app = express()

const morgan = require('morgan')
const cors = require('cors')

app.use(express.static('build'))
app.use(express.json())


app.use(cors())

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(500).send({error: 'malformatted id'})
  }

  next(error)
}

app.use(errorHandler)

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons/', (request, response) => {
  Contact.find({}).then(contacts => {
    response.json(contacts)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Contact.findById(request.params.id).then(contact => {
    response.json(contact)
  })
})

app.get('/info/', (request, response) => {
  var currDate = new Date()
  var count = Contact.collection.countDocuments()
    .then(myCount => {
      response.send(`
        <p>Phonebook has info for ${myCount} people</p>
        <p>${currDate.toDateString()} ${currDate.toLocaleTimeString()}</p>
      `)
    })

  
})

app.delete('/api/persons/:id', (request, response, next) => {
  Contact.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (body.number === undefined) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const person = new Contact({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedContact => {
    response.json(savedContact)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number
  }

  Contact.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedContact => {
      response.json(updatedContact)
    })
    .catch(error => next(error))
})



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})