// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to mongodb server');
  }

  console.log('Connected to MongoDB server');

  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to insert a document', err);
  //   }

  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // })

  db.collection('Users').insertOne({
    name: 'Alice Wonder',
    age: 123,
    location: 'Wonderland'
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert a document', err);
    }

    console.log(JSON.stringify(result.ops, undefined, 2));
  })

  db.close();
});
