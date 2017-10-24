const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('../../models/todo');
const {User} = require('../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
  _id: userOneId,
  email: 'a1@b.com',
  password: 'userOnePassword',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId.toHexString(), access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'a2@b.com',
  password: 'userTwoPassword'
}];

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo item'
}, {
  _id: new ObjectID(),
  text: 'Second test todo item',
  completed: true,
  completedAt: 333
}];

var populateTodos = (done) => {
  Todo.remove().then(() => {
    Todo.insertMany(todos).then(() => done());
  })
};

var populateUsers = (done) => {
  User.remove().then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {
  todos, populateTodos,
  users, populateUsers  
};

