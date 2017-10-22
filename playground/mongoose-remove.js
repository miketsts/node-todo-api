const {ObjectID} = require('mongodb');
const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

const id = '59ece630093c07f938c425eb';

// Todo.remove({}).then((res) => {
//   console.log(res);
// });

Todo.findByIdAndRemove(id).then((todo) => {
  console.log(todo);
});