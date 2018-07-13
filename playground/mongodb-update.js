const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true},
(err, client)=>{
  if(err){
     console.log('Unable to connect to MongoDB server');
     return;
  }
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp');

  // findOneAndUpdate
  // db.collection('Todos').findOneAndUpdate({_id: new ObjectID('5b485d7b514f0892277bd593')},
  //   {
  //     $set: {
  //     completed: true
  //   }
  // }, {returnOriginal: false}).then((res)=>{
  //   console.log(res);
  // });

  db.collection('Users').findOneAndUpdate({_id: new ObjectID('5b47a7b0d97b1a13e2835daf')},
    {
      $set: { name: 'Roman', location: 'Kyiv'},
      $inc: { age: 2 },
    }, {returnOriginal: false}).then((res)=>{
      console.log(res);
    });

  client.close();
});
