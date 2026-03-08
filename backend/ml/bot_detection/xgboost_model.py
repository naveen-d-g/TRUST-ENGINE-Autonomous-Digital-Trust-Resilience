import os
import joblib
import numpy as np

# Placeholder for the actual XGBoost model
# In a real scenario, we would load a .pkl or .json model
# For this implementation, we will use a robust fallback if the file isn't found

MODEL_DIR = os.path.join("backend", "ml", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "xgboost_bot_model.pkl")

class BotInferenceModel:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"[BOT_DETECTION] Error loading model: {e}")
        else:
            print(f"[BOT_DETECTION] Model file not found at {MODEL_PATH}. Using heuristic fallback.")

    def predict_proba(self, features):
        """
        Predicts the probability of the input being a bot.
        """
        # Feature vector construction
        vector = [
            features.get("avg_velocity", 0),
            features.get("velocity_std", 0),
            features.get("avg_acceleration", 0),
            features.get("movement_entropy", 0),
            features.get("avg_interval", 0)
        ]

        if self.model:
            try:
                # Assuming model returns probabilities
                return float(self.model.predict_proba([vector])[0][1])
            except:
                pass
        
        # Heuristic fallback if model is missing or fails
        # Bots typically have lower entropy and very consistent intervals
        score = 0.1
        if features.get("movement_entropy", 0) < 1.0:
            score += 0.3
        if features.get("velocity_std", 0) < 50: # Very smooth, consistent speed
            score += 0.3
        if features.get("avg_interval", 0) < 0.05: # High frequency movement
            score += 0.2
            
        return min(0.95, score)

bot_inference = BotInferenceModel()

def predict_bot_probability(features):
    return bot_inference.predict_proba(features)
