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

    Step 10: I'm using Railways to deploy the project to the internet, creating a production build of the frontend in the root of this project and
    then committing the changes to the github repo so Railways updates the deployment automatically.

*/

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }
];

// MIDDLEWARE

app.use(express.json());
app.use(cors());

/*const myLoggerMiddleware = (request, response, next) => {
    console.log('Request method: ', request.method);
    console.log('Request headers: ', request.headers);
    console.log('Request body: ', request.body);
    console.log('-----------------------------');
    next();
}

app.use(myLoggerMiddleware);

*/

morgan.token('resJSON', (request, res) => {
    return JSON.stringify(request.body);
});


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :resJSON'));

// ROUTES

app.get('/api/persons', (request, response) => {
    console.log('Persons: ', persons);
    response.json(persons);
});

app.get('/info', (request, response) => {
    const personsIn = persons.length;
    response.send(`<p>Phonebook has the information of ${personsIn} people</p>\n${new Date()}`);
});

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    console.log(`id: ${id}`);

    const person = persons.find((p) => {
        return p.id === Number(id);
    });

    if (person) {
        console.log('Person found: ', person);
        response.json(person);
    } else {
        console.log('404 not found - person');
        response.status(404).end();
    }
});

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    console.log(`id: ${id}`);

    const person = persons.find((p) => {
        return p.id === Number(id);
    });

    if (person) {
        console.log('Person found: ', person);
        persons = persons.filter(p => p.id !== Number(id));
        console.log('Persons after delete: ', persons);
        response.status(204).end();
    } else {
        console.log('404 not found - person');
        response.status(404).end();
    }
});

app.post('/api/persons/', (request, response) => {
    const body = request.body;

    if (body.name) {
        if (body.number) {
            if (persons.find(p => p.name.toLowerCase() === body.name.toLowerCase())) {
                console.log('400 bad request: name must be unique');
                return response.status(400).json({
                    error: "Name must be unique"
                })
            } else {
                const newPerson = {
                    id: Math.floor(Math.random() * (10000) + 1),
                    name: body.name,
                    number: body.number
                }
                console.log('New person: ', newPerson);

                persons = persons.concat(newPerson);
                console.log('Persons after post: ', persons);

                response.status(200).json(newPerson);
            }
        } else {
            console.log('400 bad request: number missing');
            return response.status(400).json({
                error: "Number missing"
            })
        }
    } else {
        console.log('400 bad request: name missing');
        return response.status(400).json({
            error: "Name missing"
        })
    }
});

const PORT = 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});