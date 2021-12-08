const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(400).json({ error: 'User not found!' });
  }

  request.user = user;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if(userAlreadyExists){
    return response.status(400).json({ error: 'User already exists!'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.status(200).json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  request.user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;

  request.user.todos.find(todo => {
    if (todo.id === id){
      todo.title = title;
      todo.deadline = new Date(deadline);

      return response.status(200).json(todo);
    }
  });

  return response.status(404).json({ error: 'Todo not found'});

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  request.user.todos.find(todo => {
    if (todo.id === id){
      todo.done = true;

      return response.status(200).json(todo);
    }
  });

  return response.status(404).json({ error: 'Todo not found'});
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todoExists = request.user.todos.find(todo => todo.id === id);

  if (todoExists) {
    request.user.todos.splice(request.user.todos.indexOf(todoExists), 1);

    return response.status(204).json();
  }
  
  return response.status(404).json({ error: 'Todo not found' });
});

module.exports = app;