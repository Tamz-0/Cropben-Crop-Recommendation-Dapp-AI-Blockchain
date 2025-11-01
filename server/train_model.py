import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

df = pd.read_csv("D:/WEB/Blockchain/SupplyChain/New folder/server/data/crop_yield.csv")

# Define risk based on yield
def risk_label(y):
    if y < 2.0: return "high"
    if y < 3.5: return "medium"
    return "low"

df["risk"] = df["Yield_tons_per_hectare"].apply(risk_label)

# Build features 
def make_row(row):
    feats = [
        row["Rainfall_mm"],
        row["Temperature_Celsius"],
        1.0 if row["Fertilizer_Used"] else 0.0,
        1.0 if row["Irrigation_Used"] else 0.0,
    ]
    for r in ["North","East","South","West"]:
        feats.append(1.0 if row["Region"] == r else 0.0)
    for s in ["Clay","Sandy","Loam","Silt","Peaty","Chalky"]:
        feats.append(1.0 if row["Soil_Type"] == s else 0.0)
    for c in ["Wheat","Rice","Maize","Barley","Soybean","Cotton"]:
        feats.append(1.0 if row["Crop"] == c else 0.0)
    for w in ["Sunny","Rainy","Cloudy"]:
        feats.append(1.0 if row["Weather_Condition"] == w else 0.0)
    return feats

X = df.apply(make_row, axis=1).tolist()
y = df["risk"]

clf = RandomForestClassifier(n_estimators=300, max_depth=12, random_state=42)
clf.fit(X, y)

os.makedirs("model", exist_ok=True)
joblib.dump(clf, "model/risk_model.pkl")
print("Model saved to model/risk_model.pkl")