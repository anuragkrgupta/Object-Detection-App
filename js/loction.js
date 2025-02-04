document.getElementById("locationBtn").addEventListener("click", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;

                console.log("Latitude: " + lat);
                console.log("Longitude: " + lon);

                // Reverse Geocoding using OpenStreetMap's Nominatim API
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                    .then(response => response.json())
                    .then(data => {
                        let fullAddress = data.display_name;
                        let state = data.address.state;

                        console.log("Full Address: " + fullAddress);
                        console.log("State: " + state);

                        // Show the details in the div
                        document.getElementById("locationDetails").innerHTML = `
                            <p><strong>Full Address:</strong> ${fullAddress}</p>
                            <p><strong>State:</strong> ${state}</p>
                        `;

                        // Convert address to speech
                        let textToSpeak = `Your location is ${fullAddress}. State: ${state}.`;
                        speakText(textToSpeak);
                    })
                    .catch(error => {
                        document.getElementById("locationDetails").innerHTML = `<p>Error fetching location details.</p>`;
                        console.error("Error fetching location details:", error);
                    });
            },
            (error) => {
                document.getElementById("locationDetails").innerHTML = `<p>Error getting location: ${error.message}</p>`;
                console.error("Error getting location: ", error.message);
            }
        );
    } else {
        document.getElementById("locationDetails").innerHTML = `<p>Geolocation is not supported by this browser.</p>`;
        console.error("Geolocation is not supported by this browser.");
    }
});


function speakText(text) {
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US"; // language
    // speech.lang = "hi-IN"; // Set karo hind
    speech.rate = 1; // Speed set kare
    speech.pitch = 1; // pitchh ke liye
    window.speechSynthesis.speak(speech);
}
