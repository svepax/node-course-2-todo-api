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

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if(err) {
                    return done(err.name + ' - ' + err._message);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            })
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
    it('should get a todo by id', (done) => {
        request(app)
            .get('/todos/' + todos[0]._id)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should not return todo doc created by other user', (done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should get a todo by id - 404 non existing id', (done) => {
        request(app)
            .get('/todos/' + new ObjectID())
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should get a todo by id - 400 invalid id', (done) => {
        request(app)
            .get('/todos/12345')
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .expect((res) => {
                expect(res.text).toBe('Invalid id');
            })
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo by id', (done) => {
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete('/todos/' + hexId)
            .set('x-auth', users[1].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, result) => {
                if(err) {
                    return done(err);
                }

                Todo.count({}, (err, count) => {
                    if(err) {
                        return done(err);                        
                    }

                    expect(count).toBe(1);                    
                });

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toBe(null);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should remove a todo - invalid id', (done) => {
        request(app)
            .delete('/todos/1234')
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .expect('Invalid id')
            .end(done);
    });

    it('should remove a todo - non existing id', (done) => {
        request(app)
            .delete('/todos/55fc2d85e269243178890eee')
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    })
});

describe('PATCH /todos/:id', () => {
    it('should update a todo by id - change text', (done) => {
        request(app)
            .patch('/todos/' + todos[0]._id)
            .set('x-auth', users[0].tokens[0].token)
            .send({"text": "New text"})
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe('New text');
            })
            .end(done);
    });

    it('should update a todo by id - wrong user', (done) => {
        request(app)
            .patch('/todos/' + todos[0]._id)
            .set('x-auth', users[1].tokens[0].token)
            .send({"text": "New text"})
            .expect(404)
            .end(done);
    });

    it('should update a todo by id - set to completed', (done) => {
        request(app)
            .patch('/todos/' + todos[0]._id)
            .set('x-auth', users[0].tokens[0].token)
            .send({"text": "New text"})
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe('New text');
            })
            .end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
        request(app)
        .patch('/todos/' + todos[1]._id)
        .set('x-auth', users[1].tokens[0].token)
        .send({"completed": false})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.completedAt).toBe(null);
        })
        .end(done);
    });

    it('should update a todo - invalid id', (done) => {
        request(app)
            .patch('/todos/1234')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .expect('Invalid id')
            .end(done);
    });

    it('should update a todo - non existing id', (done) => {
        request(app)
            .patch('/todos/55fc2d85e269243178890eee')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(404)
            .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', 'asdjfaj23904u203jrnwklf230489ui23joklemfnklsuaklfd0293')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {

    it('should create a user', (done) => {
        var email = 'peter@parker.com';
        var password = 'pwd987!';

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.header['x-auth']).toExist()
                expect(res.body.email).toBe(email);                
                expect(res.body._id).toExist();                
            })
            .end((err) => {
                if(err) {
                    return done();
                }

                User.findOne({email}).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotEqual(password);
                    done();
                });
            });
    });

    it('should return validation errors if email invalid', (done) => {
        var email = 'wrong';
        var password = '!12341234!';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });

    it('should return validation errors if password invalid', (done) => {
        var email = 'dave@galaxy.org';
        var password = 'wrong';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        var email = users[0].email;
        var password = '12345abc';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[0]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[0].email,
                password: 'wrongPwd'
            })
            .expect(401)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end(done);
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();                
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }

                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    return done();
                }).catch((e) => done(e));
            });
    });
});