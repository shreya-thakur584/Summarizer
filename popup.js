document.addEventListener("DOMContentLoaded", function () {
    let summarizeBtn = document.getElementById("summarizeBtn");
    let audioBtn = document.getElementById("audio-btn"); // 🔊 Listen button
    let playPauseBtn = document.getElementById("play-pause-btn"); // Play/Pause button
    let speedControl = document.getElementById("speed"); // Speed slider
    let speedValueDisplay = document.getElementById("speedValue"); // Display speed

    let audio = null; // Audio object
    let isPlaying = false; // To track if audio is currently playing

    if (!summarizeBtn) {
        console.error("❌ Button with ID 'summarizeBtn' not found!");
        return;
    }

    summarizeBtn.addEventListener("click", function () {
        console.log("✅ Summarize button clicked!");

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            console.log("🔍 Current tab:", tabs);

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: extractText
            }, (result) => {
                console.log("📄 Extracted text:", result);
                if (!result || !result[0] || !result[0].result) {
                    document.getElementById("summary-text").textContent = "Failed to extract text.";
                    return;
                }

                let text = result[0].result;
                console.log("📡 Sending text to background.js:", text);

                // Send extracted text to background.js
                chrome.runtime.sendMessage({ action: "summarize", text: text });
            });
        });
    });

    // Listen Button Click - Convert Summary to Speech
    if (audioBtn) {
        audioBtn.addEventListener("click", function () {
            console.log("🔊 Listen button clicked!");

            let summaryText = document.getElementById("summary-text").textContent;
            if (!summaryText || summaryText === "Your summarized content will appear here...") {
                console.log("⚠️ No summary available to convert to speech.");
                return;
            }

            console.log("📡 Sending text to TTS API...");

            // Stop the previous audio if it's playing
            if (audio && isPlaying) {
                audio.pause();
                audio.currentTime = 0; // Reset audio position to start
                isPlaying = false;
                playPauseBtn.textContent = "Play"; // Change button to 'Play'
            }

            // Hide the Listen button once clicked
            audioBtn.style.display = "none";

            fetch("http://127.0.0.1:5000/text-to-speech", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: summaryText })
            })
            .then(response => response.json())
            .then(data => {
                if (data.audio_url) {
                    console.log("🎵 Playing audio from:", data.audio_url);

                    // Create a new audio object with the audio file from the server
                    audio = new Audio(data.audio_url);

                    // Set the initial playback rate based on the slider value
                    let speed = parseFloat(speedControl.value);
                    audio.playbackRate = speed;

                    // Gradually adjust the speed if the slider value changes
                    speedValueDisplay.textContent = `${speed}x`;

                    // Preload the audio for smoother playback
                    audio.preload = "auto";

                    // Play the audio
                    audio.play();

                    // Show the Play/Pause button
                    playPauseBtn.style.display = "inline-block";
                    isPlaying = true;
                } else {
                    console.log("❌ Failed to generate audio.");
                }
            })
            .catch(error => {
                console.error("🚨 Error:", error);
            });
        });
    }

    // Play/Pause button click handler
    if (playPauseBtn) {
        playPauseBtn.addEventListener("click", function () {
            if (audio) {
                if (isPlaying) {
                    audio.pause();
                    playPauseBtn.textContent = "Play";
                    isPlaying = false;
                } else {
                    audio.play();
                    playPauseBtn.textContent = "Pause";
                    isPlaying = true;
                }
            }
        });
    }

    // Update speed dynamically
    if (speedControl) {
        speedControl.addEventListener("input", function () {
            let newSpeed = parseFloat(speedControl.value);
            speedValueDisplay.textContent = `${newSpeed}x`;

            if (audio) {
                // Smoothly change the playback rate
                let currentRate = audio.playbackRate;
                let targetRate = newSpeed;
                let step = (targetRate - currentRate) / 10; // Gradual transition in 10 steps

                let interval = setInterval(function () {
                    currentRate += step;
                    if ((step > 0 && currentRate >= targetRate) || (step < 0 && currentRate <= targetRate)) {
                        currentRate = targetRate; // Ensure it reaches exactly the target rate
                        clearInterval(interval); // Stop the interval once target is reached
                    }
                    audio.playbackRate = currentRate;
                }, 50); // Adjust every 50ms for smooth transition
            }
        });
    }
});

// Function to extract text from a webpage
function extractText() {
    return { result: document.body.innerText.substring(0, 5000) };
}

// Listen for a message from background.js and update the summary
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "summary_result") {
        document.getElementById("summary-text").textContent = message.summary || "No summary available.";
    }
});
