const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
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
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('shoud return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });

  it('shoud return 404 for non-object ids', (done) => {
    var id = '123abc';
    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo and return it', (done) => {
    var id = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
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
          expect(doc).toNotExist();
          done();
        }).catch((e)=> done(e));
      });
  });

  it('shoud return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });

  it('shoud return 404 for non-object ids', (done) => {
    var id = '123abc';
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

});

describe('PATCH /todos/:id', ()=>{
  it('should complete a todo', (done)=> {
    var compTodo = todos[0];

    request(app)
      .patch(`/todos/${compTodo._id}`)
      .send({completed: true})
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(compTodo._id.toHexString());
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toExist().toBeA('number');
      })
      .end(done);
  });

  it('should incomplete a todo', (done)=> {
    var incompTodo = todos[1];

    request(app)
      .patch(`/todos/${incompTodo._id}`)
      .send({completed: false})
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(incompTodo._id.toHexString());
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  })
});
