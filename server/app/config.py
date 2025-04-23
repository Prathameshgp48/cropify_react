weather_api_key = "9d7cde1f6d07ec55650544be1631307e"
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["CropifyDB"]
users_collection = db["users"]
reports_collection = db["reports"]
