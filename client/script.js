document.getElementById('getSuperheroInfo').addEventListener('click', () => {
    const superheroId = document.getElementById('superheroId').value;
    console.log(`Requested superhero ID: ${superheroId}`); // Add this line for debugging
    fetch(`/api/superhero/${superheroId}`)
        .then(response => {
            if (!response.ok) {
                console.error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const superheroInfoDiv = document.getElementById('superheroInfo');
            superheroInfoDiv.innerHTML = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            console.error(error);
            const superheroInfoDiv = document.getElementById('superheroInfo');
            superheroInfoDiv.innerHTML = 'Superhero not found';
        });
});