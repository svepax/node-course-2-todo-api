var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
const {ObjectID} = require('mongodb');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo(req.body);

    todo.save().then((doc) => {
        console.log('Saved todo');
        res.status(200).send(doc);
    }, (err) => {
        console.log('Unable to save todo', err);
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.status(200);
        res.send({todos});
    }).catch((e) => {
        console.log('Unable to load todos', e);
        res.status(400).send(err);
    })
});

// GET /todos/1234155
app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)) {
        res.status(400);
        res.send('Invalid id');
        return;
    }

    Todo.findById(id).then((todo) => {
        if(!todo) {
            res.status(404);
            res.send({});
            return;
        }

        res.status(200);
        res.send({todo});
    }, (e) => {
        res.status(400);
        res.send(e);        
    });
    
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)) {
        res.status(400);
        res.send('Invalid id');
        return;
    }

    Todo.findByIdAndRemove(id).then((todo) => {
        if(!todo) {
            res.status(404);
            res.send({});
            return;
        }

        res.status(200);
        res.send({todo});
    }, (e) => {
        res.status(400);
        res.send(e);
    })
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {
    app
}
