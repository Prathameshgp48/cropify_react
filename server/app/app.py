# Importing essential libraries and modules
from flask import Flask, render_template, request, redirect, send_from_directory, jsonify
from markupsafe import Markup
import numpy as np
import pandas as pd
import requests
import config
import joblib
import io
import torch
from torchvision import transforms
from PIL import Image
from utils.model import ResNet9
from utils.disease import disease_dic
from utils.fertilizer import fertilizer_dic
import os
import logging  # Add logging for debugging
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from config import users_collection
from config import reports_collection


# Set up logging
logging.basicConfig(level=logging.INFO)

# Initialize Flask app
app = Flask(__name__, static_folder='../client/dist', static_url_path='')
CORS(app, origins=["http://localhost:5173"])

# -------------------------LOADING TRAINED MODELS -----------------------------------------------

# Loading plant disease classification model
disease_classes = ['Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy', 
                   'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
                   'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_', 
                   'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 'Grape___Black_rot', 
                   'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy', 
                   'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
                   'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight', 
                   'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy', 'Soybean___healthy', 
                   'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot', 
                   'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot',
                   'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot', 
                   'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy']

disease_model_path = 'models/plant_disease_model.pth'
disease_model = ResNet9(3, len(disease_classes))
disease_model.load_state_dict(torch.load(disease_model_path, map_location=torch.device('cpu'), weights_only=True))
disease_model.eval()

# Loading crop recommendation model using joblib
base_dir = os.path.dirname(os.path.abspath(__file__))
crop_recommendation_model_path = os.path.join(base_dir, 'models', 'RandomForest.joblib')
crop_recommendation_model = joblib.load(crop_recommendation_model_path)

print("Server running on http://localhost:5173")

# ------------------------------------ FUNCTIONS ------------------------------------

def weather_fetch(city_name):
    """
    Fetch and return the temperature and humidity of a city.
    """
    api_key = config.weather_api_key  # Replace with actual API key
    base_url = "http://api.openweathermap.org/data/2.5/weather?"

    complete_url = base_url + "appid=" + api_key + "&q=" + city_name
    response = requests.get(complete_url)
    x = response.json()

    if x["cod"] != "404":
        y = x["main"]
        temperature = round((y["temp"] - 273.15), 2)  # Convert from Kelvin to Celsius
        humidity = y["humidity"]
        logging.info(f"Weather for {city_name} - Temperature: {temperature}, Humidity: {humidity}")
        return temperature, humidity
    else:
        logging.error(f"City {city_name} not found!")
        return None

def predict_image(img, model=disease_model):
    """
    Transforms image to tensor and predicts disease label.
    """
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.ToTensor(),
    ])
    image = Image.open(io.BytesIO(img))
    img_t = transform(image)
    img_u = torch.unsqueeze(img_t, 0)

    yb = model(img_u)
    _, preds = torch.max(yb, dim=1)
    prediction = disease_classes[preds[0].item()]
    return prediction

def recommend_fertilizer(N, P, K, crop):
    """
    Provides fertilizer recommendations based on nutrient levels.
    """
    try:
        recommendation = ""
        recommendation += fertilizer_dic.get('NHigh' if N > 50 else 'Nlow', "No recommendation for Nitrogen.")
        recommendation += "<br/><br/>" + fertilizer_dic.get('PHigh' if P > 50 else 'Plow', "No recommendation for Phosphorus.")
        recommendation += "<br/><br/>" + fertilizer_dic.get('KHigh' if K > 50 else 'Klow', "No recommendation for Potassium.")
        return recommendation.strip() if recommendation else f"Your soil has optimal nutrient levels for {crop}."
    except Exception as e:
        logging.error(f"Error in fertilizer recommendation: {e}")
        return "Error generating fertilizer recommendation."

# ------------------------------------ FLASK ROUTES ------------------------------------

@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

# Crop recommendation route
@app.route('/crop-recommend', methods=['POST'])
def crop_recommend():
    try:
        if request.is_json:
            data = request.get_json()  # Read JSON data
        else:
            data = request.form.to_dict()  # Read form data if JSON is not sent

        # Extract parameters
        N = data.get("N")
        P = data.get("P")
        K = data.get("K")
        ph = data.get("ph")
        rainfall = data.get("rainfall")
        state = data.get("state")
        city = data.get("city")

        # Ensure all fields are provided
        if not all([N, P, K, ph, rainfall, state, city]):
            return jsonify({"error": "Missing required fields"}), 400

        # Dummy prediction logic
        prediction = "Wheat" if int(N) > 30 else "Rice"

        return jsonify({"prediction": prediction}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
# Disease prediction route
@app.route('/disease-predict', methods=['POST'])
def disease_prediction():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
        file = request.files['file']
        if not file:
            return jsonify({'error': 'No file selected'}), 400

        img = file.read()
        prediction = predict_image(img)
        return jsonify({'prediction': disease_dic.get(prediction, "Unknown disease")})

    except Exception as e:
        logging.error(f"Error in disease prediction: {e}")
        return jsonify({'error': 'Prediction error!'}), 500

# Fertilizer recommendation route
@app.route('/fertilizer-recommend', methods=['POST'])
def fertilizer_recommend():
    try:
        data = request.json
        return jsonify({'recommendation': recommend_fertilizer(data['N'], data['P'], data['K'], data['crop'])})
    except Exception as e:
        logging.error(f"Error in fertilizer recommendation: {e}")
        return jsonify({'error': 'Invalid input!'}), 400
    
# JWT config
JWT_SECRET = os.getenv("JWT_SECRET", "defaultsecret")

# Signup route
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'Email already registered'}), 409

    hashed_pw = generate_password_hash(password)
    users_collection.insert_one({
        'name': name,
        'email': email,
        'password': hashed_pw
    })

    return jsonify({'message': 'Signup successful'}), 201

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = users_collection.find_one({'email': email})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    payload = {
        'user_id': str(user['_id']),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')

    return jsonify({
        'token': token,
        'name': user.get('name')  # Send name to frontend
    }), 200

@app.route('/generate-report', methods=['POST'])
def generate_report():
    try:
        data = request.get_json()  # ✅ Fix: Use get_json(), not request.json()

        # Log or print the received report data for debugging
        logging.info(f"Received report data: {data}")
        
        # Save report data to MongoDB
        reports_collection.insert_one(data)

        return jsonify({"message": "Report received successfully"}), 200

    except Exception as e:
        logging.error(f"Error while generating report: {e}")
        return jsonify({"error": "Failed to process report"}), 500

@app.route('/get-reports', methods=['GET'])
def get_reports():
    try:
        reports = list(reports_collection.find({}, {"_id": 0}))  # remove Mongo _id for clean frontend use
        return jsonify(reports), 200
    except Exception as e:
        logging.error(f"Error fetching reports: {e}")
        return jsonify({"error": "Unable to fetch reports"}), 500


# Run Flask App
if __name__ == '__main__':
    app.run(debug=True)
