const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs');
const path = require('path'); // Import the path module

// Read the superhero data JSON files and assign as objects
const superheroInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'superhero_info.json')));
const superheroPowers = JSON.parse(fs.readFileSync(path.join(__dirname, 'superhero_powers.json')));

// Define a router for your API routes
const apiRouterSuperhero = express.Router();

// Serve front-end code
apiRouterSuperhero.use(express.static('client', { index: 'superheros.html' }));

// Function for getting superhero powers (Item 2)
function getSuperheroPowers(superheroID) {
    const superheroInfoItem = superheroInfo.find(hero => hero.id === superheroID);

    if (!superheroInfoItem) {
        return null;
    }

    const superheroInfoName = superheroInfoItem.name;
    const superheroPowersItem = superheroPowers.find(
        heroPowers => heroPowers.hero_names.toLowerCase() === superheroInfoName.toLowerCase()
    );

    if (!superheroPowersItem) {
        return [];
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

// Function for searching superheroes (Item 4)
function searchSuperheroes(field, pattern, n) {
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
    }

    // Search by superhero race
    if (field === 'race') {
        matchingSuperheroIDs = superheroInfo
            .filter(hero => hero.race.toLowerCase().includes(pattern.toLowerCase()))
            .map(hero => hero.id);
    }

    // Search by publisher
    if (field === 'publisher') {
        matchingSuperheroIDs = superheroInfo
            .filter(hero => hero.Publisher.toLowerCase().includes(pattern.toLowerCase()))
            .map(hero => hero.id);
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

// Create a route for searching superheroes
app.get('/api/superhero/search', (req, res) => {
    const field = req.query.field;
    const pattern = req.query.pattern;
    const n = req.query.n;
    const matchingSuperheroIDs = searchSuperheroes(field, pattern, n);

    res.json(matchingSuperheroIDs);
});

// Define a route to get all available publisher names outside apiRouterSuperhero
app.get('/api/publishers', (req, res) => {
    const publisherNames = [...new Set(superheroInfo.map(hero => hero.Publisher))];
    const filteredPublisherNames = publisherNames.filter(name => name !== '');

    if (!filteredPublisherNames || filteredPublisherNames.length === 0) {
        return res.status(404).json({ error: 'No publisher names found' });
    }

    res.json(filteredPublisherNames);
});

// Mount the apiRouterSuperhero router at the 'http://localhost:3000/api/superhero' path
app.use('/api/superhero', apiRouterSuperhero);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});