from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix

class Evaluator:
    """
    Evaluates model performance.
    """
    @staticmethod
    def evaluate(model, X_test, y_test):
        preds = model.predict(X_test)
        
        # Calculate Metrics
        p = precision_score(y_test, preds, average='macro')
        r = recall_score(y_test, preds, average='macro')
        f1 = f1_score(y_test, preds, average='macro')
        
        # Custom Cost
        # FN cost > FP cost (Security context)
        # FN is dangerous (Missed Attack)
        # FP is annoyance (Blocked User)
        tn, fp, fn, tp = confusion_matrix(y_test, preds, labels=[0,1]).ravel() if len(set(y_test)) <= 2 else (0,0,0,0)
        
        return {
            "precision": p,
            "recall": r,
            "f1": f1,
            "fn_count": int(fn) if len(set(y_test)) <= 2 else "N/A - MultiClass"
        }
