
import os
import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, confusion_matrix, precision_score, recall_score
from sklearn.model_selection import train_test_split
from backend.ml.data.extract import load_training_data

MODEL_PATH = "e:/project/backend/ml/models/champion.pkl"

def train_pipeline():
    print("Loading data...")
    X, y = load_training_data()
    
    if X.empty:
        print("No training data available. Skipping.")
        return

    # Convert ordinal labels to Binary (High Risk/Malicious = 1, Benign/Susp = 0)
    y_binary = (y >= 2).astype(int)
    
    print(f"Dataset Size: {len(X)}. Positives: {y_binary.sum()}")
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y_binary, test_size=0.2, random_state=42)
    
    # 1. Train Base Model
    print("Training GradientBoosting...")
    gb = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3)
    
    # 2. Calibrate (FIX SPEC)
    # Using cv=3 to fit calibration on hold-out folds
    print("Calibrating...")
    calibrated_clf = CalibratedClassifierCV(gb, method='isotonic', cv=3)
    calibrated_clf.fit(X_train, y_train)
    
    # 3. Cost-Weighted Evaluation
    print("Evaluating...")
    probs = calibrated_clf.predict_proba(X_test)[:, 1]
    preds = (probs > 0.5).astype(int) # Default threshold for metrics
    
    auc = roc_auc_score(y_test, probs)
    tn, fp, fn, tp = confusion_matrix(y_test, preds).ravel()
    
    # Cost Matrix: FN=10, FP=2
    cost = (fn * 10) + (fp * 2)
    
    print(f"ROC AUC: {auc:.4f}")
    print(f"Confusion Matrix: TP={tp}, FN={fn}, FP={fp}, TN={tn}")
    print(f"Total Cost (FN*10 + FP*2): {cost}")
    
    # Save
    print(f"Saving model to {MODEL_PATH}...")
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(calibrated_clf, MODEL_PATH)
    print("Done.")

if __name__ == "__main__":
    train_pipeline()
