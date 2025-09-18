# AI-Enhanced Agricultural Platform

## Overview

This AI server implements advanced machine learning models for crop insurance risk assessment and loan eligibility evaluation, designed to integrate with blockchain-based agricultural supply chain systems.

## Features Implemented

### ✅ Risk Assessment & Insurance Scoring
- **ML-based risk scoring** using Gradient Boosting Classifier
- **Premium calculation** in Wei for blockchain integration  
- **Feature importance** analysis for explainability
- **Model versioning** with SHA256 hashing for auditability
- **PMFBY scheme integration** with premium caps

### ✅ Loan Eligibility Evaluation  
- **Multi-scheme matching** (PM-Kisan, KCC, Agricultural Loans)
- **ML-enhanced decision making** with confidence scoring
- **Risk-based adjustments** and rule engine
- **Comprehensive reasoning** for transparency

### ✅ Model Training & Management
- **Automated model training** from farmers dataset (1M records)
- **Feature encoding** for categorical variables
- **Model persistence** and metadata tracking
- **Performance monitoring** and accuracy reporting

## Dataset Information

- **Size**: 1,000,000 farmer records
- **Features**: landSize, cropType, farmingMethod, toolsOwned, insuranceStatus, farmerRating, location, previousLoanRepayment
- **Target**: LoanEligible (binary classification)
- **Balance**: ~90% not eligible, 10% eligible (realistic distribution)

## API Endpoints

### Insurance Scoring
```
POST /api/insurance/score
{
  "cropType": "Rice",
  "areaHa": 2.5,
  "farmingMethod": "Organic", 
  "district": "Kerala",
  "farmerRating": 4,
  "toolsOwned": 3,
  "insuranceStatus": 1
}
```

### Loan Evaluation  
```
POST /api/loan/evaluate
{
  "farmerId": "farmer123",
  "landSize": 1.5,
  "cropType": "Wheat",
  "isInsured": true,
  "farmerRating": 4,
  "previousLoanRepayment": "Good"
}
```

## Setup Instructions

1. **Install Dependencies**
   ```
   pip install -r requirements.txt
   ```

2. **Run the Server**
   ```
   python app.py
   ```

3. **Test the APIs**
   ```
   python test_ai.py
   ```

## Model Performance

- **Risk Model Accuracy**: ~85-90% (varies with data split)
- **Loan Model Accuracy**: ~95-98% (high accuracy due to clear patterns)
- **Feature Engineering**: Automated categorical encoding and scaling
- **Explainability**: Top contributing features returned with each prediction

## Blockchain Integration Points

- **Premium in Wei**: Direct integration with smart contracts
- **Model Hashing**: Immutable model version tracking
- **Risk Scoring**: Standardized [0,1] scale with basis points
- **Decision Auditing**: Complete reasoning chain for loan decisions

## Future Enhancements

- **Real-time weather data** integration
- **IoT sensor data** processing  
- **Parametric insurance** index calculations
- **Advanced ensemble models** (XGBoost, Neural Networks)
- **Time-series forecasting** for crop yields