const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true},
(err, client)=>{
  if(err){
     console.log('Unable to connect to MongoDB server');
     return;
  }
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp');

  // deleteMany
  // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((res)=>{
  //   console.log(res);
  // });

  // db.collection('Users').deleteMany({name: 'Roman'}).then((res)=>{
  //   console.log(res);
  // });

  // deleteOne
  // db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((res)=>{
  //   console.log(res);
  // });

  // findOneAndDelete
  // db.collection('Todos').findOneAndDelete({completed: false}).then((res)=>{
  //   console.log(res);
  // });

  db.collection('Users').findOneAndDelete({_id: new ObjectID('5b4860fd514f0892277bd716')}).then((res)=>{
    console.log(res);
  });

  client.close();
});
