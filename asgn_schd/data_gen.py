import random
import numpy as np
import pandas as pd

# Number of synthetic assignments to generate
num_assignments = 100
data = []

for i in range(num_assignments):
    assignment_id = i + 1
    # Teacher-defined difficulty on a scale of 1 to 5
    teacher_defined_difficulty = random.randint(1, 5)
    # Number of questions: assume between 1 and 20
    num_questions = random.randint(1, 20)
    # Average question complexity: a float between 1.0 and 5.0
    avg_question_complexity = round(random.uniform(1.0, 5.0), 2)
    # Deadline in days (e.g., between 5 and 30 days from now)
    deadline_days = random.randint(5, 30)
    
    # Synthetic formula for estimated workload hours:
    # Base effort can be modeled as: teacher_defined_difficulty * num_questions * avg_question_complexity
    base_effort = teacher_defined_difficulty * num_questions * avg_question_complexity
    # Add some noise (e.g., ±10% of the base effort)
    noise = np.random.uniform(-0.1, 0.1) * base_effort
    estimated_workload_hours = round(base_effort + noise, 2)
    
    # Derived scheduling difficulty: simple multiplication of num_questions and average complexity
    scheduling_difficulty = round(num_questions * avg_question_complexity, 2)
    
    data.append({
        'assignment_id': assignment_id,
        'teacher_defined_difficulty': teacher_defined_difficulty,
        'num_questions': num_questions,
        'avg_question_complexity': avg_question_complexity,
        'deadline_days': deadline_days,
        'estimated_workload_hours': estimated_workload_hours,
        'scheduling_difficulty': scheduling_difficulty
    })

# Create a DataFrame to hold the data
df = pd.DataFrame(data)
print(df.head())

df.to_csv('asgn_schd/synthetic_assignments.csv', index=False)
