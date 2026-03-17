const API_KEY = "025b3fdffed117f174d9de46a955b3521e2b51cf";

let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const output = document.getElementById("output");
const balance = document.getElementById("balance");

// 🎤 START RECORDING
startBtn.onclick = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        output.innerText = "Recording...";
    } catch (error) {
        output.innerText = "Mic access denied!";
    }
};

// ⏹ STOP RECORDING + TRANSCRIBE
stopBtn.onclick = () => {
    if (!mediaRecorder) {
        output.innerText = "Start recording first!";
        return;
    }

    mediaRecorder.stop();

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

        output.innerText = "Processing...";

        try {
            const arrayBuffer = await audioBlob.arrayBuffer();

            const response = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en-IN", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${API_KEY}`,
                    "Content-Type": "audio/webm"
                },
                body: arrayBuffer
            });

            const data = await response.json();

            console.log("Deepgram response:", data);

            let transcript = "";

            if (
                data.results &&
                data.results.channels &&
                data.results.channels[0].alternatives &&
                data.results.channels[0].alternatives[0]
            ) {
                transcript = data.results.channels[0].alternatives[0].transcript;
            }

            output.innerText = transcript || "No speech detected";

        } catch (error) {
            console.error(error);
            output.innerText = "Error in transcription";
        }
    };
};

// ❌ CORS ISSUE → so fake balance (for demo)
balance.innerText = "Demo Mode (CORS blocked real API)";