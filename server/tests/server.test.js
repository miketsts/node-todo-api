const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');

const testTodos = [{
  _id: new ObjectID(),
  text: 'First test todo item'
}, {
  _id: new ObjectID(),
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

describe('GET /todos/:id', () => {

  it('should return a todo item by id', (done) => {
    request(app)
      .get(`/todos/${testTodos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(testTodos[0].text)
      })
      .end(done);
  });

  it ('should return 404 if todo not dound', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  })

  it ('should return 404 if id is invalid', (done) => {
    request(app)
      .get('/todos/12345')
      .expect(404)
      .end(done);
  })
});

describe('DELETE /todos/:id', () => {
  it ('should remove a todo', (done) => {
    var id = testTodos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(testTodos[0].text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));        
      });
  });

  it ('should return 404 if todo not found', (done) => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it ('should return 404 if id is invalid', (done) => {
    request(app)
      .delete('/todos/12345')
      .expect(404)
      .end(done);
  });
});
