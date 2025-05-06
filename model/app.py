from flask import Flask, request, jsonify
from pymongo import MongoClient
import pickle
import pandas as pd
from datetime import datetime, timezone
from sklearn.ensemble import RandomForestRegressor
from prophet import Prophet
import numpy as np
from pymongo import MongoClient
from bson import ObjectId
from flask_cors import CORS
import subprocess
import json



client = MongoClient('mongodb://127.0.0.1:2747/education?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.4')
db = client['education']

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])


with open('model/models/prophet_workload_model.pkl', 'rb') as f:
    prophet_model = pickle.load(f)

with open('model/models/rf_assignment_model.pkl', 'rb') as f:
    rf_model = pickle.load(f)

with open('model/models/due_date_model_final.pkl', 'rb') as f:
    dueDate_model = pickle.load(f)

with open('model/models/question_distribution_model.pkl', 'rb') as f:
    quesDistb_model = pickle.load(f)

@app.route('/save_assignment', methods=['POST'])
def save_assignment():
    data = request.json
    username = data.get('username')  # Use username or email for now to identify the teacher
    assignment_difficulty = data.get('assignment_difficulty')
    question_type_distribution = data.get('question_type_distribution')

    # Fetch the teacher's _id from the MongoDB 'teachers' collection
    teacher = db.teachers.find_one({'username': username})

    if teacher:
        teacher_id = str(teacher['_id'])  # Convert ObjectId to string for storage
        # Save the assignment with the teacher's _id
        db.assignments.insert_one({
            'teacher_id': teacher_id,
            'assignment_difficulty': assignment_difficulty,
            'question_type_distribution': question_type_distribution,
            'status': 'active',
            'created_at': datetime.now()
        })
        return jsonify({'message': 'Assignment saved successfully!'})
    else:
        return jsonify({'error': 'Teacher not found'}), 404


"""@app.route('/give_distribution', methods=['POST'])
def get_question_distribution():
    data = request.json

    # Check if input is a single dictionary or a list of dictionaries
    if isinstance(data, dict):
        input_df = pd.DataFrame([data])  # Convert single dict to DataFrame
    elif isinstance(data, list):
        input_df = pd.DataFrame(data)  # Convert list of dicts to DataFrame
    else:
        return jsonify({'error': 'Invalid input data'}), 400

    # Ensure the DataFrame has the correct columns
    expected_columns = ['Question_Difficulty', 'Total_Questions', 
                        'Short_Questions_Included', 'Long_Questions_Included']
    
    if not all(col in input_df.columns for col in expected_columns):
        return jsonify({'error': 'Invalid input data'}), 400

    # Make predictions
    predictions = quesDistb_model.predict(input_df)

    # Replace negative predictions with 0 and round to 2 decimal places
    predictions = np.maximum(predictions, 0)
    predictions = np.round(predictions, 2)

    # Return the predictions as a JSON response
    return jsonify({'predictions': predictions.tolist()})"""

@app.route('/get_latest_assignment_output', methods=['GET'])
def get_latest_assignment_output():
    # Fetch the most recent assignment from MongoDB
    latest_assignment = db.assignments.find_one(sort=[('_id', -1)])  # Sort by _id in descending order
    
    if latest_assignment is None:
        return jsonify({'error': 'No assignments found'}), 404
    
    if '_id' in latest_assignment:
        latest_assignment['_id'] = str(latest_assignment['_id'])

    # Handle question types
    question_types = latest_assignment.get('questionTypes', [])
    
    # If question_types is an array with a single string, split it
    if isinstance(question_types, list) and len(question_types) == 1 and isinstance(question_types[0], str):
        question_types = question_types[0].split(',')
    # If question_types is directly a string, split it
    elif isinstance(question_types, str):
        question_types = question_types.split(',')
    
    # Define categories
    short_answer_types = ['multipleChoice', 'shortAnswer', 'trueFalse']
    long_answer_types = ['essay', 'longAnswer', 'coding']
    
    # Initialize flags
    has_short_answer = 0
    has_long_answer = 0
    
    # Check each question type
    for qt in question_types:
        qt = qt.strip()
        if qt in short_answer_types:
            has_short_answer = 1
        if qt in long_answer_types:
            has_long_answer = 1

    # Convert assignment details to DataFrame
    input_df = pd.DataFrame([{
        'Question_Difficulty': latest_assignment['difficulty'],
        'Total_Questions': latest_assignment['questionCount'],
        'Short_Questions_Included': has_short_answer,
        'Long_Questions_Included': has_long_answer
    }])

    input_df_list = input_df.to_dict(orient='records')
    
    # Make predictions using your model
    predictions = quesDistb_model.predict(input_df)

    # Replace negative predictions with 0 and round to 2 decimal places
    predictions = np.maximum(predictions, 0)
    predictions = np.round(predictions, 2)

    # Return the predictions as a JSON response
    return jsonify({'predictions': predictions.tolist()})


@app.route('/active_assignments', methods=['POST'])
def get_active_assignments():
    try:
        # Simply count all documents in the assignments collection
        total_assignments = db.assignments.count_documents({})
        
        return jsonify({
            'active_assignments_count': total_assignments
        })
        
    except Exception as e:
        print(f"Error in get_active_assignments: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/predict_workload', methods=['GET'])
def predict_workload():
    # Use current date or custom date from the request
    date_str = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    date = pd.to_datetime(date_str)

    # Make future prediction (1 day forward)
    future = prophet_model.make_future_dataframe(periods=120)
    forecast = prophet_model.predict(future)
    filtered_forecast = forecast.loc[forecast['ds'] == date, 'yhat']
    if filtered_forecast.empty:
        return jsonify({'error': 'No prediction available for this date'}), 400

    forecasted_workload = filtered_forecast.values[0]

    return jsonify({'date': date_str, 'forecasted_workload': round(forecasted_workload, 2)})

@app.route('/predict_assignment_days', methods=['GET'])
def predict_assignment_days():
    try:
        # 1. Get assignment difficulty from latest assignment in MongoDB
        latest_assignment = db.assignments.find_one(sort=[('_id', -1)])
        if not latest_assignment:
            return jsonify({'error': 'No assignments found'}), 404
            
        assignment_difficulty = latest_assignment['difficulty']
        assignment_id = latest_assignment['_id']  # Get assignment ID for reference

        # 2. Get question type distribution from get_latest_assignment_output
        with app.test_client() as client:
            response = client.get('/get_latest_assignment_output')
            if response.status_code != 200:
                return jsonify({'error': 'Failed to get question distribution'}), 500
            question_distribution_data = response.get_json()
            question_type_distribution = question_distribution_data['predictions'][0]

        # 3. Get workload prediction
        with app.test_client() as client:
            response = client.get('/predict_workload')
            if response.status_code != 200:
                return jsonify({'error': 'Failed to get workload prediction'}), 500
            workload_data = response.get_json()
            workload = workload_data['forecasted_workload']

        # 4. Get active assignments count
        username = latest_assignment.get('username', 'teacher5')  # Adjust based on your data structure
        with app.test_client() as client:
            response = client.post('/active_assignments', json={'username': username})
            if response.status_code != 200:
                return jsonify({'error': 'Failed to get active assignments count'}), 500
            active_assignments_data = response.get_json()
            active_assignments_count = active_assignments_data['active_assignments_count']

        # Use Random Forest model to predict days required
        input_data = [[assignment_difficulty, active_assignments_count, question_type_distribution, workload]]
        predicted_days = dueDate_model.predict(input_data)[0]
        
        # Create prediction document
        prediction_doc = {
            'assignment_id': assignment_id,
            'prediction_date': datetime.utcnow(),
            'predicted_days': round(predicted_days, 2),
            'input_features': {
                'assignment_difficulty': assignment_difficulty,
                'question_type_distribution': question_type_distribution,
                'workload': workload,
                'active_assignments_count': active_assignments_count
            },
            'assignment_details': {
                'title': latest_assignment.get('name'),
                'username': username,
                'created_at': latest_assignment.get('createdAt')
            }
        }
        
        # Store prediction in MongoDB
        result = db.assignment_prediction.insert_one(prediction_doc)
        
        # Return response with prediction and storage confirmation
        return jsonify({
            'predicted_days': round(predicted_days, 2),
            'input_data': {
                'assignment_difficulty': assignment_difficulty,
                'question_type_distribution': question_type_distribution,
                'workload': workload,
                'active_assignments_count': active_assignments_count
            },
            'prediction_stored': bool(result.inserted_id)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

from datetime import datetime, timezone
import pandas as pd

from bson import ObjectId

@app.route('/schedule_assignment', methods=['POST'])
def schedule_assignment():
    try:
        # Run scheduling script
        result = subprocess.run(["python", "asgn_schd/asgn_schd.py"], capture_output=True, text=True)

        if result.returncode != 0:
            return jsonify({'error': 'Failed to execute scheduling agent', 'details': result.stderr}), 500

        # Extract the last valid JSON block
        output_lines = result.stdout.strip().split("\n")
        json_output = output_lines[-1]  # Take the last line, assuming it's the JSON

        try:
            schedule_result = json.loads(json_output)
            start_date = schedule_result.get("start_date")
            reason = schedule_result.get("reason")  # Extract reason
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid JSON output from scheduling agent', 'details': result.stdout}), 500

        # Fetch the latest assignment details from MongoDB
        latest_assignment = db.assignment_prediction.find_one({}, sort=[("_id", -1)])
        if not latest_assignment:
            return jsonify({'error': 'No assignment prediction found'}), 500

        assignment_id = latest_assignment["_id"]
        title = latest_assignment["assignment_details"]["title"]
        predicted_days = latest_assignment["predicted_days"]

        # Convert start_date string to datetime object
        start_date_dt = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)

        # Store scheduled assignment in MongoDB
        db.scheduled_assignments.insert_one({
            "assignment_id": ObjectId(assignment_id),
            "title": title,
            "start_date": start_date_dt,
            "predicted_days": predicted_days,
            "reason": reason,  # Include the reason in the database
            "created_at": datetime.now(timezone.utc)
        })

        return jsonify({
            "assignment_id": str(assignment_id),
            "title": title,
            "start_date": start_date,
            "predicted_days": predicted_days,
            "reason": reason  # Include the reason in the response
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
