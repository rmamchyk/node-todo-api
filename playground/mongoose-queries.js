const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var todoId = '5b48b5af722fa220bb7fcaae';
var userId = '5b488f88a8af9e1d5bececd3';

if (!ObjectID.isValid(todoId)){
  console.log('Id not valid');
}

// Todo.find({
//   _id: id
// }).then((todos)=> {
//   console.log('Todos', todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then((todo)=>{
//   console.log('Todo', todo);
// });

// Todo.findById(todoId).then((todo)=>{
//   if(!todo){
//     return console.log('Id not found');
//   }
//   console.log('Todo By Id', todo);
// }).catch((err)=>{
//   console.log(err);
// });

User.findById(userId).then((user)=>{
  if(!user){
    return console.log('User not found');
  }
  console.log('User:\n', user);
}).catch((e)=>console.log(e));
