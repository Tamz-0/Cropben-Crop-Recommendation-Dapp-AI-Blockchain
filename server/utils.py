import joblib
import pandas as pd
import requests
from datetime import datetime
from typing import Dict, List
import os
import dotenv

dotenv.load_dotenv()

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
if not WEATHER_API_KEY:
    raise ValueError("WEATHER_API_KEY not found in .env file.")

MODEL_PATH = "model/risk_model.pkl"
DISTRICT_CSV = "data/district_mapping.csv"


district_df = pd.read_csv(DISTRICT_CSV)
district_df["district"] = district_df["district"].str.strip().str.lower()

model = joblib.load(MODEL_PATH)

CROPS = ["Wheat", "Rice", "Maize", "Barley", "Soybean", "Cotton"]
SOILS = ["Clay", "Sandy", "Loam", "Silt", "Peaty", "Chalky"]
REGIONS = ["North", "East", "South", "West"]
WEATHERS = ["Sunny", "Rainy", "Cloudy"]

BASE_RATES = {"kharif": 0.02, "rabi": 0.015, "horticulture": 0.05}
RISK_MULTIPLIERS = {"low": 1.0, "medium": 1.5, "high": 2.2}
SUM_INSURED_PER_HA = 45000  # Default PMFBY value (₹/ha) – can be per crop/state

WEI_PER_ETH = 10**18
FALLBACK_ETH_INR_RATE = 280000.0  # Fallback rate: 1 ETH = 280,000 INR


def fetch_eth_to_inr_rate() -> float:
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {"ids": "ethereum", "vs_currencies": "inr"}
    try:
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status() 
        data = resp.json()
        rate = data["ethereum"]["inr"]
        if not isinstance(rate, (int, float)):
            raise ValueError("Invalid rate received from API")
        return float(rate)
    except Exception as e:
        print(f"CoinGecko API failed: {e}. Using fallback rate.")
        return FALLBACK_ETH_INR_RATE



def determine_season(sowing_month: int) -> str:
    if sowing_month in [6, 7, 8, 9]:
        return "kharif"
    if sowing_month in [10, 11, 12, 1]:
        return "rabi"
    return "horticulture"

def fetch_weather(district: str) -> Dict:
    url = f"http://api.weatherapi.com/v1/forecast.json"
    params = {"key": WEATHER_API_KEY, "q": district, "days": 90}
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if "error" in data:
            raise Exception(data["error"]["message"])
        
        forecast = data["forecast"]["forecastday"]
        rainfall = sum(day["day"]["totalprecip_mm"] for day in forecast)
        temp = sum(day["day"]["avgtemp_c"] for day in forecast) / len(forecast)
        
        conditions = [day["day"]["condition"]["text"].split()[0] for day in forecast]
        condition = max(set(conditions), key=conditions.count)
        condition = condition if condition in ["Sunny", "Rainy", "Cloudy"] else "Cloudy"
        
        return {
            "Rainfall_mm": round(rainfall, 2),
            "Temperature_Celsius": round(temp, 2),
            "Weather_Condition": condition
        }
    except Exception as e:
        print(f"Weather API failed: {e}. Using fallback.")
        region = district_df[district_df["district"].str.contains(district.lower())]
        if region.empty:
            return {"Rainfall_mm": 800, "Temperature_Celsius": 25, "Weather_Condition": "Cloudy"}
        reg = region["Region"].iloc[0]
        fallback = {
            "North": {"Rainfall_mm": 600, "Temperature_Celsius": 22},
            "South": {"Rainfall_mm": 1400, "Temperature_Celsius": 28},
            "East": {"Rainfall_mm": 1200, "Temperature_Celsius": 26},
            "West": {"Rainfall_mm": 700, "Temperature_Celsius": 24},
        }
        base = fallback.get(reg, fallback["South"])
        return {**base, "Weather_Condition": "Cloudy"}

def enrich_data(input_data: Dict) -> Dict:
    district = input_data["district"].strip().lower()
    row = district_df[district_df["district"].str.contains(district, case=False)]
    if row.empty:
        raise ValueError(f"District '{input_data['district']}' not found in mapping.")
    
    weather = fetch_weather(input_data["district"])
    
    return {
        "Region": row["Region"].iloc[0],
        "Soil_Type": row["Soil_Type"].iloc[0],
        "Crop": input_data["cropType"],
        "Fertilizer_Used": input_data["farmingMethod"] == "Conventional",
        "Irrigation_Used": input_data["irrigationUsed"],
        "'Sown Month": input_data['sowing_month'],
        **weather
    }

def build_features(enriched: Dict) -> List[float]:
    features = [
        enriched["Rainfall_mm"],
        enriched["Temperature_Celsius"],
        1.0 if enriched["Fertilizer_Used"] else 0.0,
        1.0 if enriched["Irrigation_Used"] else 0.0,
    ]

    for r in REGIONS:
        features.append(1.0 if enriched["Region"] == r else 0.0)
    for s in SOILS:
        features.append(1.0 if enriched["Soil_Type"] == s else 0.0)
    for c in CROPS:
        features.append(1.0 if enriched["Crop"] == c else 0.0)
    for w in WEATHERS:
        features.append(1.0 if enriched["Weather_Condition"] == w else 0.0)
    
    return features

def predict_risk(features: List[float]) -> str:
    proba = model.predict_proba([features])[0]
    pred_idx = proba.argmax()
    return model.classes_[pred_idx]

def calculate_premium(crop_data: Dict, area_ha: float, risk_score: str) -> Dict:
    sum_insured = SUM_INSURED_PER_HA * area_ha
    sowing_month = crop_data.get("sowing_month", datetime.now().month)
    season = determine_season(sowing_month)
    
    base_rate = BASE_RATES[season]
    farmer_premium_inr = sum_insured * base_rate
    actuarial_premium_inr = sum_insured * base_rate * 5 * RISK_MULTIPLIERS[risk_score]
    govt_subsidy_inr = actuarial_premium_inr - farmer_premium_inr
    
    eth_to_inr_rate = fetch_eth_to_inr_rate()
    
    def inr_to_wei(inr_amount: float) -> int:
        """Converts an INR amount to WEI."""
        eth_amount = inr_amount / eth_to_inr_rate
        wei_amount = eth_amount * WEI_PER_ETH
        return int(wei_amount)  

    farmer_premium_wei = inr_to_wei(farmer_premium_inr)
    govt_subsidy_wei = inr_to_wei(govt_subsidy_inr)
    total_actuarial_premium_wei = inr_to_wei(actuarial_premium_inr)

    return {
        "area_ha": area_ha,
        "sum_insured": round(sum_insured, 2),
        "season": season,
        "risk_score": risk_score,
        
        # INR values
        "farmer_pays_inr": round(farmer_premium_inr, 2),
        "govt_subsidy_inr": round(govt_subsidy_inr, 2),
        "total_actuarial_premium_inr": round(actuarial_premium_inr, 2),
        "currency_fiat": "INR",
        
        # WEI values
        "farmer_pays_wei": farmer_premium_wei,
        "govt_subsidy_wei": govt_subsidy_wei,
        "total_actuarial_premium_wei": total_actuarial_premium_wei,
        "currency_crypto": "WEI",
        
        # Metadata
        "conversion_rate_eth_inr": eth_to_inr_rate
    }   