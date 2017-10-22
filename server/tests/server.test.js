const expect = require('expect');
const request = require('supertest');

const {app} = require('../server');
const {Todo} = require('../models/todo');

const testTodos = [{
  text: 'First test todo item'
}, {
  text: 'Second test todo item'
}];

beforeEach((done) => {
  Todo.remove().then(() => {
    Todo.insertMany(testTodos).then(() => done());
  })
});

describe('POST /todos', () => {
  it ('should create a valid todo item', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(201)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it ('should not create a todo item with invalid text', (done) => {
    request(app)
    .post('/todos')
    .send({})
    .expect(400)
    .end((err, res) => {
      if(err) {
        return done(err);
      }

      Todo.find().then((todos) => {
        expect(todos.length).toBe(testTodos.length);
        done();
      }).catch((e) => done(e));
    });
  
  })
});

describe('GET /todos', () => {
  it ('should get all test todos', (done) => {
    request(app)
    .get('/todos')
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(testTodos.length);
    })
    .end(done);
  });
});