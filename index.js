/*
    THE PHONEBOOK BACKEND

    Step 1: In this step I created a express app that runs in localhost port 3001, and sends a response to a get request in the url /api/persons.
    The response sends the persons object in JSON format.

    Step 2: In this step I had to create a response to the get request in /info that shows the number of persons in the phonebook register and
    the current date with hour and timezone. This response is a text/html type response.

    Step 3: For this step I had to response with a person details when the get request to /api/persons/id happens, and if the id in the request is
    not found in the persons object, the response status is 404 not found.

    Step 4: In this step I implemented a handler for a delete request at /api/persons/id, the handler checks if the id exists in the persons object
    and then removes that person and response has 204 no content status, if not then the response has 404 not found.

    Step 5: In this step I added a handler for post requests that creates a new person register with name, number and id, the id is generated
    randomly between 1 and 10000, if the post success then the response status is 200 ok.

    Step 6: Here I implemented error handling to check if the post request has name and number of a person in the body, and if the name is unique.
    If any of this conditions do not succeed then the response status is 400 bad request.

    Step 7: For this I installed the npm morgan package and use the 'tiny' method as a middleware to log the request information for every type of
    request made to the server.

    Step 8: Here I used the morgan package to create my own token that logs the request body when a request is made to the server, then I call this
    token along side other "basic" tokens so it logs the information, to get the request body in a valid format I used JSON.stringify().

    Step 9: I implemented the phonebook backend to work with the frontend developed in part 2, I changed the url in persons service and added a proxy
    to fetch the data from localhost:3001, also I change the http post request response to send the new persons added in json format.

    Step 10 and 11: I'm using Railway to deploy the project to the internet, creating a production build of the frontend in the root of this project and
    then committing the changes to the github repo so Railways updates the deployment automatically. The app should be live at https://fsopart3-production.up.railway.app/
    unless the free monthly charge or hours for my account were consumed in Railway.

    Step 15: Added the delete person functionality to the mongo database and verified with the front end app.

    Step 16: In this step I moved the error handling of the requests into it's own middleware that gets loaded with app.use.

    Step 17*: Here I implemented a put request handler to update the register of a person if the front end sends a request of a person that is already registered in
    the phonebook.

    Step 18*: In this step I modified the get /info request to show the current real number of people registered in the database of the phonebook, also I added error handling
    to all the request handlers, but the handler middleware just shows information if the error is a Casterror type, if not then the default error handler of express is called.

    Step 19*: In this step I added validators for the Person schema collection in mongodb, so it requires that the name of the person is at least 3 characters and the number exists.
    If not then a error get's thrown to the handler middleware that has a new option "ValidationError" for errors of this type.
    The validators are called when post and update requests are made. In the react front end I added more error messages to inform about the exact error.

    Step 20*: I added custom validators in the person schema that verifies if a phone number is valid if not then saving that phone will throw a error.
    For this I added a 1st validator to check that the number contains only digits or the '-' character, and a 2nd validator to check if it has the '-'
    then the first part before - has to be at least 2 or 3 numbers. Also in the schema definition asks that the minimum length for the number is 8.
    A extra validation is made if a http post request sends data with a name that's already register, then it throws a error, for this I defined that
    the name field is unique in the schema (this validation doesn't generates problem with the put request handler).

    Step 21*: I uploaded the latest version of the phonebook app with all the new changes and the new production build of the frontend in railway.
    The app should be live at https://fsopart3-production.up.railway.app/ unless the free monthly charge or hours for my account were consumed in Railway.
*/
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

// MIDDLEWARE

app.use(express.json());
app.use(cors());
app.use(express.static('build'));

// eslint-disable-next-line no-unused-vars
morgan.token('resJSON', (request, response) => {
    return JSON.stringify(request.body);
});


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :resJSON'));

// ROUTES

app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then((people) => {
            console.log('Persons: ', people);
            response.json(people);
        }).catch(error => next(error));

});

app.get('/info', (request, response, next) => {
    Person.find({})
        .then((people) => {
            const peopleLength = people.length;
            response.send(`<p>Phonebook has the information of ${peopleLength} people</p>\n${new Date()}`);
        }).catch(error => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {

    Person.findById(request.params.id)
        .then((person) => {
            if (person) {
                console.log('Person found: ', person);
                response.json(person);
            } else {
                console.log('404 person not found');
                response.status(404).json({ error: 'Person not found' });
            }
        }).catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;

    Person.findByIdAndRemove(id)
        .then(() => {
            console.log('Deleted successfully!');
            response.status(204).end();
        }).catch(error => next(error));
});

app.post('/api/persons/', (request, response, next) => {
    const body = request.body;

    const newPerson = new Person({
        name: body.name,
        number: body.number
    });

    newPerson.save()
        .then((newPerson) => {
            console.log('New person registered: ', newPerson);
            response.json(newPerson);
        }).catch(error => next(error));

});

app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;
    const person = {
        name: request.body.name,
        number: request.body.number
    };

    const opts = { new: true, runValidators: true, context: 'query' };
    Person.findByIdAndUpdate(id, person, opts)
        .then(updatedPerson => {
            console.log('Updated person: ', updatedPerson);
            response.json(updatedPerson);
        }).catch(error => next(error));
});

// AFTER ROUTES MIDDLEWARE

const unknownEndpointMiddleware = (request, response) => {
    console.log('404 not found - unknown endpoint');
    response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {

    console.log(error.message);

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message });
    }

    next(error);
};

app.use(unknownEndpointMiddleware);
app.use(errorHandler);

// eslint-disable-next-line no-undef
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});