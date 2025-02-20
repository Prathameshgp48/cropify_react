# Importing essential libraries and modules
from flask import Flask, request, jsonify
import logging
import pandas as pd
from flask_cors import CORS
from utils.fertilizer import fertilizer_dic
import joblib
import os
import torch
from torchvision import transforms
from PIL import Image
from utils.model import ResNet9
from utils.disease import disease_dic

# Set up logging
logging.basicConfig(level=logging.INFO)

# Initialize Flask app
app = Flask(__name__, static_folder='../client/dist', static_url_path='')
CORS(app, origins=["http://localhost:5173"])

# -------------------------LOADING THE TRAINED MODELS -----------------------------------------------

# Loading plant disease classification model
disease_classes = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust',
    'Apple___healthy', 'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy', 'Grape___Black_rot', 'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot',
    'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot',
    'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus', 'Tomato___healthy'
]

disease_model_path = 'models/plant_disease_model.pth'
disease_model = ResNet9(3, len(disease_classes))
disease_model.load_state_dict(torch.load(disease_model_path, map_location=torch.device('cpu')))
disease_model.eval()

# Loading crop recommendation model using joblib
base_dir = os.path.dirname(os.path.abspath(__file__))
crop_recommendation_model_path = os.path.join(base_dir, 'models', 'RandomForest.joblib')
crop_recommendation_model = joblib.load(crop_recommendation_model_path)
print(" Server running on http://localhost:5173")
# ------------------------------------ FUNCTIONS ------------------------------------

<<<<<<< HEAD
# Set up logging for debugging
logging.basicConfig(level=logging.INFO)

# =========================================================================================

# Custom functions for calculations

def weather_fetch(city_name):
    """
    Fetch and returns the temperature and humidity of a city
    :params: city_name
    :return: temperature, humidity
    """
    api_key = config.weather_api_key
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
    Transforms image to tensor and predicts disease label
    :params: image
    :return: prediction (string)
    """
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.ToTensor(),
    ])
    image = Image.open(io.BytesIO(img))
    img_t = transform(image)
    img_u = torch.unsqueeze(img_t, 0)

    # Get predictions from model
    yb = model(img_u)
    # Pick index with highest probability
    _, preds = torch.max(yb, dim=1)
    prediction = disease_classes[preds[0].item()]
    return prediction


# Loading Hugging Face model ##
# model_name = "microsoft/DialoGPT-medium"
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# model = AutoModelForCausalLM.from_pretrained(model_name)

# if tokenizer.pad_token is None:
#     tokenizer.add_special_tokens({'pad_token': '[PAD]'})

# # chatbot function
# def chatbot_response(input_text):
#     inputs = tokenizer.encode(input_text, return_tensors="pt", padding = True, truncation = True) 
#     outputs = model.generate(
#         inputs,
#         max_length=1000,
#         pad_token_id=tokenizer.pad_token_id,
#         attention_mask=inputs.ne(0).long(),  # Pass attention mask here
#     )


#     response = tokenizer.decode(outputs[0], skip_special_tokens=True)
#     return response

# ===============================================================================================
# ------------------------------------ FLASK APP -------------------------------------------------

app = Flask(__name__, static_folder='../client/dist', static_url_path='')

# Enable CORS
CORS(app, origins=["http://localhost:5173"])

# Render home page
@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')

# Serve static files
@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

# ===============================================================================================

# # RENDER PREDICTION PAGES

# Render crop recommendation result page
@app.route('/crop-recommend', methods=['POST'])
def crop_prediction():
    title = 'Cropify - Crop Recommendation'

    logging.info(f"Received raw form data: {request.form.to_dict()}")

    if request.method == 'POST':

        N = int(request.form['N'])
        P = int(request.form['P'])
        K = int(request.form['K'])
        ph = float(request.form['ph'])
        rainfall = float(request.form['rainfall'])
        city = request.form.get("city")

        # Fetch weather details for the city
        weather = weather_fetch(city)
        if weather is not None:
            temperature, humidity = weather

            # Log input features for debugging
            logging.info(f"Input features: N={N}, P={P}, K={K}, temperature={temperature}, humidity={humidity}, pH={ph}, rainfall={rainfall}")
            
            # Ensure that the input data has the correct column names
            columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
            data = pd.DataFrame([[N, P, K, temperature, humidity, ph, rainfall]], columns=columns)
            
            # Make the prediction
            my_prediction = crop_recommendation_model.predict(data)
            final_prediction = my_prediction[0]

            # Log the prediction for debugging
            logging.info(f"Crop prediction: {final_prediction}")

            return jsonify({'prediction': final_prediction})
        else:
            return jsonify({'error': 'Something went wrong! Please try again.'})


# Render disease prediction result page
@app.route('/disease-predict', methods=['POST'])
def disease_prediction():
    title = 'Cropify - Disease Detection'

    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
        file = request.files.get('file')
        if not file:
            return jsonify({'error': 'No file selected'}), 400
        try:
            img = file.read()
            prediction = predict_image(img)
            prediction = Markup(str(disease_dic[prediction]))
            return jsonify({'prediction': prediction})
        except Exception as e:
            logging.error(f"Error during prediction: {e}")
            return jsonify({'error': 'Prediction error! Please try again.'})

    return jsonify({'message': 'GET method not supported'}), 405

###CHAT ROUTE 
# @app.route('/chat', methods=['POST'])
# def chat():
=======
def recommend_fertilizer(N, P, K, crop):
>>>>>>> 2244d8ad5f6849224f622274fe2b0b1d0094585c
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
        logging.error(f"Error in fertilizer recommendation: {e}")
        return "Error generating fertilizer recommendation."

# ------------------------------------ FLASK ROUTES ------------------------------------

@app.route('/fertilizer-recommend', methods=['POST'])
def fertilizer_recommend():
    try:
        data = request.json
        N = int(data.get("N", 0))
        P = int(data.get("P", 0))
        K = int(data.get("K", 0))
        crop = data.get("crop", "").strip().lower()

        if not crop:
            return jsonify({"error": "Crop name is required."}), 400

        recommendation = recommend_fertilizer(N, P, K, crop)
        return jsonify({"recommendation": recommendation})
    
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

@app.route('/')
def serve_home():
    return jsonify({"message": "Welcome to the Crop and Fertilizer Recommendation API!"})

if __name__ == '__main__':
    app.run(debug=False)
