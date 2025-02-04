// Select elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const flipButton = document.getElementById("flipcamera");

let lastDetectedObject = ""; // Store the last detected object
let lastSpokenTime = Date.now(); // Store last spoken time
let useFrontCamera = false; // Start with back camera
let currentStream = null;

// Start the camera
async function startCamera() {
    try {
        // Stop any existing stream before starting a new one
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        // Set camera constraints
        const constraints = {
            video: {
                facingMode: useFrontCamera ? "user" : "environment"
            }
        };

        // Get media stream
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
    } catch (error) {
        console.error("Error accessing the camera:", error);
    }
}

// Load TensorFlow.js model
async function loadModel() {
    const model = await cocoSsd.load();
    detectObjects(model);
}

// Detect objects in real-time
async function detectObjects(model) {
    setInterval(async () => {
        const predictions = await model.detect(video);

        // Draw on canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0);

        let detectedObjects = [];

        predictions.forEach((prediction) => {
            detectedObjects.push(prediction.class);

            // Draw bounding box
            ctx.strokeStyle = "green";
            ctx.lineWidth = 2;
            ctx.strokeRect(
                prediction.bbox[0],
                prediction.bbox[1],
                prediction.bbox[2],
                prediction.bbox[3]
            );

            // Draw label
            ctx.fillStyle = "green";
            ctx.font = "16px Arial";
            ctx.fillText(prediction.class, prediction.bbox[0], prediction.bbox[1] - 5);
        });

        // Convert detected objects array to a string
        let detectedString = detectedObjects.join(", ");

        // Speak if a new object is detected OR every 40 seconds
        let currentTime = Date.now();
        if (detectedString !== lastDetectedObject || (currentTime - lastSpokenTime > 40000)) {
            speak(detectedString);
            lastDetectedObject = detectedString;
            lastSpokenTime = currentTime;
        }
    }, 1000);
}

// Speak function for blind users
function speak(text) {
    if (text.trim() === "") return; // Avoid speaking empty text
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

// Flip camera button event
flipButton.addEventListener("click", async () => {
    useFrontCamera = !useFrontCamera; // Toggle camera mode
    await startCamera(); // Restart camera with new facing mode
});

// Initialize app
startCamera();
loadModel();
