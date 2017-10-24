const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const seed = require('../tests/seed/seed');

beforeEach(seed.populateUsers);
beforeEach(seed.populateTodos);

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
        expect(todos.length).toBe(seed.todos.length);
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
      expect(res.body.todos.length).toBe(seed.todos.length);
    })
    .end(done);
  });
});

describe('GET /todos/:id', () => {

  it('should return a todo item by id', (done) => {
    request(app)
      .get(`/todos/${seed.todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(seed.todos[0].text)
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
    var id = seed.todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(seed.todos[0].text);
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

describe ('PATCH /todos/:id', () => {
  it ('should update the todo', (done) => {
    var id = seed.todos[0]._id.toHexString();
    var newText = 'First item updated todo';

    request(app)
      .patch(`/todos/${id}`)
      .send({text:newText, completed:true})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(newText);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });

  it ('should clear completedAt when todo is not completed', (done) => {
    var id = seed.todos[1]._id.toHexString();
    var newText = 'Second item updated todo';

    request(app)
      .patch(`/todos/${id}`)
      .send({text:newText, completed:false})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(newText);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist;
      })
      .end(done);

  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', seed.users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(seed.users[0]._id.toHexString());
        expect(res.body.email).toBe(seed.users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
    .get('/users/me')
    .expect(401)
    .expect((res) => {
      expect(res.body).toEqual({});
    })
  .end(done);
});
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = '123abc!@#';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        })
      });
  });

  it ('should return validation errors if the user is invalid', (done) => {
    var email = '12345';
    var password = '123abc!@#';

    request(app)
      .post('/users')
      .send({email: '12345', password: 'qwertyui'})
      .expect(400)
      .end((err) => {
        if (err) {
          return done(err);
        }
        request(app)
        .post('/users')
        .send({email: 'example@example.com', password: 'a'})
        .expect(400)
        .end(done);
      });
});

  it('should not create a user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: seed.users[0].email, 
        password: '123erty'
      })
      .expect(400)
      .end(done);
  });
});
