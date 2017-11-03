const {ObjectID} = require('mongodb');

var {mongoose} = require('./../server/db/mongoose');
var {Todo} = require('./../server/models/todo');
var {User} = require('./../server/models/user');

Todo.findByIdAndRemove('59fc2c8e1b501d6d98b72873').then((todo) => {
    console.log(todo);
});
