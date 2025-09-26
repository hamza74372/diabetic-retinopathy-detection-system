from flask import Flask, request, jsonify
from flask_cors import CORS  # import CORS
import base64

app = Flask(__name__)
CORS(app)  # allow cross-origin requests from frontend

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    image_base64 = data.get('image_base64')
    
    # For now, return dummy prediction
    result = {"class": "No DR", "confidence": "100%"}
    return jsonify(result)

# Optional: a simple home route to test backend in browser
@app.route('/', methods=['GET'])
def home():
    return "Flask backend is running!"

if __name__ == '__main__':
    app.run(debug=True)
