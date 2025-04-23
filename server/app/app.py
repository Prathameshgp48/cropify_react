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
import io
from markupsafe import Markup
from utils.segment import process_leaf_image
import cv2
import numpy as np
from werkzeug.utils import secure_filename
import base64
from utils.fertilizer import fertilizer_dic
import os
import logging  # Add logging for debugging
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
from pymongo import MongoClient, errors
from dotenv import load_dotenv
import sklearn
print(sklearn.__version__)
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

# database connection
def check_db():
    try:
        load_dotenv()
        mongo_uri = os.getenv('MONGO_URI')

        client  = MongoClient(mongo_uri, serverSelectionTimeoutMS = 5000)
        # client.admin.command('ping')
        logging.info("Connected to MongoDB")
        db_name = "mydatabase"  # Replace with the actual database name you want to use
        db = client[db_name]  # Access the database
        collection = db['default_collection']  # Access the collection, it will be created if it doesn't exist
        return db, collection

    except errors.ServerSelectionTimeoutError as err:
        logging.error("Failed to connect to MongoDB")    
        raise err
    except Exception as e:
        logging.error(f"Unexpected: {e}")
        raise e

check_db()


# Loading plant disease classification model
disease_classes = ['Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy', 'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 'Corn___Common_Rust', 'Corn___Gray_Leaf_Spot', 'Corn___Healthy', 'Corn___Northern_Leaf_Blight', 'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_Blight', 'Potato___Early_blight', 'Potato___Healthy', 'Potato___Late_Blight', 'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy', 'Rice___Brown_Spot', 'Rice___Healthy', 'Rice___Leaf_Blast', 'Rice___Neck_Blast', 'Soybean___healthy', 'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Sugarcane_Bacterial Blight', 'Sugarcane_Healthy', 'Sugarcane_Red Rot', 'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy', 'Wheat___Brown_Rust', 'Wheat___Healthy', 'Wheat___Yellow_Rust']
print(len(disease_classes))

disease_model_path = 'models/new-plant-disease-model.pth'
disease_model = ResNet9(3, len(disease_classes))
disease_model.load_state_dict(torch.load(disease_model_path, map_location=torch.device('cpu'), weights_only=True))
disease_model.eval()

# Loading crop recommendation model using joblib
base_dir = os.path.dirname(os.path.abspath(__file__))
crop_recommendation_model_path = os.path.join(base_dir, 'models', 'RandomForest.joblib')
crop_recommendation_model = joblib.load(crop_recommendation_model_path)

print("Server running on http://localhost:5173")

# ------------------------------------ FUNCTIONS ------------------------------------

# <<<<<<< HEAD
# Set up logging for debugging
logging.basicConfig(level=logging.INFO)

# =========================================================================================

# Custom functions for calculations

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

# def predict_image(img, model=disease_model):
#     """
#     Transforms image to tensor and predicts disease label.
#     """
#     transform = transforms.Compose([
#         transforms.Resize(256),
#         transforms.ToTensor(),
#     ])
#     image = Image.open(io.BytesIO(img))
#     img_t = transform(image)
#     img_u = torch.unsqueeze(img_t, 0)

#     yb = model(img_u)
#     _, preds = torch.max(yb, dim=1)
#     prediction = disease_classes[preds[0].item()]
#     return prediction

def predict_image(img, model=disease_model):
    transform = transforms.Compose([
        transforms.Resize((256, 256)),  # Changed from 128 to 256
        transforms.ToTensor(),
        transforms.Normalize([0.5]*3, [0.5]*3)
    ])

    image = Image.open(io.BytesIO(img)).convert('RGB')
    img_t = transform(image)
    img_u = img_t.unsqueeze(0)

    model.eval()
    with torch.no_grad():
        outputs = model(img_u)
        probs = torch.softmax(outputs, dim=1)
        _, preds = torch.max(probs, dim=1)

    # print("Prediction Probabilities:", probs)  # Optional debug
    return disease_classes[preds.item()]


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
# @app.route('/disease-predict', methods=['POST'])
# def disease_prediction():
#     title = 'Cropify - Disease Detection'

#     if request.method == 'POST':
#         if 'file' not in request.files:
#             return jsonify({'error': 'No file part in the request'}), 400
        
#         file = request.files.get('file')
#         print(file)
#         if not file:
#             return jsonify({'error': 'No file selected'}), 400
#         try:
#             img = file.read()
#             prediction = predict_image(img)
#             prediction = Markup(str(disease_dic[prediction]))
#             # segmented_img = process_leaf_image(img)
#             # print(segmented_img)
#             return jsonify({'prediction': prediction})
#         except Exception as e:
#             logging.error(f"Error during prediction: {e}")
#             return jsonify({'error': 'Prediction error! Please try again.'})

#     return jsonify({'message': 'GET method not supported'}), 405

# temp implemenation
def process_leaf_image(image_bytes):
    """
    Processes a leaf image from bytes by removing the background and highlighting diseased areas.

    Args:
        image_bytes (bytes): Image file in bytes.

    Returns:
        tuple: (background_removed, disease_highlighted)
    """
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Error: Unable to decode image")

    # Resize for easier processing
    image = cv2.resize(image, (600, 400))

    # Apply GrabCut for background removal
    mask = np.zeros(image.shape[:2], np.uint8)
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    rect = (10, 10, image.shape[1] - 10, image.shape[0] - 10)

    cv2.grabCut(image, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)

    # Refine the mask
    mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
    background_removed = image * mask2[:, :, np.newaxis]

    # Convert to HSV for disease highlighting
    hsv = cv2.cvtColor(background_removed, cv2.COLOR_BGR2HSV)

    # Define color range for disease detection (brown/yellow patches)
    lower_disease = np.array([10, 100, 20])
    upper_disease = np.array([30, 255, 255])
    disease_mask = cv2.inRange(hsv, lower_disease, upper_disease)

    # Apply morphological operations to reduce noise
    kernel = np.ones((5, 5), np.uint8)
    disease_mask = cv2.morphologyEx(disease_mask, cv2.MORPH_CLOSE, kernel)

    # Highlight diseased areas in red
    disease_highlighted = background_removed.copy()
    disease_highlighted[disease_mask > 0] = [0, 0, 255]

    return background_removed, disease_highlighted

@app.route('/disease-predict', methods=['POST'])
def disease_prediction():
    """
    Endpoint to predict disease from an uploaded crop image.

    Returns:
        JSON response containing the prediction and processed images.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file selected'}), 400

    try:
        img_bytes = file.read()

        prediction = predict_image(img_bytes)
        prediction = Markup(str(disease_dic[prediction]))
        
        # Process the leaf image
        bg_removed, disease_highlighted = process_leaf_image(img_bytes)

        # Encode images to Base64 for response
        _, buffer_bg = cv2.imencode('.jpg', bg_removed)
        _, buffer_disease = cv2.imencode('.jpg', disease_highlighted)

        # bg_removed_base64 = buffer_bg.tobytes()
        # disease_highlighted_base64 = buffer_disease.tobytes()

        bg_removed_base64 = base64.b64encode(buffer_bg).decode('utf-8')
        disease_highlighted_base64 = base64.b64encode(buffer_disease).decode('utf-8')

        return jsonify({
            'prediction': prediction,  # Disease name
            'background_removed': f"data:image/jpeg;base64,{bg_removed_base64}",
            'disease_highlighted': f"data:image/jpeg;base64,{disease_highlighted_base64}"
        })

    
    
    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        return jsonify({'error': 'Prediction error! Please try again.'}), 500

###CHAT ROUTE 
# @app.route('/chat', methods=['POST'])
# def chat():

def recommend_fertilizer(N, P, K, crop):
# >>>>>>> 2244d8ad5f6849224f622274fe2b0b1d0094585c
    try:
        recommendation = ""
        
        # Determine if N, P, K are high or low
        if N > 50:  # Adjust threshold based on your data
            recommendation += fertilizer_dic.get('NHigh', "No recommendation available for high Nitrogen.")
        else:
            recommendation += fertilizer_dic.get('Nlow', "No recommendation available for low Nitrogen.")
        
        if P > 50:  # Adjust threshold based on your data
            recommendation += "<br/><br/>" + fertilizer_dic.get('PHigh', "No recommendation available for high Phosphorus.")
        else:
            recommendation += "<br/><br/>" + fertilizer_dic.get('Plow', "No recommendation available for low Phosphorus.")
        
        if K > 50:  # Adjust threshold based on your data
            recommendation += "<br/><br/>" + fertilizer_dic.get('KHigh', "No recommendation available for high Potassium.")
        else:
            recommendation += "<br/><br/>" + fertilizer_dic.get('Klow', "No recommendation available for low Potassium.")
        
        return recommendation.strip() if recommendation else f"Your soil has optimal nutrient levels for {crop}."
    
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
        logging.error(f"Error processing request: {str(e)}")
        return jsonify({"error": "Error generating recommendation."}), 500

@app.route('/crop-recommend', methods=['POST'])
def crop_prediction():
    try:
        data = request.json
        N = int(data.get("N", 0))
        P = int(data.get("P", 0))
        K = int(data.get("K", 0))
        temperature = float(data.get("temperature", 0))
        humidity = float(data.get("humidity", 0))
        ph = float(data.get("ph", 0))
        rainfall = float(data.get("rainfall", 0))

        columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        data = pd.DataFrame([[N, P, K, temperature, humidity, ph, rainfall]], columns=columns)
        prediction = crop_recommendation_model.predict(data)[0]

        return jsonify({'prediction': prediction})
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}")
        return jsonify({"error": "Error generating crop recommendation."}), 500

@app.route('/predict_severity', methods=['POST'])
def predict_severity():
    try:
        model = joblib.load("models/severity_encoders/severity_model.pkl")
        severity_encoder = joblib.load("models/severity_encoders/severity_label_encoder.pkl")
        disease_encoder = joblib.load("models/severity_encoders/disease_label_encoder.pkl")
        
        data = request.get_json()
        
        temperature = data["Temperature"]
        humidity = data["Humidity"]
        soil_ph = data["Soil_pH"]
        moisture = data["Moisture"]
        nitrogen = data["Nitrogen"]
        disease = data["Disease"]

        print(data)
        
        disease_encoded = disease_encoder.transform([disease])[0]
        
        features = np.array([[temperature, humidity, soil_ph, moisture, nitrogen, disease_encoded]])
        
        severity_encoded = model.predict(features)[0]
        
        severity = severity_encoder.inverse_transform([severity_encoded])[0]
        
        return jsonify({"severity": severity})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
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
