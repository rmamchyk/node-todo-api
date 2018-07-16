const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((res)=>{
//   console.log(res);
// });

// Todo.findOneAndRemove
// Todo.findByIdAndRemove

Todo.findOneAndRemove({_id: '5b4c7a18514f0892277c404a'}).then((doc)=>{
  console.log(doc);
});

// Todo.findByIdAndRemove('5b4c77d9514f0892277c4005').then((doc)=>{
//   console.log(doc);
// });
