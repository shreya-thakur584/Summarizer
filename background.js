chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "summarize") {
        console.log("📡 Sending extracted text to Flask server...");
        
        fetch("http://127.0.0.1:5000/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message.text })
        })
        .then(response => response.json())
        .then(data => {
            console.log("📨 Summary received:", data);

            // Send the summary back to popup.js
            chrome.runtime.sendMessage({ action: "summary_result", summary: data.summary });
        })
        .catch(error => {
            console.error("🚨 Error fetching summary:", error);
        });
    }
});
