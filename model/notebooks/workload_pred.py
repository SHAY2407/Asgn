import pickle
from prophet import Prophet
import pandas as pd

# Train Prophet model
data = pd.read_csv('data/workload_time_series.csv')
data.columns = ['ds', 'y']
model = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
model.fit(data)

# Save the Prophet model
with open('prophet_workload_model.pkl', 'wb') as f:
    pickle.dump(model, f)
print("Workload prediction model saved.")
