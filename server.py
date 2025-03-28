from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import nltk
from nltk.tokenize import sent_tokenize
from collections import Counter

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Set up the NLTK data directory
NLTK_DATA_PATH = r"D:\nltk_data"
if not os.path.exists(NLTK_DATA_PATH):
    os.makedirs(NLTK_DATA_PATH)

nltk.data.path.append(NLTK_DATA_PATH)

# Ensure 'punkt' is available
try:
    nltk.download('punkt', download_dir=NLTK_DATA_PATH)
except Exception as e:
    print("Error downloading NLTK data:", e)

# Function to summarize text
def summarize_text(text, num_sentences=3):
    sentences = sent_tokenize(text)
    if len(sentences) <= num_sentences:
        return " ".join(sentences)

    word_freq = Counter(text.split())
    sentence_scores = {sent: sum(word_freq.get(word, 0) for word in sent.split()) for sent in sentences}
    
    # Select top-scoring sentences
    summary_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:num_sentences]
    
    return " ".join(summary_sentences)

@app.route("/summarize", methods=["POST"])
def summarize():
    if request.content_type != "application/json":
        return jsonify({"error": "Invalid Content-Type. Use 'application/json'"}), 415

    data = request.get_json(silent=True)
    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data["text"].strip()
    if not text:
        return jsonify({"error": "Empty text provided"}), 400

    summary = summarize_text(text)
    return jsonify({"summary": summary})

if __name__ == "__main__":
    print("Starting Flask server on http://127.0.0.1:5000")
    app.run(debug=True)
