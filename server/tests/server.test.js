const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos)=>{
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e)=> done(e));

      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res)=>{
        if (err) {
          return done(err);
        }

        Todo.find().then((todos)=>{
          expect(todos.length).toBe(2);
          done();
        }).catch((e)=>done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return todo doc create by other user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('shoud return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('shoud return 404 for non-object ids', (done) => {
    var id = '123abc';
    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var id = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(id);
        expect(res.body.todo.text).toBe(todos[1].text);
      })
      .end((err, res)=>{
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((doc)=>{
          expect(doc).toBeFalsy();
          done();
        }).catch((e)=> done(e));
      });
  });

  it('should not remove a todo created by other user', (done) => {
    var id = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res)=>{
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((doc)=>{
          expect(doc).toBeTruthy();
          done();
        }).catch((e)=> done(e));
      });
  });

  it('shoud return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('shoud return 404 for non-object ids', (done) => {
    var id = '123abc';
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

});

describe('PATCH /todos/:id', ()=>{
  it('should update a todo', (done)=> {
    var compTodo = todos[0];

    request(app)
      .patch(`/todos/${compTodo._id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({completed: true})
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(compTodo._id.toHexString());
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeTruthy()
        expect(typeof res.body.todo.completedAt).toBe('number');
        expect(res.body.todo._creator).toBe(users[0]._id.toHexString());
      })
      .end(done);
  });

  it('should not update a todo created by other user', (done)=> {
    var compTodo = todos[1];

    request(app)
      .patch(`/todos/${compTodo._id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({completed: true})
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done)=> {
    var incompTodo = todos[1];

    request(app)
      .patch(`/todos/${incompTodo._id}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({completed: false})
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(incompTodo._id.toHexString());
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
        expect(res.body.todo._creator).toBe(users[1]._id.toHexString());
      })
      .end(done);
  })
});

describe('GET /users/me', ()=> {
  it('should return a user if authenticated', (done)=>{
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done)=>{
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res)=>{
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', ()=>{
  it('should create a user', (done)=>{
    var email = 'example@example.com';
    var password = '123abc!';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res)=>{
        expect(res.headers['x-auth']).toBeTruthy()
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err)=>{
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user)=>{
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        })
      });
  });

  it('should return validation errors if request invalid', (done)=>{
    request(app)
      .post('/users')
      .send({email: 'example@com', password: '123a'})
      .expect(400)
      .end(done);
  });

  it('should not create a user if email in use', (done)=>{
    request(app)
      .post('/users')
      .send({email: users[0].email, password: '123abc!'})
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', ()=>{
  it('should login user and return auth token', (done)=>{
      var user = users[1];

      request(app)
        .post('/users/login')
        .send({email: user.email, password: user.password})
        .expect(200)
        .expect((res)=>{
          expect(res.body._id).toBe(user._id.toHexString());
          expect(res.body.email).toBe(user.email);
          expect(res.headers['x-auth']).toBeTruthy();
        })
        .end((err, res)=>{
          if (err){
            return done(err);
          }

          User.findById(user._id).then((userDoc)=>{
            expect(userDoc.toObject().tokens[1]).toMatchObject({
              access: 'auth', token: res.headers['x-auth']
            });
            done();
          }).catch((e) => done(e));
        });
  });

  it('should reject invalid logon', (done)=>{
    var user = users[1];

    request(app)
      .post('/users/login')
      .send({email: user.email, password: 'invalidPass'})
      .expect(400)
      .expect((res)=>{
        expect(res.body).toEqual({});
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res)=>{
        if (err){
          return done(err);
        }

        User.findById(user._id).then((userDoc)=>{
          expect(userDoc.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/token', ()=>{
  it('should remove auth token on logout', (done)=> {
    var user = users[0];

    request(app)
      .delete('/users/me/token')
      .set('x-auth', user.tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body).toEqual({});
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res)=>{
        if (err) {
          return done(err);
        }

        User.findById(user._id).then((doc)=>{
          expect(doc.tokens.length).toBe(0);
          done(0);
        }).catch((e)=>done(e));
      });
  });
});
