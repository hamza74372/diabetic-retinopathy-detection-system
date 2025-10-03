from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import os
import numpy as np
from PIL import Image
import tensorflow as tf

app = Flask(__name__)
CORS(app)  # allow frontend (React) to talk to Flask

# Load model
MODEL_PATH = os.path.join("model", "multibranch_model_1.h5")
model = tf.keras.models.load_model(MODEL_PATH)


# Define preprocessing function
def preprocess_image(image_base64):
    # Decode base64 → image
    image_data = base64.b64decode(image_base64.split(",")[1])  # remove "data:image/...;base64,"
    image = Image.open(io.BytesIO(image_data)).convert("RGB")

    # Resize to model input size (change 224x224 if your model used another size)
    image = image.resize((224, 224))
    image_array = np.array(image) / 255.0  # normalize [0,1]
    image_array = np.expand_dims(image_array, axis=0)  # add batch dim
    return image_array

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        image_base64 = data.get('image_base64')

        if not image_base64:
            return jsonify({"error": "No image provided"}), 400

        # Preprocess
        input_tensor = preprocess_image(image_base64)

        # Predict
        preds = model.predict(input_tensor)
        class_index = int(np.argmax(preds[0]))
        confidence = float(np.max(preds[0]))

        # You can define your class names here
        class_names = ["No DR", "Mild", "Moderate", "Severe", "Proliferative DR"]
        predicted_class = class_names[class_index]

        return jsonify({
            "class": predicted_class,
            "confidence": f"{confidence:.2f}"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
