const streamSelector = document.getElementById('streamSelector');

streamSelector.addEventListener('change', async (event) => {
    const selectedStream = event.target.value;

    try {
        const response = await fetch('http://localhost:3000/updateStream', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ streamName: selectedStream })
        });

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }
    } catch (error) {
        console.error('Error updating stream:', error);
    }





});

const ws = new WebSocket('ws://localhost:7000');

ws.onopen = () => {
    console.log('WebSocket connection established');
};

ws.onmessage = (message) => {
    const signal = JSON.parse(message.data);
    console.log('Received signal:', signal);

        const signalsElement = document.getElementById('signals');
        signalsElement.textContent = `Signal: ${signal.signal}, Price: ${signal.price}`;


    // Here you can add code to update the frontend UI based on the received signal
};


