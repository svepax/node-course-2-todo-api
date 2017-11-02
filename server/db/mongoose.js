const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp', { useMongoClient: true }).then(() => {
        console.log('Successfully connected to MongoDB');
    })
    .catch((err) => {
        console.error('Unable to connect to MongoDB', err);
        process.exit(1);
    });

module.exports = {
    mongoose
}