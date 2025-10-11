from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import os
import numpy as np
from PIL import Image
import tensorflow as tf
from datetime import datetime, timezone
# --- Firebase Admin Setup ---
import firebase_admin
from firebase_admin import credentials, auth, db # <-- Import db

cred = credentials.Certificate("serviceAccountKey.json")
# Add the databaseURL to the initialize_app call
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://dr-detection-system-default-rtdb.firebaseio.com/' #<-- Replace with your DB URL
})
# --- End of Firebase Setup ---


app = Flask(__name__)
CORS(app) 

# Load model
MODEL_PATH = os.path.join("model", "multibranch_model_1.h5")
model = tf.keras.models.load_model(MODEL_PATH)


def preprocess_image(image_base64):
    # ... (this function remains the same)
    image_data = base64.b64decode(image_base64.split(",")[1])
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    image = image.resize((224, 224))
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

# Decorator for requiring authentication
def check_auth(f):
    def wrapper(*args,**kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header is missing"}), 401
        
        id_token = auth_header.split(" ").pop()
        if not id_token:
            return jsonify({"error": "Bearer token is missing"}), 401
        
        try:
            decoded_token = auth.verify_id_token(id_token)
            request.user = decoded_token # Attach user info to the request object
        except Exception as e:
            return jsonify({"error": "Invalid or expired token", "details": str(e)}), 401
        
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper


# In app.py

@app.route('/predict', methods=['POST'])
@check_auth
def predict():
    try:
        uid = request.user['uid']
        data = request.get_json()
        # ... (image processing and prediction logic is the same) ...
        image_base64 = data.get('image_base64')
        if not image_base64: return jsonify({"error": "No image provided"}), 400
        input_tensor = preprocess_image(image_base64)
        preds = model.predict(input_tensor)
        class_index = int(np.argmax(preds[0]))
        confidence = float(np.max(preds[0]))
        class_names = ["No DR", "Mild", "Moderate", "Severe", "Proliferative DR"]
        predicted_class = class_names[class_index]

        prediction_result = {
            "class": predicted_class,
            "confidence": confidence,
            "date": datetime.now(timezone.utc).isoformat()
        }
        
        # --- THE FIX ---
        # 1. The push() method returns a reference to the new data location
        new_prediction_ref = db.reference(f'predictions/{uid}').push(prediction_result)
        
        # 2. We can get the unique key (.key) from that reference
        new_prediction_id = new_prediction_ref.key
        
        # 3. Add the new ID to the dictionary we send back to the frontend
        prediction_result['id'] = new_prediction_id
        # --- END OF FIX ---

        # Now the returned JSON will include the unique ID
        return jsonify(prediction_result)

    except Exception as e:
        app.logger.error(f"An error occurred during prediction: {e}", exc_info=True)
        return jsonify({"error": "An internal error occurred"}), 500

# --- NEW: /history endpoint ---
@app.route('/history', methods=['GET'])
@check_auth # Protect this route as well
def get_history():
    try:
        uid = request.user['uid']
        
        # Get all predictions for the user from the database
        predictions_ref = db.reference(f'predictions/{uid}')
        predictions = predictions_ref.get()
        
        if not predictions:
            return jsonify([]) # Return an empty list if no history
            
        # Convert the dictionary of predictions to a list
        history_list = [{'id': key, **value} for key, value in predictions.items()]
        # Sort by date, newest first
        history_list.sort(key=lambda x: x['date'], reverse=True)

        return jsonify(history_list)

    except Exception as e:
        return jsonify({"error": "An internal error occurred", "details": str(e)}), 500
# --- End of New Endpoint ---


if __name__ == '__main__':
    app.run(debug=True)