from datetime import datetime
import requests
import json

# Test data setup
def test_scheduling_system():
    base_url = 'http://localhost:5000'  # Adjust if your Flask app runs on a different port
    
    # 1. First create a test assignment
    assignment_data = {
        "username": "teacher5",
        "difficulty": 6,
        "questionCount": 10,
        "questionTypes": ["multipleChoice", "shortAnswer", "essay"],
        "name": "Test Assignment",
        "status": "active",
        "created_at": datetime.now().isoformat()
    }
    
    # Save the assignment
    save_response = requests.post(
        f'{base_url}/save_assignment',
        json=assignment_data
    )
    print("Save Assignment Response:", save_response.json())
    
    # 2. Get the question distribution
    dist_response = requests.get(f'{base_url}/get_latest_assignment_output')
    print("Question Distribution Response:", dist_response.json())
    
    # 3. Get workload prediction
    workload_response = requests.get(f'{base_url}/predict_workload')
    print("Workload Prediction Response:", workload_response.json())
    
    # 4. Get active assignments count
    active_response = requests.post(
        f'{base_url}/active_assignments',
        json={"username": "teacher5"}
    )
    print("Active Assignments Response:", active_response.json())
    
    # 5. Finally, test the scheduling endpoint
    schedule_data = {
        "difficulty": 6
    }
    schedule_response = requests.post(
        f'{base_url}/suggest_start_date',
        json=schedule_data
    )
    print("Schedule Suggestion Response:", schedule_response.json())

if __name__ == "__main__":
    test_scheduling_system()