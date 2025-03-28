async function summarizePage() {
    let text = document.body.innerText; // Extract all text from the webpage

    try {
        // Send text to the backend for summarization
        let response = await fetch("http://127.0.0.1:5000/summarize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        let data = await response.json();
        if (data.error) throw new Error(data.error);

        console.log("Summary:", data.summary);

        // Convert the summary to speech
        let audioResponse = await fetch("http://127.0.0.1:5000/text-to-speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: data.summary })
        });

        let audioBlob = await audioResponse.blob();
        let audioUrl = URL.createObjectURL(audioBlob);

        // Play the audio
        let audio = new Audio(audioUrl);
        audio.play();
    } catch (error) {
        console.error("Error:", error);
    }
}

// Call function when the extension is triggered
summarizePage();
