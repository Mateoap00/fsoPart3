/*
    Step 12: Here I added a connection to a Cloud MongoDB database that creates a new person register when the file mongo.js is executed with node.
    This hasn't been implemented to the backend yet. 

    TO-DO: Commit and push tp github.
*/

const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>');
    console.log('or the password, person name and number like this: node mongo.js <password> <name> <number>');
    process.exit(1)
}

const user = 'mateoap00';
const psw = process.argv[2];
const url = `mongodb+srv://${user}:${psw}@cluster0.kqfgyqp.mongodb.net/the-phonebook?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
    name: String,
    number: String
});

const Person = new mongoose.model('Person', personSchema);

if (process.argv.length === 5) {

    mongoose.connect(url).
        then((result) => {
            const name = process.argv[3];
            const number = process.argv[4];

            const newPerson = new Person({
                name: name,
                number: number
            });

            newPerson.save().then(() => {
                console.log(`Added ${name} with the phone ${number} to the phonebook database!`);
                mongoose.connection.close();
            });
        }).catch((error) => {
            console.log(error);
        });
} else {
    mongoose.connect(url).
        then((result) => {
            Person.find({}).then(result => {
                console.log('Phonebook:');
                result.forEach(person => {
                    console.log(person.name, ' - ', person.number);
                    console.log('---------------------');
                })
                mongoose.connection.close();
            });
        });
}