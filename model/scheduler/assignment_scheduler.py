# scheduler/assignment_scheduler.py
from datetime import datetime, timedelta
import numpy as np
from typing import List, Dict
import pandas as pd
from sklearn.cluster import KMeans
from pymongo import MongoClient

class AssignmentScheduler:
    def __init__(self):
        # Use the same MongoDB connection as your main app
        self.client = MongoClient('mongodb://127.0.0.1:2747/education?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.4')
        self.db = self.client['education']
        
        self.DIFFICULTY_THRESHOLDS = {
            'easy': (1, 3),
            'medium': (4, 7),
            'hard': (8, 10)
        }
        self.MAX_OVERLAP = {
            'easy': 3,
            'medium': 2,
            'hard': 1
        }

    def get_difficulty_category(self, difficulty_score: int) -> str:
        """Determine difficulty category based on score."""
        for category, (min_score, max_score) in self.DIFFICULTY_THRESHOLDS.items():
            if min_score <= difficulty_score <= max_score:
                return category
        return 'medium'  # default fallback

    def get_active_assignments(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Get all active assignments within the date range."""
        return list(self.db.assignments.find({
            'status': 'active',
            '$or': [
                # Assignments with existing schedule
                {
                    'start_date': {'$exists': True},
                    'due_date': {'$exists': True},
                    'due_date': {'$gte': start_date, '$lte': end_date}
                },
                # Recently created assignments without schedule
                {
                    'created_at': {'$gte': start_date - timedelta(days=7)}
                }
            ]
        }))

    def check_overlap_constraint(self, existing_assignments: List[Dict], 
                               new_assignment: Dict, 
                               proposed_start_date: datetime,
                               proposed_end_date: datetime) -> bool:
        """Check if adding new assignment violates overlap constraints."""
        difficulty = self.get_difficulty_category(new_assignment['assignment_difficulty'])
        
        # Filter assignments that overlap with proposed dates
        overlapping = [
            a for a in existing_assignments
            if (a.get('start_date', a.get('created_at')) <= proposed_end_date and 
                a.get('due_date', a.get('created_at') + timedelta(days=7)) >= proposed_start_date)
        ]
        
        overlap_counts = {
            'easy': 0,
            'medium': 0,
            'hard': 0
        }
        
        for assignment in overlapping:
            cat = self.get_difficulty_category(assignment['assignment_difficulty'])
            overlap_counts[cat] += 1
            
        return overlap_counts[difficulty] < self.MAX_OVERLAP[difficulty]

    def calculate_workload_score(self, assignments: List[Dict], date: datetime) -> float:
        """Calculate workload score for a specific date."""
        daily_workload = 0
        for assignment in assignments:
            start = assignment.get('start_date', assignment.get('created_at'))
            end = assignment.get('due_date', start + timedelta(days=7))
            if start <= date <= end:
                difficulty_weight = assignment['assignment_difficulty'] / 10.0
                daily_workload += difficulty_weight
        return daily_workload

    def find_optimal_schedule(self, new_assignment: Dict, predicted_days: float) -> Dict:
        """Find optimal schedule for new assignment using workload balancing."""
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)  # Look ahead 30 days
        
        existing_assignments = self.get_active_assignments(start_date, end_date)
        duration = timedelta(days=int(np.ceil(predicted_days)))
        
        potential_starts = [
            start_date + timedelta(days=i) 
            for i in range(14)
        ]
        
        best_schedule = None
        min_workload_variance = float('inf')
        
        for start in potential_starts:
            proposed_end = start + duration
            
            if not self.check_overlap_constraint(
                existing_assignments, 
                new_assignment, 
                start, 
                proposed_end
            ):
                continue
            
            daily_workloads = []
            current_date = start
            while current_date <= proposed_end:
                workload = self.calculate_workload_score(
                    existing_assignments + [{
                        'start_date': start,
                        'due_date': proposed_end,
                        'assignment_difficulty': new_assignment['assignment_difficulty']
                    }],
                    current_date
                )
                daily_workloads.append(workload)
                current_date += timedelta(days=1)
            
            workload_variance = np.var(daily_workloads)
            
            if workload_variance < min_workload_variance:
                min_workload_variance = workload_variance
                best_schedule = {
                    'start_date': start,
                    'due_date': proposed_end,
                    'workload_variance': workload_variance,
                    'average_daily_workload': np.mean(daily_workloads)
                }
        
        return best_schedule

    def schedule_assignment(self, assignment_id: str) -> Dict:
        """Schedule a new assignment."""
        # Get assignment from your replica
        assignment = self.db.assignments.find_one({'_id': assignment_id})
        prediction = self.db.assignment_prediction.find_one(
            {'assignment_id': assignment_id}
        )
        
        if not assignment or not prediction:
            raise ValueError("Assignment or prediction not found")
        
        schedule = self.find_optimal_schedule(
            assignment,
            prediction['predicted_days']
        )
        
        if not schedule:
            raise ValueError("Could not find viable schedule")
        
        # Update assignment with schedule in your replica
        self.db.assignments.update_one(
            {'_id': assignment_id},
            {
                '$set': {
                    'start_date': schedule['start_date'],
                    'due_date': schedule['due_date'],
                    'schedule_metadata': {
                        'workload_variance': schedule['workload_variance'],
                        'average_daily_workload': schedule['average_daily_workload'],
                        'scheduled_at': datetime.now()
                    }
                }
            }
        )
        
        return schedule


# app.py
@app.route('/schedule_assignment', methods=['POST'])
def schedule_assignment_endpoint():
    try:
        data = request.json
        assignment_id = data.get('assignment_id')
        if not assignment_id:
            return jsonify({'error': 'Assignment ID is required'}), 400
            
        scheduler = AssignmentScheduler()
        schedule = scheduler.schedule_assignment(assignment_id)
        
        return jsonify({
            'success': True,
            'schedule': {
                'start_date': schedule['start_date'].isoformat(),
                'due_date': schedule['due_date'].isoformat(),
                'workload_variance': schedule['workload_variance'],
                'average_daily_workload': schedule['average_daily_workload']
            }
        })
    
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        print(f"Error in schedule_assignment: {str(e)}")
        return jsonify({'error': str(e)}), 500