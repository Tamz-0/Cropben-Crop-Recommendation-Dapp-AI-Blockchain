#!/usr/bin/env python3
"""
Test script for the AI-enhanced agricultural platform
"""
import requests
import json

def test_insurance_scoring():
    """Test the insurance scoring endpoint"""
    url = "http://localhost:8000/api/insurance/score"
    test_data = {
        "cropType": "Apple",
        "areaHa": (50/1000),
        "farmingMethod": "Inorganic",
        "district": "Vellore",
        "farmerRating": 4,
        "toolsOwned": 10,
        "insuranceStatus": 0
    }
    
    try:
        response = requests.post(url, json=test_data)
        if response.status_code == 200:
            result = response.json()
            print("✅ Insurance Scoring Test Passed")
            print(f"Risk Score: {result['riskScore']}")
            print(f"Premium (Wei): {result['premiumWei']}")
            print(f"Model: {result['modelVersion']}")
            return True
        else:
            print(f"❌ Insurance test failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Insurance test error: {e}")
        return False

def test_loan_evaluation():
    """Test the loan evaluation endpoint"""
    url = "http://localhost:8000/api/loan/evaluate"
    test_data = {
        "farmerId": "farmer123",
        "landSize": 1.5,
        "cropType": "Wheat",
        "farmingMethod": "Conventional",
        "isInsured": True,
        "farmerRating": 4,
        "previousLoanRepayment": "Good",
        "riskScore": 0.3
    }
    
    try:
        response = requests.post(url, json=test_data)
        if response.status_code == 200:
            result = response.json()
            print("✅ Loan Evaluation Test Passed")
            print(f"Decision: {result['decision']}")
            print(f"Program: {result['programCode']}")
            print(f"Schemes: {len(result['matchedSchemes'])}")
            return True
        else:
            print(f"❌ Loan test failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Loan test error: {e}")
        return False

if __name__ == "__main__":
    print("Testing AI Agricultural Platform...")
    test_insurance_scoring()
    test_loan_evaluation()