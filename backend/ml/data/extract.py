
import json
import pandas as pd
from datetime import datetime
from backend.app import app
from backend.database.models import TrainingSample

def load_training_data(start_date=None, end_date=None):
    """
    Extracts labeled training data from DB.
    Returns X (DataFrame) and y (Series).
    """
    with app.app_context():
        query = TrainingSample.query
        if start_date:
            query = query.filter(TrainingSample.timestamp >= start_date)
        if end_date:
            query = query.filter(TrainingSample.timestamp <= end_date)
            
        samples = query.all()
        
        data = []
        labels = []
        
        for s in samples:
            # Parse features
            try:
                features = json.loads(s.feature_vector)
                data.append(features)
                labels.append(s.label)
            except Exception as e:
                print(f"Skipping sample {s.sample_id}: {e}")
                
        if not data:
            print("No training data found.")
            return pd.DataFrame(), pd.Series()
            
        X = pd.DataFrame(data)
        y = pd.Series(labels)
        
        # Ensure correct types
        return X, y

if __name__ == "__main__":
    X, y = load_training_data()
    print(f"Loaded {len(X)} samples.")
    print(X.head())
