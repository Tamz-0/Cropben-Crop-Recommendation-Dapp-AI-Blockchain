from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import hashlib
import json
import os
from datetime import datetime
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import warnings
warnings.filterwarnings('ignore')

# Initialize the Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# --- Configuration ---
ARTIFACTS_DIR = 'artifacts' # Directory to save models

# Create the artifacts directory if it doesn't exist
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# Global variables for models and data
models = {}
scalers = {}
label_encoders = {}
model_metadata = {}
feature_importance = {}
risk_model = None
loan_model = None

# AI Model Training and Utilities
def calculate_model_hash(model, feature_names):
    """Calculate SHA256 hash of model and features for version control"""
    model_str = str(model.get_params())
    features_str = str(sorted(feature_names))
    combined = model_str + features_str
    return hashlib.sha256(combined.encode()).hexdigest()[:16]

def load_and_prepare_data():
    """Load and preprocess the farmers dataset"""
    try:
        df = pd.read_csv('farmers_data.csv')
        print(f"Loaded dataset with {len(df)} records")
        return df
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

def train_risk_assessment_model(df):
    """Train risk assessment model for insurance"""
    global risk_model, scalers, label_encoders, model_metadata, feature_importance
    
    # Prepare features for risk assessment
    # Create synthetic risk score based on available features
    df['risk_score'] = (
        (df['landSize'] > 5).astype(int) * 0.1 +  # Large farms slightly riskier
        (df['farmingMethod'] == 'Organic').astype(int) * 0.15 +  # Organic has different risk profile
        (df['farmerRating'] <= 2).astype(int) * 0.3 +  # Low rating = high risk
        (df['insuranceStatus'] == 0).astype(int) * 0.2 +  # Uninsured = higher risk
        (df['previousLoanRepayment'] == 'Defaulted').astype(int) * 0.25  # Default history = risk
    )
    
    # Normalize risk score to [0,1]
    df['risk_score'] = np.clip(df['risk_score'], 0, 1)
    
    # Features for model
    feature_cols = ['landSize', 'cropType', 'farmingMethod', 'toolsOwned', 
                'insuranceStatus', 'farmerRating', 'location']
    
    X = df[feature_cols].copy()
    y = df['risk_score']
    
    # Encode categorical variables
    le_crop = LabelEncoder()
    le_method = LabelEncoder()
    le_location = LabelEncoder()
    
    X['cropType_encoded'] = le_crop.fit_transform(X['cropType'])
    X['farmingMethod_encoded'] = le_method.fit_transform(X['farmingMethod'])
    X['location_encoded'] = le_location.fit_transform(X['location'])
    
    # Select numeric features
    numeric_features = ['landSize', 'toolsOwned', 'insuranceStatus', 'farmerRating', 
                    'cropType_encoded', 'farmingMethod_encoded', 'location_encoded']
    X_numeric = X[numeric_features]
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_numeric)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    # Train model
    model = GradientBoostingClassifier(n_estimators=100, random_state=42)
    # Convert continuous target to binary for classification
    y_train_binary = (np.array(y_train) > 0.5).astype(int)
    y_test_binary = (np.array(y_test) > 0.5).astype(int)
    
    model.fit(X_train, y_train_binary)
    
    # Calculate accuracy
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test_binary, y_pred)
    print(f"Risk Model Accuracy: {accuracy:.3f}")
    
    # Store model and metadata
    risk_model = model
    scalers['risk'] = scaler
    label_encoders['risk'] = {
        'cropType': le_crop,
        'farmingMethod': le_method,
        'location': le_location
    }
    
    # Calculate feature importance
    feature_importance['risk'] = list(zip(numeric_features, model.feature_importances_))
    feature_importance['risk'] = sorted(feature_importance['risk'], key=lambda x: x[1], reverse=True)
    
    # Model metadata
    model_hash = calculate_model_hash(model, numeric_features)
    model_metadata['risk'] = {
        'version': 'v2025-01-15',
        'hash': model_hash,
        'accuracy': accuracy,
        'features': numeric_features,
        'trained_on': datetime.now().isoformat()
    }

    # --- SAVE ARTIFACTS ---
    joblib.dump(risk_model, os.path.join(ARTIFACTS_DIR, 'risk_model.joblib'))
    joblib.dump(scalers['risk'], os.path.join(ARTIFACTS_DIR, 'risk_scaler.joblib'))
    joblib.dump(label_encoders['risk'], os.path.join(ARTIFACTS_DIR, 'risk_label_encoders.joblib'))
    
    # Save metadata and feature importance to a JSON file
    # Convert numpy types to native python types for JSON serialization
    feature_importance_serializable = [(feat, float(imp)) for feat, imp in feature_importance['risk']]
    metadata_to_save = {
        'metadata': model_metadata['risk'],
        'feature_importance': feature_importance_serializable
    }
    with open(os.path.join(ARTIFACTS_DIR, 'risk_metadata.json'), 'w') as f:
        json.dump(metadata_to_save, f, indent=4)
    
    print(f"Risk model trained successfully. Hash: {model_hash}")
    return model

def train_loan_eligibility_model(df):
    """Train loan eligibility model"""
    global loan_model
    
    # Features for loan model
    feature_cols = ['landSize', 'cropType', 'farmingMethod', 'toolsOwned', 
                'insuranceStatus', 'farmerRating', 'location', 'previousLoanRepayment']
    
    X = df[feature_cols].copy()
    y = df['LoanEligible']
    
    # Encode categorical variables
    le_crop = LabelEncoder()
    le_method = LabelEncoder()
    le_location = LabelEncoder()
    le_repayment = LabelEncoder()
    
    X['cropType_encoded'] = le_crop.fit_transform(X['cropType'])
    X['farmingMethod_encoded'] = le_method.fit_transform(X['farmingMethod'])
    X['location_encoded'] = le_location.fit_transform(X['location'])
    X['repayment_encoded'] = le_repayment.fit_transform(X['previousLoanRepayment'])
    
    # Select numeric features
    numeric_features = ['landSize', 'toolsOwned', 'insuranceStatus', 'farmerRating', 
                    'cropType_encoded', 'farmingMethod_encoded', 'location_encoded', 'repayment_encoded']
    X_numeric = X[numeric_features]
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_numeric)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Calculate accuracy
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Loan Model Accuracy: {accuracy:.3f}")
    
    # Store model and metadata
    loan_model = model
    scalers['loan'] = scaler
    label_encoders['loan'] = {
        'cropType': le_crop,
        'farmingMethod': le_method,
        'location': le_location,
        'previousLoanRepayment': le_repayment
    }
    
    # Calculate feature importance
    feature_importance['loan'] = list(zip(numeric_features, model.feature_importances_))
    feature_importance['loan'] = sorted(feature_importance['loan'], key=lambda x: x[1], reverse=True)
    
    # Model metadata
    model_hash = calculate_model_hash(model, numeric_features)
    model_metadata['loan'] = {
        'version': 'v2025-01-15',
        'hash': model_hash,
        'accuracy': accuracy,
        'features': numeric_features,
        'trained_on': datetime.now().isoformat()
    }

     # --- SAVE ARTIFACTS ---
    joblib.dump(loan_model, os.path.join(ARTIFACTS_DIR, 'loan_model.joblib'))
    joblib.dump(scalers['loan'], os.path.join(ARTIFACTS_DIR, 'loan_scaler.joblib'))
    joblib.dump(label_encoders['loan'], os.path.join(ARTIFACTS_DIR, 'loan_label_encoders.joblib'))

    # Save metadata and feature importance to a JSON file
    feature_importance_serializable = [(feat, float(imp)) for feat, imp in feature_importance['loan']]
    metadata_to_save = {
        'metadata': model_metadata['loan'],
        'feature_importance': feature_importance_serializable
    }
    with open(os.path.join(ARTIFACTS_DIR, 'loan_metadata.json'), 'w') as f:
        json.dump(metadata_to_save, f, indent=4)
    
    print(f"Loan model trained successfully. Hash: {model_hash}")
    return model

def calculate_premium_from_risk(risk_score, crop_type, area_ha, farming_method):
    """Calculate insurance premium based on risk score"""
    # Base premium per hectare (in Wei, assuming 1 ETH = 10^18 Wei)
    base_premium_eth = 0.01  # 0.01 ETH per hectare base
    base_premium_wei = int(base_premium_eth * 10**18)
    
    # Risk multiplier
    risk_multiplier = 1 + (risk_score * 2)  # Risk can double the premium
    
    # Crop type multiplier
    crop_multipliers = {
        'Rice': 1.0,
        'Wheat': 1.1,
        'Maize': 1.05,
        'Cotton': 1.3,
        'Sugarcane': 1.2,
        'Barley': 1.0
    }
    crop_multiplier = crop_multipliers.get(crop_type, 1.0)
    
    # Farming method multiplier
    method_multiplier = 1.2 if farming_method == 'Organic' else 1.0
    
    # Calculate final premium
    final_premium = int(base_premium_wei * area_ha * risk_multiplier * crop_multiplier * method_multiplier)
    
    # Apply PMFBY caps (example: max 10% of sum insured)
    max_premium = int(area_ha * 50000 * 10**18 * 0.1)  # 50,000 per hectare, 10% cap
    final_premium = min(final_premium, max_premium)
    
    return final_premium

# Initialize models on startup
# def initialize_models():
    """Load data and train models on startup"""
    print("Initializing AI models...")
    df = load_and_prepare_data()
    if df is not None:
        train_risk_assessment_model(df)
        train_loan_eligibility_model(df)
        print("Models initialized successfully!")
    else:
        print("Failed to initialize models - using fallback simulation")

# --- MODIFIED: Initialize models on startup (Load or Train) ---
def initialize_models():
    """Load models from disk if they exist, otherwise train and save them."""
    global risk_model, loan_model, scalers, label_encoders, model_metadata, feature_importance

    risk_model_path = os.path.join(ARTIFACTS_DIR, 'risk_model.joblib')
    loan_model_path = os.path.join(ARTIFACTS_DIR, 'loan_model.joblib')

    if os.path.exists(risk_model_path) and os.path.exists(loan_model_path):
        print("Loading existing models from disk...")
        try:
            # Load risk model components
            risk_model = joblib.load(risk_model_path)
            scalers['risk'] = joblib.load(os.path.join(ARTIFACTS_DIR, 'risk_scaler.joblib'))
            label_encoders['risk'] = joblib.load(os.path.join(ARTIFACTS_DIR, 'risk_label_encoders.joblib'))
            with open(os.path.join(ARTIFACTS_DIR, 'risk_metadata.json'), 'r') as f:
                risk_meta_data = json.load(f)
                model_metadata['risk'] = risk_meta_data['metadata']
                feature_importance['risk'] = risk_meta_data['feature_importance']

            # Load loan model components
            loan_model = joblib.load(loan_model_path)
            scalers['loan'] = joblib.load(os.path.join(ARTIFACTS_DIR, 'loan_scaler.joblib'))
            label_encoders['loan'] = joblib.load(os.path.join(ARTIFACTS_DIR, 'loan_label_encoders.joblib'))
            with open(os.path.join(ARTIFACTS_DIR, 'loan_metadata.json'), 'r') as f:
                loan_meta_data = json.load(f)
                model_metadata['loan'] = loan_meta_data['metadata']
                feature_importance['loan'] = loan_meta_data['feature_importance']

            print("Models loaded successfully from artifacts!")
        except Exception as e:
            print(f"Error loading models from disk: {e}. Retraining...")
            # Fallback to training if loading fails
            df = load_and_prepare_data()
            if df is not None:
                train_risk_assessment_model(df)
                train_loan_eligibility_model(df)
    else:
        print("No saved models found. Training new models...")
        df = load_and_prepare_data()
        if df is not None:
            train_risk_assessment_model(df)
            train_loan_eligibility_model(df)
            print("Models trained and saved for future use.")
        else:
            print("Failed to initialize models - data loading error.")

# Enhanced AI-Based Insurance Scoring Endpoint
@app.route('/api/insurance/score', methods=['POST'])
def insurance_score():
    """
    Advanced ML-based risk assessment for crop insurance.
    Follows the specification for returning riskScore, premiumWei, modelVersion, etc.
    """
    try:
        data = request.get_json()
        
        # Extract features from request
        crop_type = data.get('cropType', 'Rice')
        area_ha = float(data.get('areaHa', 1.0))
        farming_method = data.get('farmingMethod', 'Conventional')
        district = data.get('district', 'Unknown')
        farmer_rating = int(data.get('farmerRating', 3))
        tools_owned = int(data.get('toolsOwned', 2))
        insurance_status = int(data.get('insuranceStatus', 0))
        
        # Additional features for enhanced risk assessment
        season = data.get('season', 'Kharif')
        irrigation_access = data.get('irrigationAccess', True)
        soil_type = data.get('soilType', 'Loamy')
        
        if risk_model is not None and 'risk' in scalers and 'risk' in label_encoders:
            # Use trained ML model
            try:
                # Prepare features for prediction
                features = np.array([[
                    area_ha,
                    tools_owned,
                    insurance_status,
                    farmer_rating,
                    label_encoders['risk']['cropType'].transform([crop_type])[0],
                    label_encoders['risk']['farmingMethod'].transform([farming_method])[0],
                    label_encoders['risk']['location'].transform([district])[0] if district in label_encoders['risk']['location'].classes_ else 0
                ]])
                
                # Scale features
                features_scaled = scalers['risk'].transform(features)
                
                # Predict risk probability
                risk_prob = risk_model.predict_proba(features_scaled)[0][1]  # Probability of high risk
                risk_score = float(risk_prob)
                
                # Get top contributing features
                feature_names = ['landSize', 'toolsOwned', 'insuranceStatus', 'farmerRating', 
                            'cropType', 'farmingMethod', 'location']
                feature_values = features[0]
                
                # Calculate feature contributions (simplified)
                top_factors = []
                for i, (name, importance) in enumerate(feature_importance['risk'][:3]):
                    impact = importance * 0.5  # Simplified impact calculation
                    top_factors.append({
                        'feature': name,
                        'impact': round(impact, 3)
                    })
                
            except Exception as e:
                print(f"ML model prediction failed: {e}")
                # Fallback to rule-based
                risk_score = calculate_fallback_risk(crop_type, farming_method, farmer_rating, insurance_status)
                top_factors = [
                    {'feature': 'farmer_rating', 'impact': 0.25},
                    {'feature': 'crop_type', 'impact': 0.20},
                    {'feature': 'farming_method', 'impact': 0.15}
                ]
        else:
            # Fallback rule-based risk assessment
            risk_score = calculate_fallback_risk(crop_type, farming_method, farmer_rating, insurance_status)
            top_factors = [
                {'feature': 'farmer_rating', 'impact': 0.25},
                {'feature': 'crop_type', 'impact': 0.20},
                {'feature': 'farming_method', 'impact': 0.15}
            ]
        
        # Calculate premium based on risk
        premium_wei = calculate_premium_from_risk(risk_score, crop_type, area_ha, farming_method)
        
        # Get model metadata
        model_version = model_metadata.get('risk', {}).get('version', 'v2025-01-15-fallback')
        model_hash = model_metadata.get('risk', {}).get('hash', 'fallback-hash')
        
        response = {
            'riskScore': round(risk_score, 4),
            'premiumWei': str(premium_wei),  # String to handle large numbers
            'modelVersion': model_version,
            'modelHash': model_hash,
            'topFactors': top_factors,
            'scheme': 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
            'assessment': f"AI-based risk assessment for {crop_type} in {district} using {farming_method} methods.",
            'coverage': str(int(premium_wei * 10)),  # 10x premium as coverage
            'isEligible': risk_score < 0.8  # High risk threshold
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in insurance scoring: {e}")
        return jsonify({'error': 'Failed to calculate insurance score'}), 500

def calculate_fallback_risk(crop_type, farming_method, farmer_rating, insurance_status):
    """Fallback rule-based risk calculation"""
    base_risk = 0.3
    
    # Adjust based on crop type
    crop_risks = {
        'Cotton': 0.2,
        'Sugarcane': 0.15,
        'Rice': 0.1,
        'Wheat': 0.1,
        'Maize': 0.05,
        'Barley': 0.05
    }
    base_risk += crop_risks.get(crop_type, 0.1)
    
    # Adjust based on farming method
    if farming_method == 'Organic':
        base_risk += 0.1  # Organic has different risk profile
    
    # Adjust based on farmer rating (1-5, lower is worse)
    rating_adjustment = (6 - farmer_rating) * 0.05
    base_risk += rating_adjustment
    
    # Adjust based on insurance status
    if insurance_status == 0:  # Uninsured
        base_risk += 0.1
    
    return min(base_risk, 1.0)  # Cap at 1.0

# Enhanced Loan Evaluation Endpoint
@app.route('/api/loan/evaluate', methods=['POST'])
def loan_evaluate():
    """
    Advanced ML-based loan eligibility evaluation.
    Returns decision, programCode, and reasons with AI scoring.
    """
    try:
        data = request.get_json()
        
        # Extract features from request
        farmer_id = data.get('farmerId', 'unknown')
        land_size = float(data.get('landSize', 0))
        crop_type = data.get('cropType', 'Rice')
        farming_method = data.get('farmingMethod', 'Conventional')
        is_insured = data.get('isInsured', False)
        farmer_rating = int(data.get('farmerRating', 3))
        tools_owned = int(data.get('toolsOwned', 2))
        previous_repayment = data.get('previousLoanRepayment', 'Good')
        risk_score = float(data.get('riskScore', 0.5))
        district = data.get('district', 'Unknown')
        
        # Use ML model if available
        if loan_model is not None and 'loan' in scalers and 'loan' in label_encoders:
            try:
                # Prepare features for prediction
                features = np.array([[
                    land_size,
                    tools_owned,
                    1 if is_insured else 0,
                    farmer_rating,
                    label_encoders['loan']['cropType'].transform([crop_type])[0],
                    label_encoders['loan']['farmingMethod'].transform([farming_method])[0],
                    label_encoders['loan']['location'].transform([district])[0] if district in label_encoders['loan']['location'].classes_ else 0,
                    label_encoders['loan']['previousLoanRepayment'].transform([previous_repayment])[0]
                ]])
                
                # Scale features
                features_scaled = scalers['loan'].transform(features)
                
                # Predict eligibility probability
                eligibility_prob = loan_model.predict_proba(features_scaled)[0][1]
                ml_decision = eligibility_prob > 0.5
                
            except Exception as e:
                print(f"ML loan prediction failed: {e}")
                ml_decision = None
                eligibility_prob = 0.5
        else:
            ml_decision = None
            eligibility_prob = 0.5
        
        # Rule-based evaluation with multiple schemes
        matched_schemes = []
        reasons = []
        final_decision = "REJECT"
        
        # Rule 1: PM-Kisan (Income Support)
        if land_size <= 2.0:
            matched_schemes.append({
                'programCode': 'PM_KISAN',
                'name': 'PM-Kisan Scheme',
                'type': 'Income Support',
                'details': 'Provides income support of Rs 6,000/year for small farmers.',
                'isEligible': True,
                'amount': 6000
            })
            reasons.append("Eligible for PM-Kisan due to small landholding (≤2 hectares)")
            final_decision = "APPROVE"
        
        # Rule 2: Kisan Credit Card (KCC)
        if land_size > 0 and is_insured and farmer_rating >= 3:
            matched_schemes.append({
                'programCode': 'KCC',
                'name': 'Kisan Credit Card (KCC)',
                'type': 'Credit Facility',
                'details': 'Short-term credit facility with favorable terms.',
                'isEligible': True,
                'amount': int(land_size * 50000)  # 50k per hectare
            })
            reasons.append("Eligible for KCC due to insurance and good rating")
            final_decision = "APPROVE"
        
        # Rule 3: Regular Agricultural Loan
        if land_size > 2.0 and farmer_rating >= 3 and previous_repayment != 'Defaulted':
            loan_amount = int(land_size * 75000)  # 75k per hectare
            if risk_score < 0.7:  # Low to medium risk
                matched_schemes.append({
                    'programCode': 'AGR_LOAN',
                    'name': 'Agricultural Term Loan',
                    'type': 'Term Loan',
                    'details': f'Term loan for agricultural purposes. Amount: Rs {loan_amount:,}',
                    'isEligible': True,
                    'amount': loan_amount
                })
                reasons.append("Eligible for agricultural loan due to good credit and low risk")
                final_decision = "APPROVE"
            else:
                reasons.append("High risk score - requires manual review")
                final_decision = "REVIEW"
        
        # Rule 4: Crop Insurance Linked Loan
        if is_insured and farmer_rating >= 4:
            matched_schemes.append({
                'programCode': 'INS_LOAN',
                'name': 'Insurance Linked Agricultural Loan',
                'type': 'Secured Loan',
                'details': 'Lower interest rate loan backed by crop insurance.',
                'isEligible': True,
                'amount': int(land_size * 60000)
            })
            reasons.append("Eligible for insurance-linked loan due to coverage and excellent rating")
            final_decision = "APPROVE"
        
        # Override with ML decision if available and confident
        if ml_decision is not None:
            if eligibility_prob > 0.8 and not ml_decision:
                final_decision = "REJECT"
                reasons.append(f"ML model indicates high rejection probability ({eligibility_prob:.2f})")
            elif eligibility_prob > 0.8 and ml_decision:
                if final_decision == "REJECT":
                    final_decision = "REVIEW"
                reasons.append(f"ML model indicates high approval probability ({eligibility_prob:.2f})")
        
        # Risk-based adjustments
        if risk_score > 0.8:
            final_decision = "REVIEW" if final_decision == "APPROVE" else final_decision
            reasons.append("High risk score requires additional review")
        
        if previous_repayment == 'Defaulted':
            final_decision = "REJECT"
            reasons.append("Previous loan default history")
            matched_schemes = []  # Clear schemes for defaulters
        
        # Prepare response
        response = {
            'decision': final_decision,
            'programCode': matched_schemes[0]['programCode'] if matched_schemes else 'NONE',
            'reasons': reasons,
            'matchedSchemes': matched_schemes,
            'scoreBP': int(eligibility_prob * 10000),  # Basis points
            'mlConfidence': round(eligibility_prob, 3),
            'riskAssessment': {
                'riskScore': risk_score,
                'riskLevel': 'Low' if risk_score < 0.3 else 'Medium' if risk_score < 0.7 else 'High'
            },
            'modelVersion': model_metadata.get('loan', {}).get('version', 'v2025-01-15-fallback'),
            'evaluatedOn': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in loan evaluation: {e}")
        return jsonify({'error': 'Failed to evaluate loan application'}), 500

# Legacy endpoint for backward compatibility
@app.route('/api/loan/match', methods=['POST'])
def match_loan():
    """
    Legacy loan matching endpoint - redirects to new evaluate endpoint
    """
    return loan_evaluate()


# Additional AI endpoints for blockchain integration

@app.route('/api/model/info', methods=['GET'])
def get_model_info():
    """Get information about loaded models"""
    return jsonify({
        'models': {
            'risk': {
                'loaded': risk_model is not None,
                'metadata': model_metadata.get('risk', {}),
                'features': feature_importance.get('risk', [])[:5]  # Top 5 features
            },
            'loan': {
                'loaded': loan_model is not None,
                'metadata': model_metadata.get('loan', {}),
                'features': feature_importance.get('loan', [])[:5]  # Top 5 features
            }
        },
        'status': 'Models initialized' if risk_model and loan_model else 'Using fallback simulation'
    })

@app.route('/api/features/importance', methods=['GET'])
def get_feature_importance():
    """Get feature importance for explainability"""
    model_type = request.args.get('model', 'risk')
    if model_type in feature_importance:
        return jsonify({
            'model': model_type,
            'features': feature_importance[model_type],
            'modelVersion': model_metadata.get(model_type, {}).get('version', 'unknown')
        })
    else:
        return jsonify({'error': 'Model not found'}), 404

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': {
            'risk_model': risk_model is not None,
            'loan_model': loan_model is not None
        }
    })

@app.route('/api/simulate/weather', methods=['POST'])
def simulate_weather_data():
    """Simulate weather data for parametric index (future extension)"""
    data = request.get_json()
    district = data.get('district', 'Unknown')
    days = int(data.get('days', 30))
    
    # Simulate weather indices
    rainfall_index = np.random.normal(0, 1)  # Standard precipitation index
    temperature_anomaly = np.random.normal(0, 2)  # Temperature anomaly
    drought_risk = max(0, -rainfall_index) if rainfall_index < -1.5 else 0
    
    return jsonify({
        'district': district,
        'period_days': days,
        'indices': {
            'rainfall_spi': round(rainfall_index, 2),
            'temperature_anomaly': round(temperature_anomaly, 2),
            'drought_risk': round(drought_risk, 2),
            'wetness_index': round(max(0, rainfall_index), 2)
        },
        'alerts': [
            {'type': 'drought', 'active': rainfall_index < -1.5},
            {'type': 'excess_rain', 'active': rainfall_index > 2.0},
            {'type': 'heat_wave', 'active': temperature_anomaly > 3.0}
        ],
        'generated_at': datetime.now().isoformat()
    })

if __name__ == '__main__':
    # Initialize models on startup
    initialize_models()
    # Run the server on port 8000
    app.run(debug=True, port=8000)
