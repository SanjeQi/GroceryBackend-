import bodyParser from 'body-parser'
const fetch = require('node-fetch')
const express = require('express')
const db = require('./db/db.js')

// Set up the express app
const app = express()

// Parse incoming requests data
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type,  Accept'
  )
  next()
})

let allData = []
const getData = () => {
  fetch('https://api.punkapi.com/v2/beers?brewed_before=11-2012&abv_gt=6')
    .then(response => response.json())
    .then(data => {
      allData = data
    })
}
getData()

// get all todos
app.get('/api/v1/todos', (req, res) => {
  res.status(200).send({
    success: 'true',
    message: 'todos retrieved successfully',
    drinks: allData
  })
})

app.post('/api/v1/todos', (req, res) => {
  if (!req.body.title) {
    return res.status(400).send({
      success: 'false',
      message: 'title is required'
    })
  } else if (!req.body.description) {
    return res.status(400).send({
      success: 'false',
      message: 'description is required'
    })
  }
  const todo = {
    id: db.length + 1,
    title: req.body.title,
    description: req.body.description
  }
  db.push(todo)
  return res.status(201).send({
    success: 'true',
    message: 'todo added successfully',
    todo
  })
})

app.get('/api/v1/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  db.map(todo => {
    if (todo.id === id) {
      return res.status(200).send({
        success: 'true',
        message: 'todo retrieved successfully',
        todo
      })
    }
  })
  return res.status(404).send({
    success: 'false',
    message: 'todo does not exist'
  })
})

app.delete('/api/v1/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)

  db.map((todo, index) => {
    if (todo.id === id) {
      db.splice(index, 1)
      return res.status(200).send({
        success: 'true',
        message: 'Todo deleted successfuly'
      })
    }
  })

  return res.status(404).send({
    success: 'false',
    message: 'todo not found'
  })
})

app.put('/api/v1/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  let todoFound
  let itemIndex
  db.map((todo, index) => {
    if (todo.id === id) {
      todoFound = todo
      itemIndex = index
    }
  })

  if (!todoFound) {
    return res.status(404).send({
      success: 'false',
      message: 'todo not found'
    })
  }

  if (!req.body.title) {
    return res.status(400).send({
      success: 'false',
      message: 'title is required'
    })
  } else if (!req.body.description) {
    return res.status(400).send({
      success: 'false',
      message: 'description is required'
    })
  }

  const updatedTodo = {
    id: todoFound.id,
    title: req.body.title || todoFound.title,
    description: req.body.description || todoFound.description
  }

  db.splice(itemIndex, 1, updatedTodo)

  return res.status(201).send({
    success: 'true',
    message: 'todo added successfully',
    updatedTodo
  })
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})
