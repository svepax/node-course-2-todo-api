const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// var id = '59fac1cf6d992412b4748453e9811';

// if(!ObjectID.isValid(id)) {
//     console.log('ID not valid');
// }

// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// });

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo', todo);
// });

// Todo.findById(id).then((todo) => {
//     if(!todo) {
//         return console.log('Id not found');
//     }
//     console.log('Todo by id', todo);
// });

// User.findbyid
var userId = '59f9cc1723603725d0a7facf';
User.find({_id: userId}).then((users) => {
    console.log(users);
}, (err) => {
    console.log(e);
});

User.findOne({_id: userId}).then((user) => {
    console.log(user);
}, (err) => {
    console.log(e);
});

User.findById(userId).then((user) => {
    if(!user) {
        return console.log('Unable to find user');
    } 
    
    console.log('User by id:' + user);
}, (err) => {
    console.log(e);
});