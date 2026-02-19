from typing import List, Dict, Any
import pandas as pd
from backend.ml.schema.feature_schema import FeatureSet

class DatasetBuilder:
    """
    Builds training datasets from raw session logs/DB.
    """
    @staticmethod
    def build_dataset(sessions: List[Dict[str, Any]], labels: Dict[str, int]) -> pd.DataFrame:
        """
        sessions: List of raw session dicts (or FeatureSet dicts).
        labels: Dict mapping session_id -> resolved_label_int
        """
        data = []
        for sess in sessions:
            features = sess # Assume features already extracted or raw passed
            # If raw, we would call feature extractors here. 
            # Assuming we pass pre-extracted feature dicts for now.
            
            sid = features.get("session_id")
            if sid in labels:
                row = features.copy()
                row["target"] = labels[sid]
                data.append(row)
                
        return pd.DataFrame(data)
