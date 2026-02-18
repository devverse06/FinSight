# This FastAPI backend processes uploaded images, extracts text using OCR, 
# converts unstructured data into structured transactions using Generative AI, 
# validates the data, and securely stores it in MongoDB while maintaining 
# user authentication via cookies
import jwt
from fastapi import Request, HTTPException # Request (request.cookies)
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel # 

import cv2
import pytesseract
import numpy as np

from pymongo import MongoClient

from google import genai


from fastapi import APIRouter, HTTPException
from fastapi import Body
from typing import List
import re
from bson import ObjectId
from fastapi.responses import JSONResponse
import os
import json


app = FastAPI() # Creates the ASGI application; ASGI: defines how a Python web app talks to a web server.
from dotenv import load_dotenv
load_dotenv()

client = genai.Client(api_key = os.getenv("GENAI_API_KEY"))
mongo_client = MongoClient(os.getenv("MONGODB_URL"))

db = mongo_client[os.getenv("MONGODB_DB_NAME")]
accounts_col = db["accountnumbers"]
transactions_col = db["transactions"]

from pydantic import BaseModel
from typing import Optional

# schema, BaseModel from Pydantic 
# (Parses JSON (JSON -> Python object), Validate types (verfies types, "abc" -> float not possible), Auto convert values (string -> float), reject bad input with 422, clear error messages
class Transaction(BaseModel):
    account_number: Optional[str] = None # Optional[str] → value can be str or None; = None → default value
    credited_debited: Optional[str] = None
    amount: Optional[float] = 0.0
    date: Optional[str] = None
    reference_number: Optional[str] = None
    to_from: Optional[str] = None


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Frontend (localhost:5173) is cross-origin
    allow_credentials=True, # Cookies require allow_credentials=True
    allow_methods=["*"],
    allow_headers=["*"],
)

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    # Convert bytes to numpy array (as OpenCV cannot Python bytes in needs numpy array of bytes)
    np_arr = np.frombuffer(image_bytes, np.uint8) # Image file is byte-oriented, uint8 = 8-bit unsigned integer (Range = 0 to 255)
    # Decode image from numpy array -> BGR (OpenCV stores color images in Blue-Green-Red order instead of RGB.)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Failed to decode image from bytes.")   
    # Resize, grayscale; Combines B, G, R into intensity
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return gray

def extract_text_from_image(image_path):
    preprocessed_image = preprocess_image(image_path)   
    # Tesseract to extract text
    extracted_text = pytesseract.image_to_string(preprocessed_image)
    return extracted_text

def return_transactions(text: str) -> dict:
    prompt = (
        f"""I will provide you with text extracted from bank transaction messages. Your task is to parse this text and return an array of JSON objects. Each JSON object should represent a single transaction and contain the following keys with their corresponding values:

account_number: The last four digits of the account number (e.g., X1815 should become 1815).
credited_debited: Indicate whether the account was "credited" or "debited."
amount: The transaction amount as a float (e.g., 20.0, 150.0).
date: The date of the transaction in DD/MM/YY format. For example, if the text states 03Apr25, the date should be 03/04/25. Please convert the month abbreviation (e.g., Apr, Jun) to its corresponding two-digit number.
to_from: The name of the recipient (for 'debited' transactions, usually after 'trf to') or sender (for 'credited' transactions, usually after 'transfer from').
reference_number: The transaction reference number.

Please extract this information for every transaction present in the text and ensure the output is a single JSON array containing all the transaction objects.

Here is the text:
{text}
"""
    )

    print("✅ Gemini prompt:\n", prompt)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    print("✅ Gemini response:\n", response.text)

    return response.text


class Message(BaseModel):
    user_input: str

@app.post("/chat")
async def chat(message: Message):
    user_text = message.user_input
    prompt = (
        "Be the friendliest chat bot and respond to the customers query but keep in mind to give a concise answer. \n"
        "Give a short summary answer."
        f"Prescription Text:\n{user_text}"
    )
    response = client.models.generate_content(
        model="gemini-2.0-flash", # flash as flash is fast
        contents=prompt
    )
    reply_text = response.text 
    return {"reply": reply_text}

# recives the image uploaded by the user and returns the raw OCR text as a dict
@app.post("/extract_text/")
async def extract_text(file: UploadFile = File(...)):
    contents = await file.read() # converts uploaded image into bytes
    raw_text = extract_text_from_image(contents) # returns a string (OCR text)
    print(raw_text)
    return {"extracted_text": raw_text}

# recives a dict with raw OCR text and returns the JSON response (as a string) from the GEMINI API
@app.post("/return_transactions/")
async def return_transactions_from_raw_text(data: dict):
    text = data.get("text", "")
    response_text = return_transactions(text)
    return response_text


from typing import List

#recieves List of Transactions (Pydantic model) and uploads valid transactions in DB and returns: dict[int, a list of python dict]
@app.post("/upload_transactions/")
async def upload_transactions(request: Request, data: List[Transaction]):

    user_id = request.cookies.get("user_id")

    if not user_id:
        raise HTTPException(status_code=401, detail="User not logged in")

    inserted = [] # stores the valid transactions stored in DB
    for item in data:
        item = item.dict()  # convert from Pydantic model to dict (mongoDB expects dict)
        required_keys = {"account_number", "credited_debited", "amount", "date", "reference_number"}

        # To check if all required keys are present and if present they have an actual value too
        if any(key not in item or item[key] in [None, ""] for key in required_keys):
            print("All required keys not present")
            continue

        # To check if any transaction with same reference number is not already present in the DB; this prevents entry of same transactions again
        if transactions_col.find_one({"reference_number": item["reference_number"]}):
            print("Reference number already present")
            continue
        
        # Only suffix of the account number present in the uploaded images, we take out the full suffix from our DB so as to store full account number in transactions in DB
        suffix = item["account_number"]
        full_account = accounts_col.find_one({"account_number": {"$regex": f"{suffix}$"}})

        # If no account with that prefix present means no such account number added
        if not full_account:
            print("Account number not present")
            continue

        # Enriching the item dict to insert
        item["account_number"] = full_account["account_number"]
        item["user_id"] = user_id
        transactions_col.insert_one(item)
        inserted.append(item)
        print("Inserted")
 
    for item in inserted:
        item.pop("_id", None)
    return {"inserted_count": len(inserted), "inserted_transactions": inserted}