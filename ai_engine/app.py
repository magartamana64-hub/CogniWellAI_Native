from flask import Flask, request, jsonify
from flask_cors import CORS

from recommendation_engine import analyze_user_data

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json

    result = analyze_user_data(data)

    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)