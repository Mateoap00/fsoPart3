/*
    Step 12: Here I added a connection to a Cloud MongoDB database that creates a new person register when the file mongo.js is executed with node.
    This hasn't been implemented to the backend yet.

    Step 13: Here I implemented the MongoDB Phonebook database connection into it's own module (models/person.js) so it can get exported in the index.js file and used
    to fetch the db data.

    Step 14: For this step I changed the post request in index.js to save new persons registers in the phonebook database. For the moment it doesn't check if there's a
    person with the same name already in the phonebook.
*/

const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

console.log('Connecting to MongoDB...');

mongoose.connect(uri)
    .then((result) => {
        console.log('Connected successfully!');
    }).catch((error) => {
        console.log('Error connecting to MongoDB!');
    })

const personSchema = new mongoose.Schema({
    name: String,
    number: String
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
});

module.exports = new mongoose.model('Person', personSchema);