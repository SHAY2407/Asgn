import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import pickle
import os

print("Current Working Directory:", os.getcwd())

df = pd.read_csv('model/data/dataset_with_workload.csv')  # Adjust this path as needed
X = df[['assignment_difficulty', 'active_assignments_count', 'question_type_distribution', 'workload']]
y = df['historical_avg_completion_time']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(random_state=42)
model.fit(X_train, y_train)

# Save the Random Forest model
with open('due_date_model.pkl', 'wb') as f:
    pickle.dump(model, f)
print("Assignment prediction model saved.")
