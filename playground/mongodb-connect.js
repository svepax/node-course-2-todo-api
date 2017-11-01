const util = require('util');

const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if(err) {
        return console.log('Unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');

    // db.collection('Users').insertMany([
    //     {
    //         name: 'Sven',
    //         age: 35,
    //         location: 'Albstadt'
    //     },
    //     {
    //         name: 'Steffi',
    //         age: 25,
    //         location: 'Balingen'
    //     },
    //     {
    //         name: 'Svenja',
    //         age: 33,
    //         location: 'Sigmaringen'
    //     },
    //     {
    //         name: 'Holger',
    //         age: 41,
    //         location: 'Albstadt'
    //     },
    //     {
    //         name: 'Svea',
    //         age: 22,
    //         location: 'Tübingen'
    //     }
    // ]).then((r) => {
    //     console.log(`${r.insertedCount} users inserted`);        
    // }, (err) => {
    //     console.log('Unable to insert users', err);
    // });

    db.collection('Users').find({name: /^Sv/}).toArray().then((docs) => {
        
        for(let user of docs) {
            console.log(`${user.name}, ${user.age} years young, from ${user.location}`);
        }
    }, (err) => {
        console.log('Unable to query users', err);
    })

    db.close();
});