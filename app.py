from flask import Flask, request, jsonify, send_file
from flask_cors import CORS  # Allow frontend to talk to backend
from groq import Groq
from dotenv import load_dotenv
import os
from gtts import gTTS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow frontend requests

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.json
    document = data.get("text", "")

    if not document:
        return jsonify({"error": "No text provided"}), 400

    # Request summary from Groq API
    completion = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[
            {
                "role": "system",
                "content": "You are a highly skilled assistant specializing in summarizing news content concisely and accurately. Your summaries should capture the key points, maintain the original context, and be easy to understand."
            },
            {
                "role": "user",
                "content": f"Summarize the following news article in no more than 60 words while retaining key details and ensuring clarity: {document}"
            }

        ]
    )

    summary = completion.choices[0].message.content

    return jsonify({"summary": summary})

@app.route("/text-to-speech", methods=["POST"])
def text_to_speech():
    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Ensure the static folder exists
    if not os.path.exists('static'):
        os.makedirs('static')

    # Generate speech from text
    tts = gTTS(text=text, lang="en")
    output_path = os.path.join('static', 'output.mp3')
    tts.save(output_path)  # Save the output.mp3 in 'static' folder

    return jsonify({"audio_url": f"http://127.0.0.1:5000/static/output.mp3"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)  # Make backend accessible
