const superheroInfoDiv = document.getElementById('superheroInfo');
const superheroPowersDiv = document.getElementById('superheroPowers');
const searchResultsDiv = document.getElementById('searchResults');
const publishersResultsDiv = document.getElementById('publishersResults');
const favoriteListInfoDiv = document.getElementById('favoriteListInfo');

// Sanitize and display content:    Utility function to encode user-generated content before inserting it into the DOM
function displaySanitizedContent(element, content) {
    element.innerHTML = ''; // Clear previous content
    const container = document.createElement('div');
    container.textContent = content;
    element.appendChild(container);
}

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
                displaySanitizedContent(superheroInfoDiv, data.error);
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
                displaySanitizedContent(publishersResultsDiv, data.error);
            } else {
                data.forEach(e => {
                    const item = document.createElement('ol');
                    item.appendChild(document.createTextNode(`\n${e}`));
                    publishersResultsDiv.appendChild(item);
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
                displaySanitizedContent(superheroPowersDiv, data[0]);   // Display the error message
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

// Create a new favorite list
document.getElementById('createFavoriteList').addEventListener('click', () => {
    const listName = document.getElementById('listName').value;

    // Clear the input field
    document.getElementById('listName').value = '';

    fetch('/api/superhero/lists/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: listName }), // Send the name in the request body
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error(error);
            alert('Error creating the list.');
        });
});

// Save superhero IDs to a favorite list
document.getElementById('saveToFavoriteList').addEventListener('click', () => {
    const listName = document.getElementById('listNameToSave').value;
    document.getElementById('listNameToSave').value = '';   // Clear the input field
    const superheroIDs = document.getElementById('superheroIDsToSave').value.split(',');
    document.getElementById('superheroIDsToSave').value = '';   // Clear the input field

    fetch('/api/superhero/lists/save', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: listName, superheroIDs }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error(error);
            alert('Error saving to the list.');
        });
});

// Retrieve superhero IDs from a favorite list
document.getElementById('retrieveFromFavoriteList').addEventListener('click', () => {
    const listName = document.getElementById('listNameToRetrieve').value; //initialize input
    document.getElementById('listNameToRetrieve').value = '';   // Clear the input field

    favoriteListInfoDiv.innerHTML = ''; // Clear previous content

    fetch(`/api/superhero/lists/get?name=${listName}`)
        .then(response => {
            if (!response.ok) {
                console.error(`Error: ${response.status} - ${response.statusText}`);
                throw new Error('Error retrieving the list.');
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                favoriteListInfoDiv.innerHTML = '<h3>Superheroes in the list:</h3>';

                data.forEach(superhero => {
                    const superheroItem = document.createElement('div');
                    superheroItem.innerHTML = `<h4>ID: ${superhero.id}</h4>`;
                    superheroItem.innerHTML += `<p>${superhero.name}</p>`;
                    superheroItem.innerHTML += '<p>Superhero Info:</p>';
                    for (const key in superhero.info) {
                        superheroItem.innerHTML += `<p>${key}: ${superhero.info[key]}</p>`;
                    }
                    superheroItem.innerHTML += '<p><strong>Superhero Powers:</strong></p>';
                    superheroItem.innerHTML += `<p><i>${superhero.powers.join(', ')}</i></p>`;
                    favoriteListInfoDiv.appendChild(superheroItem);
                });
            } else if (data.error){
                alert(data.error);
            }
        })
        .catch(error => {
            console.error(error);
            alert('Error retrieving the list.');
        });
});

// Delete a favorite list
document.getElementById('deleteFavoriteList').addEventListener('click', () => {
    const listNameToDelete = document.getElementById('listNameToDelete').value;
    document.getElementById('listNameToDelete').value = ''; // Clear the input field

    fetch('/api/superhero/lists/delete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: listNameToDelete }), // Send the name in the request body
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error(error);
            alert('Error deleting the list.');
        });
});

document.getElementById('searchSuperheroes').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const searchField = document.getElementById('searchField').value;
    const searchPattern = document.getElementById('searchPattern').value;
    document.getElementById('searchPattern').value = '';    // Clear previous input
    const searchLimit = document.getElementById('searchLimit').value;
    document.getElementById('searchLimit').value = '';  // Clear previous input
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
            if (data.error) {
                displaySanitizedContent(searchResultsDiv, data.error);
            } else {
                searchResultsDiv.innerHTML = '<h3>Superhero Info:</h3>';
                if (Array.isArray(data)) {

                    if(searchField === 'power'){
                        searchResultsDiv.innerHTML = `<h3>Superhero with Power '${searchPattern}' Info:</h3>`;
                    }

                    data.forEach(superhero => {
                        const superheroInfoDiv = document.createElement('div');
                        superheroInfoDiv.innerHTML = `<h4>ID: ${superhero.id}</h4>`;
                        for (const key in superhero) {
                            if (key !== 'id') {
                                superheroInfoDiv.innerHTML += `<p>${key}: ${superhero[key]}</p>`;
                            }
                        }
                        
                        searchResultsDiv.appendChild(superheroInfoDiv);
                    });
                }
            }
        })
        .catch(error => {
            console.error(error);
            searchResultsDiv.innerHTML = 'An error occurred.';
        });
});