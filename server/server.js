require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

// POST /todos
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  })
});

// GET /todos
app.get('/todos', authenticate, (req, res) => {
  Todo.find({_creator: req.user._id}).then((todos)=>{
    res.send({todos});
  }, (e)=> {
    res.status(400).send(e);
  });
});

// GET /todos/:id
app.get('/todos/:id', authenticate, (req, res)=>{
  var id = req.params.id;
  if (!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Todo.findOne({_id: id, _creator: req.user._id}).then((todo) => {
    if(!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  }, (err) => {
    res.status(400).send();
  });
});

// DELETE /todos/:id
app.delete('/todos/:id', authenticate, (req, res)=>{
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOneAndRemove({_id: id, _creator: req.user._id}).then((todo)=>{
    if(!todo){
      return res.status(404).send();
    }

    res.send({todo});
  }, (err)=>{
    res.status(400).send();
  });
});

app.patch('/todos/:id', authenticate, (req, res)=>{
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {'$set': body}, {new: true}).then((todo)=>{
    if(!todo){
      return res.status(404).send();
    }
    res.send({todo})
  }, (err)=>{
    res.status(400).send();
  });
});

// POST /users
app.post('/users', (req, res)=>{
  var user = new User(_.pick(req.body, ['email', 'password']));

  user.save().then(()=>{
    return user.generateAuthToken();
  }).then((token)=>{
    res.header('x-auth', token).send(user);
  }).catch((e)=>{
    res.status(400).send(e);
  });
});

// GET /users/me
app.get('/users/me', authenticate, (req, res)=>{
  res.send(req.user);
});

// POST /users/login {email, password}
app.post('/users/login', async (req, res)=>{
  var login = _.pick(req.body, ['email', 'password']);

  try {
    var user = await User.findByCredentials(login.email, login.password);
    var token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send();
  }
});

app.delete('/users/me/token', authenticate, async (req, res)=>{
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

app.listen(port, ()=>{
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
