from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson import ObjectId
import json
from datetime import datetime

# MongoDB connection
mongo_uri = "mongodb://127.0.0.1:2747/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.4"  # Replace with your MongoDB URI
client = MongoClient(mongo_uri)
db = client["education"]  # Database name
collection = db["assignments"]  # Collection name

def handle_new_assignment(data):
    """
    Process the new assignment document retrieved from MongoDB.
    """
    # Convert ObjectId and datetime to strings for JSON serialization
    if "_id" in data:
        data["_id"] = str(data["_id"])

    if "createdAt" in data and isinstance(data["createdAt"], datetime):
        data["createdAt"] = data["createdAt"].isoformat()  # Convert datetime to string
    
    print("New Assignment Data:")
    print(json.dumps(data, indent=4))

    # Extract details
    name = data.get("name", "Unnamed Assignment")
    question_types = data.get("questionTypes", [])
    difficulty = data.get("difficulty", 0)
    question_count = data.get("questionCount", 0)
    context = data.get("context", "")

    # Describe the type of assignment needed
    print(f"\nAssignment Details:")
    print(f"Name: {name}")
    print(f"Question Types: {', '.join(question_types) if question_types else 'Not specified'}")
    print(f"Difficulty: {difficulty}")
    print(f"Question Count: {question_count}")
    print(f"Context: {context if context else 'None'}")

# Monitor the assignments collection for new inserts
try:
    with collection.watch([{"$match": {"operationType": "insert"}}]) as stream:
        print("Watching for new assignments...")
        for change in stream:
            # Process the inserted document
            document = change["fullDocument"]
            handle_new_assignment(document)
except PyMongoError as e:
    print(f"Error while watching collection: {e}")
except Exception as ex:
    print(f"Unexpected error: {ex}")
