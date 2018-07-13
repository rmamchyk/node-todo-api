const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true},
(err, client)=>{
  if(err){
     console.log('Unable to connect to MongoDB server');
     return;
  }
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp');

  //Insert new doc into the Todos collection
  // db.collection('Todos').insertOne({ text: 'Something to do', completed: false},
  //   (err, res)=>{
  //     if(err){
  //       console.log('Unable to insert Todo doc');
  //       return;
  //     }
  //     console.log(JSON.stringify(res.ops, undefined, 2));
  // });

  //Insert new doc into the Users collection (name, age, location)
  // db.collection('Users').insertOne({
  //   name: 'Roman',
  //   age: 27,
  //   location: 'Kyiv, Lesya Kurbasa 10'}, (err, res)=>{
  //     if (err) {
  //       console.log('Unable to insert User doc');
  //       return;
  //     }
  //     console.log(JSON.stringify(res.ops[0]._id.getTimestamp(), undefined, 2));
  //   });

  client.close();
});
