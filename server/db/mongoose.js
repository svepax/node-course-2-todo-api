const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// MONGO_URI ON HEROKU: mongodb://heroku_7k071b68:rksh2vebustp1if5v3q9rd8796@ds245755.mlab.com:45755/heroku_7k071b68
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true }).then(() => {
        console.log('Successfully connected to MongoDB');
    })
    .catch((err) => {
        console.error('Unable to connect to MongoDB', err);
        process.exit(1);
    });

module.exports = {
    mongoose
}