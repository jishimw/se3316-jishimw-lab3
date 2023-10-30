const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs');
const { type } = require('os');
const path = require('path'); // Import the path module

// Read the superhero data JSON files and assign as objects
const superheroInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'superhero_info.json')));
const superheroPowers = JSON.parse(fs.readFileSync(path.join(__dirname, 'superhero_powers.json')));

// Add this line before defining your API routes
app.use(express.json());

// Define a router for your API routes
const apiRouterSuperhero = express.Router();

// Serve front-end code
app.use(express.static(__dirname + '/../client'));

// Make sure to specify the default file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../client/index.html');
});

// Function for getting superhero powers (Item 2)
function getSuperheroPowers(superheroID) {
    const superheroInfoItem = superheroInfo.find(hero => hero.id === superheroID);

    if (!superheroInfoItem) {
        return ['Superhero not found'];
    }

    const superheroInfoName = superheroInfoItem.name;
    const superheroPowersItem = superheroPowers.find(
        heroPowers => heroPowers.hero_names.toLowerCase() === superheroInfoName.toLowerCase()
    );

    if (!superheroPowersItem) {
        return ['Superhero has no powers'];
    }

    // Extract powers from the object where the value is "True"
    const powers = Object.keys(superheroPowersItem).filter(
        key => superheroPowersItem[key] === 'True'
    );

    return powers;
}

// Function for getting all available publisher names (Item 3)
function getAllPublisherNames() {
    const publisherNames = [...new Set(superheroInfo.map(hero => hero.Publisher))];
    const filteredPublisherNames = publisherNames.filter(name => name !== '');

    return filteredPublisherNames;
}

function searchSuperheroes(field, pattern, n) {
    console.log('Search parameters:', field, pattern, n);

    // Check if required parameters are provided
    if (!field || !pattern) {
        return [];
    }

    let matchingSuperheroIDs = [];

    // Example: Search by superhero name
    if (field === 'name') {
        matchingSuperheroIDs = superheroInfo
            .filter(hero => hero.name.toLowerCase().includes(pattern.toLowerCase()))
            .map(hero => hero.id);
    } else if (field === 'race') {  // Search by superhero race
        matchingSuperheroIDs = superheroInfo
            .filter(hero => hero.Race && hero.Race !== '-' && hero.Race.toLowerCase().includes(pattern.toLowerCase()))
            .map(hero => hero.id);
        if (matchingSuperheroIDs.length === 0) {
            return ['No matching superheroes found for this race.'];
        }
    } else if (field === 'publisher') { // Search by publisher
        matchingSuperheroIDs = superheroInfo
            .filter(hero => hero.Publisher.toLowerCase().includes(pattern.toLowerCase()))
            .map(hero => hero.id);
    } else if (field === 'power') { // Search by power
        const powersToSearch = pattern.toLowerCase();

        matchingSuperheroIDs = superheroPowers.filter(hero => {
            const superheroName = hero.hero_names.toLowerCase();

            // Extract powers from the object where the value is "True"
            const powers = Object.keys(hero).filter(key => key !== 'hero_names' && hero[key] === 'True');
            
            // Check if any of the powers match the searched power
            return powers.some(power => power.toLowerCase().includes(powersToSearch));
        })
        .map(hero => {
            // Find the superhero ID based on the name
            const superheroInfoItem = superheroInfo.find(info => info.name.toLowerCase() === hero.hero_names.toLowerCase());
            return superheroInfoItem ? superheroInfoItem.id : null;
        })
        .filter(id => id !== null);

        if (matchingSuperheroIDs.length === 0) {
            return ['No matching superheroes found for this power.'];
        }
    }

    // Limit the number of results if 'n' is provided
    if (n && matchingSuperheroIDs.length > n) {
        matchingSuperheroIDs = matchingSuperheroIDs.slice(0, n);
    }

    return matchingSuperheroIDs;
}

// Middleware for logging
apiRouterSuperhero.use((req, res, next) => {
    console.log(`Time: `, Date.now());
    console.log(`${req.method} request for ${req.url}`);
    next(); // Continue to the next middleware or route
});

// Routes for /api/superhero
apiRouterSuperhero.route('/:id') // All the routes to the base api/superhero prefix
    // Define a route to get superhero information for a given superhero ID
    .get((req, res) => {
        const superheroID = parseInt(req.params.id);
        const superhero = superheroInfo.find(hero => hero.id === superheroID);

        // Inside your GET route for superhero information
        console.log(`\nRequested superhero ID: ${superheroID}`);
        console.log(`Superhero data:`, superhero);

        if (!superhero) {
            return res.status(404).json({ error: 'Superhero not found' });
        }

        res.json(superhero);
});

// Define a route to get superhero powers for a given superhero ID
apiRouterSuperhero.get('/:id/powers', (req, res) => {
    const superheroID = parseInt(req.params.id);
    const powers = getSuperheroPowers(superheroID);

    if (powers.length === 0) {
        return res.status(404).json({ error: 'Superhero has no powers' });
    }

    res.json(powers);
});

// Define a route to get all available publisher names
app.get('/api/superhero/publishers', (req, res) => {
    const publisherNames = getAllPublisherNames();

    if (publisherNames.length === 0) {
        return res.status(404).json({ error: 'No publisher names found' });
    }

    res.json(publisherNames);
});

const favoriteSuperheroLists = {}; // Object to store favorite superhero lists

// Create a new list with a given name (Item 5)
app.post('/api/superhero/lists/create', (req, res) => {
    const listName = req.body.name;

    if (favoriteSuperheroLists[listName]) {
        return res.status(400).json({ error: 'List name already exists.' });
    }

    favoriteSuperheroLists[listName] = [];
    res.json({ message: 'List created successfully.' });
});

// Save a list of superhero IDs to a given list name (Item 6)
app.put('/api/superhero/lists/save', (req, res) => {
    const listName = req.body.name;
    const superheroIDs = req.body.superheroIDs;

    if (!favoriteSuperheroLists[listName]) {
        return res.status(404).json({ error: 'List name does not exist.' });
    }

    favoriteSuperheroLists[listName] = superheroIDs;
    res.json({ message: 'List saved successfully.' });
});


// Get the list of superhero IDs for a given list (Item 7)
// Retrieve superhero IDs from a favorite list and display information (Item 9)
app.get('/api/superhero/lists/get', (req, res) => {
    const listName = req.query.name;

    if (!favoriteSuperheroLists[listName]) {
        return res.status(404).json({ error: 'List name does not exist.' });
    }

    const superheroIDs = favoriteSuperheroLists[listName];
    const superheroesInList = [];

    superheroIDs.forEach(superheroID => {

        // Convert superheroID from a string to a number
        superheroID = parseInt(superheroID);

        console.log(`Searching for superhero with the ID: ${superheroID}`);

        const superhero = superheroInfo.find(hero => hero.id === superheroID);

        if (!superhero) {
            // Handle the case where the superhero with the given ID is not found
            superheroesInList.push({
                id: superheroID,
                name: "Superhero not found",
                info: {
                    gender: "[]",
                    race: "[]",
                    height: "[]",
                    publisher: "[]",
                    alignment: "[]",
                    weight: "[]",
                },
                powers: ["No powers found"],
            });
        } else {
            const powers = getSuperheroPowers(superheroID);
            if (powers.length === 0) {
                superheroesInList.push({
                    id: superheroID,
                    name: superhero.name,
                    info: {
                        gender: superhero.Gender,
                        race: superhero.Race,
                        height: superhero.Height,
                        publisher: superhero.Publisher,
                        alignment: superhero.Alignment,
                        weight: superhero.Weight,
                    },
                    powers: ["No powers found"],
                });
            } else {
                superheroesInList.push({
                    id: superheroID,
                    name: superhero.name,
                    info: {
                        gender: superhero.Gender,
                        race: superhero.Race,
                        height: superhero.Height,
                        publisher: superhero.Publisher,
                        alignment: superhero.Alignment,
                        weight: superhero.Weight,
                    },
                    powers: powers,
                });
            }
        }
    });

    res.json(superheroesInList);
});

// Delete a list of superheroes with a given name (Item 8)
app.delete('/api/superhero/lists/delete', (req, res) => {
    const listName = req.body.name;

    if (!favoriteSuperheroLists[listName]) {
        return res.status(404).json({ error: 'List name does not exist.' });
    }

    delete favoriteSuperheroLists[listName];
    res.json({ message: 'List deleted successfully.' });
});


// Define a route to search superheroes by field and pattern
app.get('/api/superhero/search', (req, res) => {
    const field = req.query.field; // Get the search field from the query parameters
    const pattern = req.query.pattern; // Get the search pattern from the query parameters
    const n = req.query.n; // Get the limit from the query parameters

    if (!field || !pattern) {
        return res.status(400).json({ error: 'Both field and pattern are required' });
    }

    const matchingSuperheroIDs = searchSuperheroes(field, pattern, n);

    if (matchingSuperheroIDs.length === 0) {
        return res.status(404).json({ error: 'No matching superheroes found' });
    }

    const matchingSuperheroes = matchingSuperheroIDs.map(superheroID => {
        return superheroInfo.find(hero => hero.id === superheroID);
    });

    res.json(matchingSuperheroes);
});


// Mount the apiRouterSuperhero router at the 'http://localhost:3000/api/superhero' path
app.use('/api/superhero', apiRouterSuperhero);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});