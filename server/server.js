require('./config/config');

const _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

var { mongoose } = require('./db/mongoose');
const { ObjectID } = require('mongodb');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

////////////////////////////////////////////////
//// TODO ROUTES ///////////////////////////////
////////////////////////////////////////////////
app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        console.log('Saved todo');
        res.status(200).send(doc);
    }, (err) => {
        console.log('Unable to save todo', err);
        res.status(400).send(err);
    });
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.status(200);
        res.send({ todos });
    }).catch((e) => {
        console.log('Unable to load todos', e);
        res.status(400).send(err);
    })
});

// GET /todos/1234155
app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.status(400);
        res.send('Invalid id');
        return;
    }

    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            res.status(404);
            res.send({});
            return;
        }

        res.status(200);
        res.send({ todo });
    }, (e) => {
        res.status(400);
        res.send(e);
    });

});

app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.status(400);
        res.send('Invalid id');
        return;
    }

    Todo.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        }).then((todo) => {
        if (!todo) {
            res.status(404);
            res.send({});
            return;
        }

        res.status(200);
        res.send({ todo });
    }, (e) => {
        res.status(400);
        res.send(e);
    })
});

app.patch('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(400).send("Invalid id");
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
        _id: id, 
        _creator: req.user._id
    }, { $set: body }, { new: true }).then((todo) => {
        if (todo) {
            return res.status(200).send({ todo });
        }

        return res.status(404).send('no todo for id');
    }).catch((e) => {
        res.status(400).send(e);
    });

});

////////////////////////////////////////////////
//// USER ROUTES ///////////////////////////////
////////////////////////////////////////////////
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((err) => {
        console.log('Unable to save user', err);
        res.status(400).send(err);
    });
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        if (user) {
            return user.generateAuthToken().then((token) => {
                res.header('x-auth', token).status(200).send(user);
            });
        } else {
            res.status(401).send();
        }
    }).catch((err) => {        
        res.status(400).send();
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch((e) => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {
    app
}
