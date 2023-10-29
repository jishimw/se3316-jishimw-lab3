const superheroInfoDiv = document.getElementById('superheroInfo');
const superheroPowersDiv = document.getElementById('superheroPowers');
const searchResultsDiv = document.getElementById('searchResults');
const publishersResultsDiv = document.getElementById('publishersResults');

document.getElementById('getSuperheroInfo').addEventListener('click', () => {
    const superheroId = document.getElementById('superheroId').value;
    superheroInfoDiv.innerHTML = ''; // Clear previous content

    // Clear the input field
    document.getElementById('superheroId').value = '';

    if (!superheroId) {
        superheroInfoDiv.innerHTML = 'Please enter an ID number.';
        return;
    }

    if (!Number.isInteger(Number(superheroId))) {
        superheroInfoDiv.innerHTML = 'Please enter an integer number.';
        return;
    }

    fetch(`/api/superhero/${superheroId}`)
        .then(response => {
            if (!response.ok) {
                console.error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                superheroInfoDiv.innerHTML = data.error;
            } else {
                for (const key in data) {
                    const item = document.createElement('ul');
                    item.textContent = `${key}: ${data[key]}`;
                    superheroInfoDiv.appendChild(item);
                }
            }
        })
        .catch(error => {
            console.error(error);
            superheroInfoDiv.innerHTML = 'Superhero not found';
        });
});

document.getElementById('getPublishers').addEventListener('click', () => {
    fetch('/api/superhero/publishers')
        .then(response => {
            if (!response.ok) {
                console.error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                publishersResultsDiv.innerHTML = data.error; // Use publishersResultsDiv
            } else {
                data.forEach(e => {
                    const item = document.createElement('ol');
                    item.appendChild(document.createTextNode(`\n${e}`));
                    publishersResultsDiv.appendChild(item); // Use publishersResultsDiv
                });
            }
        })
        .catch(error => {
            console.error(error);
            publishersResultsDiv.innerHTML = 'Error fetching publishers.'; // Use publishersResultsDiv
        });
});

document.getElementById('getSuperheroPowers').addEventListener('click', (event) => {
    const superheroIdPowers = document.getElementById('superheroIdPowers').value;
    superheroPowersDiv.innerHTML = ''; // Clear previous content

    // Clear the input field
    document.getElementById('superheroIdPowers').value = '';

    if (!superheroIdPowers) {
        superheroPowersDiv.innerHTML = 'Please enter an ID number.';
        return;
    }

    if (!Number.isInteger(Number(superheroIdPowers))) {
        superheroPowersDiv.innerHTML = 'Please enter an integer number.';
        return;
    }

    fetch(`/api/superhero/${superheroIdPowers}/powers`)
        .then(response => {
            if (!response.ok) {
                console.error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length === 1 && typeof data[0] === 'string') {
                superheroPowersDiv.innerHTML = data[0]; // Display the error message
            } else {
                data.forEach(e => {
                    const item = document.createElement('ul');
                    item.appendChild(document.createTextNode(`\n${e}`));
                    superheroPowersDiv.appendChild(item);
                });
            }
        })
        .catch(error => {
            console.error(error);
            superheroPowersDiv.innerHTML = 'An error occurred.';
        });
});

document.getElementById('searchSuperheroes').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const searchField = document.getElementById('searchField').value;
    const searchPattern = document.getElementById('searchPattern').value;
    const searchLimit = document.getElementById('searchLimit').value;
    searchResultsDiv.innerHTML = ''; // Clear previous content
    

    if (!searchField || !searchPattern) {
        searchResultsDiv.innerHTML = 'Both field and pattern are required.';
        return;
    }

    fetch(`/api/superhero/search?field=${searchField}&pattern=${searchPattern}&n=${searchLimit}`)
        .then(response => {
            if (!response.ok) {
                console.error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length === 1 && typeof data[0] === 'string') {
                searchResultsDiv.innerHTML = data[0]; // Display the error message
            } else {
                data.forEach(superhero => {
                    if (superhero) { // Check if superhero is not null or undefined
                        const superheroItem = document.createElement('div');
                        superheroItem.innerHTML = `<h3>${superhero.name}</h3>`;
                        superheroItem.innerHTML += `<p>ID: ${superhero.id}</p>`;
                        superheroItem.innerHTML += `<p>Gender: ${superhero.Gender}</p>`;
                        superheroItem.innerHTML += `<p>Eye color: ${superhero['Eye color']}</p>`;
                        superheroItem.innerHTML += `<p>Race: ${superhero.Race}</p>`;
                        superheroItem.innerHTML += `<p>Publisher: ${superhero.Publisher}</p>`;
                        superheroItem.innerHTML += `<p>Alignment: ${superhero.Alignment}</p>`;
                        superheroItem.innerHTML += `<p>Weight: ${superhero.Weight}</p>`;
                        superheroItem.innerHTML += `<p>Height: ${superhero.Height}</p>`;
                        searchResultsDiv.appendChild(superheroItem);
                    }
                });
            }
        })
        .catch(error => {
            console.error(error);
            searchResultsDiv.innerHTML = 'An error occurred.';
        });
});