const streamSelector = document.getElementById('streamSelector');

streamSelector.addEventListener('change', async (event) => {
    const selectedStream = event.target.value;

    try{
        const response = await fetch('http://localhost:3000/updateStream', {
            method: 'PUT',
              headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ streamName: selectedStream })
    });

    if(!response.ok){
        throw new Error(`Server responded with status ${response.status}`);
    }
} catch(error){
    console.error('Error updating stream:', error);
}



});


