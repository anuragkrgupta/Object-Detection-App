// Check if the browser supports the Web Speech API
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // Keep recognition on
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    const loadingIndicator = document.getElementById('loadingIndicator');
    const locationDetails = document.getElementById('locationDetails');
    const locationBtn = document.getElementById('locationBtn');
    const microphoneIcon = locationBtn.querySelector('i');
    let isRecognitionActive = false;

    recognition.onresult = (event) => {
        const speechResult = event.results[event.resultIndex][0].transcript.toLowerCase();
        if (speechResult.includes('location')) {
            getLocation();
        }
        loadingIndicator.style.display = 'none';
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event);
        loadingIndicator.style.display = 'none';
    };

    recognition.onend = () => {
        loadingIndicator.style.display = 'none';
        if (isRecognitionActive) {
            recognition.start(); // Restart recognition if it should be active
        }
    };

    locationBtn.addEventListener('click', () => {
        if (microphoneIcon.classList.contains('bx-microphone-off')) {
            microphoneIcon.classList.remove('bx-microphone-off');
            microphoneIcon.classList.add('bx-microphone');
            isRecognitionActive = true;
            recognition.start();
            loadingIndicator.style.display = 'block';
            console.log("Speech recognition started");
        } else {
            microphoneIcon.classList.remove('bx-microphone');
            microphoneIcon.classList.add('bx-microphone-off');
            isRecognitionActive = false;
            recognition.stop();
            loadingIndicator.style.display = 'none';
            console.log("Speech recognition stopped");
        }
    });
} else {
    console.error('Web Speech API is not supported in this browser.');
}

// Function to get the location using Geolocation API
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        locationDetails.innerHTML = 'Geolocation is not supported by this browser.';
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.address) {
                const fullAddress = data.display_name;
                const state = data.address.state;

                console.log("Full Address: " + fullAddress);
                console.log("State: " + state);

                // Show the details in the div
                locationDetails.innerHTML = `
                    <p><strong>Full Address:</strong> ${fullAddress}</p>
                    <p><strong>State:</strong> ${state}</p>
                `;

                // Convert address to speech
                const textToSpeak = `Your location is ${fullAddress}. State: ${state}.`;
                speakText(textToSpeak);
            } else {
                locationDetails.innerHTML = 'Location not found';
            }
        })
        .catch(error => {
            locationDetails.innerHTML = 'Error fetching location data';
            console.error('Error fetching location data', error);
        });
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            locationDetails.innerHTML = 'User denied the request for Geolocation.';
            break;
        case error.POSITION_UNAVAILABLE:
            locationDetails.innerHTML = 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            locationDetails.innerHTML = 'The request to get user location timed out.';
            break;
        case error.UNKNOWN_ERROR:
            locationDetails.innerHTML = 'An unknown error occurred.';
            break;
    }
}

function speakText(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US'; // Set language
    speech.rate = 1; // Set speed
    speech.pitch = 1; // Set pitch
    window.speechSynthesis.speak(speech);
}