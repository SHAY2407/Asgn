import json
from pymongo import MongoClient
from datetime import datetime, timedelta
from crewai import Agent, Task, Crew, LLM

# MongoDB connection
mongo_uri = "mongodb://127.0.0.1:2747/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.4"
client = MongoClient(mongo_uri)
db = client["education"]
assignments_collection = db["assignments"]
predictions_collection = db["assignment_prediction"]

# CrewAI setup
API_KEY = "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"  # Add your Groq API key
llm = LLM(model="groq/llama-3.3-70b-versatile", api_key=API_KEY)

# Get current date for default scheduling
today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
today_iso = today.isoformat()

# Get latest assignment needing scheduling
latest_prediction = predictions_collection.find_one(sort=[("prediction_date", -1)])
latest_id = latest_prediction["_id"]  # Store the ID to exclude it later
predicted_days = latest_prediction["predicted_days"]
assignment_title = latest_prediction["assignment_details"]["title"]
created_at = latest_prediction["assignment_details"]["created_at"]

# Fetch past 5 days' assignments, EXCLUDING the current one
five_days_ago = datetime.utcnow() - timedelta(days=5)
past_assignments = list(predictions_collection.find({
    "prediction_date": {"$gte": five_days_ago},
    "_id": {"$ne": latest_id}  # Exclude the current assignment
}))

# Extract relevant details for context
past_assignment_details = []
for assignment in past_assignments:
    past_assignment_details.append({
        "title": assignment["assignment_details"]["title"],
        "difficulty": assignment["input_features"]["assignment_difficulty"],
        "predicted_days": assignment["predicted_days"],
        "start_date": assignment["assignment_details"]["created_at"]
    })

# Define the scheduling agent
scheduler_agent = Agent(
    role="Assignment Scheduler",
    goal="Analyze past assignments and determine the best start date for the new assignment.",
    backstory="An AI assistant responsible for optimizing assignment schedules to avoid overload.",
    allow_delegation=False,
    verbose=False,  # Disable verbose logging
    llm=llm
)

# Check if this is the first assignment
is_first_assignment = len(past_assignments) == 0

# Define the scheduling task with explicit instructions for first assignment
if is_first_assignment:
    # If this is the first assignment, directly return today's date without using the agent
    result_json = {
        "start_date": f"{today.strftime('%Y-%m-%dT00:00:00')}",
        "reason": "This is the first assignment, so it should start today."
    }
    print(json.dumps(result_json))
else:
    # Define the scheduling task for subsequent assignments
    schedule_task = Task(
        description=f"""
        Based on the past 5 days' assignments and their difficulty levels, determine the most appropriate start date for the new assignment.
        
        **KEY RULE: If there are NO past assignments, the start date MUST be TODAY ({today_iso}). Do not schedule for a future date in this case.**
        
        **Key Considerations:**
        - Review past assignments from the last 5 days, including their subject, difficulty level, and end date.
        - If past assignments were hard, ensure they are completed before scheduling the new one.
        - If past assignments were easy/medium, overlapping is allowed.
        - If no past assignments exist, schedule the new assignment for TODAY ({today_iso}).
        - The new assignment "{assignment_title}" requires {predicted_days} days to complete.

        **Reasoning Requirements:**
        - If there are no past assignments, mention that this is the first assignment, and scheduling it for today.
        - If past assignments exist, clearly state the **subject name** and **end date** of any past assignments that influenced the decision.
        - If multiple past assignments exist, list them and explain how their difficulty levels affected the new assignment's start date.
        
        **Past Assignments:**
        {past_assignment_details}

        Provide the recommended start date as a plain JSON object in ISO 8601 format, ensuring the time is always "00:00:00".

        **Example Output:**
        {{
            "start_date": "{today.strftime('%Y-%m-%dT00:00:00')}",
            "reason": "This is the first assignment with no past assignments, so it starts today."
        }}
        """,
        agent=scheduler_agent,
        expected_output="A JSON object with 'start_date' (ISO 8601) and 'reason' (text)."
    )

    # Execute task
    crew = Crew(agents=[scheduler_agent], tasks=[schedule_task])
    result = crew.kickoff()

    result_str = str(result).strip()  # Remove extra whitespace/newlines

    # Try parsing as JSON, otherwise wrap it in JSON manually
    try:
        result_json = json.loads(result_str)
    except json.JSONDecodeError:
        # If JSON parsing fails, just use today's date as fallback for first assignment
        if is_first_assignment:
            result_json = {
                "start_date": f"{today.strftime('%Y-%m-%dT00:00:00')}",
                "reason": "This is the first assignment, so it should start today."
            }
        else:
            result_json = {"start_date": result_str}  # Force into JSON format

    # Print JSON output
    print(json.dumps(result_json))