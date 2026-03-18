# functions/main.py
from firebase_functions import https_fn, firestore_fn
from firebase_admin import initialize_app, firestore
import google.generativeai as genai
import json

# Initialize Firebase Admin SDK
initialize_app()

@https_fn.on_request()
def hello_python(req: https_fn.Request) -> https_fn.Response:
    """A simple HTTP-triggered function (The 'Lambda' API)."""
    return https_fn.Response("Hello from Python Firebase Functions!")

@firestore_fn.on_document_created(document="problems/{problem_id}")
def on_problem_added(event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None]) -> None:
    """A Firestore-triggered function (Runs when a problem is added)."""
    if event.data is None:
        return
    
    problem_data = event.data.to_dict()
    problem_id = event.params["problem_id"]
    
    print(f"--- Triggered: New Problem Added ---")
    print(f"ID: {problem_id}")
    print(f"Title: {problem_data.get('title')}")
    print(f"------------------------------------")
    
    # You could trigger an AI evaluation here or process data
    # Example: Update the document with a 'processed' flag
    db = firestore.client()
    db.collection("problems").document(problem_id).update({"status": "ready_for_review"})

@https_fn.on_request()
def generate_hints_ai(req: https_fn.Request) -> https_fn.Response:
    """An example of using Gemini AI inside a Python function."""
    # You would typically get the API key from environment variables or Secret Manager
    # genai.configure(api_key="YOUR_API_KEY")
    
    return https_fn.Response(json.dumps({"message": "Python Gemini hint generator placeholder"}), mimetype="application/json")
