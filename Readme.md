# AI-Integrated Blockchain Framework for Transparent Agricultural Supply Chains

## Overview

This project delivers an innovative blockchain-based platform to enhance transparency, trust, and efficiency in agricultural supply chains. By combining smart contracts, machine learning, and a modern web client, the system provides:

- **Product Traceability:** End-to-end tracking of produce, origin verification, and organic certification.
- **AI-Based Crop Insurance:** ML-driven risk assessment and premium estimation for government schemes (e.g., PMFBY).
- **Rule-Based & AI-Enhanced Loan Matching:** Automated evaluation of farmer loan eligibility and mapping to financial programs (e.g., PM-Kisan).

Multi-role dashboards empower Consumers, Farmers, Vendors, Banks, Insurance Agencies, and Verifiers, ensuring transparency and accountability at every step.

---

## Features

### 1. Product Traceability
- Blockchain-backed tracking from farm to consumer.
- Origin and organic certification via validator nodes.

### 2. AI-Based Crop Insurance
- Machine learning models assess crop risk using real-time and historical data.
- Automated insurance eligibility and premium calculation.
- Integration with government schemes (PMFBY).

### 3. Smart Loan Services
- Rule engine and ML models evaluate loan eligibility.
- Maps farmers to suitable schemes (PM-Kisan, KCC, etc.).
- Considers landholding, crop, farming method, insurance, and repayment history.

### 4. Multi-Role Dashboards
- **Farmer:** Apply for insurance/loans, view product and loan history.
- **Bank:** Review and process loan applications.
- **Insurance:** Manage crop insurance policies.
- **Vendor/Consumer:** Trace product origin and certifications.
- **Verifier:** Peer-review and validate certifications.

---

## Project Structure

```
.
├── ai-server/                # Python Flask server for AI/ML endpoints
│   ├── app.py                # Main API server (insurance, loan, model mgmt)
│   ├── farmers_data.csv      # Training dataset
│   ├── requirements.txt      # Python dependencies
│   ├── test_ai.py            # API test script
│   └── artifacts/            # Trained model files and metadata
├── client/                   # React web client (multi-role dashboards)
│   ├── src/
│   │   ├── components/       # UI components (FarmerLoans, etc.)
│   │   ├── pages/            # Dashboard pages (FarmerDashboard, BankDashboard, etc.)
│   │   └── abis/             # Contract ABIs
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── contracts/                # Solidity smart contracts
│   ├── CropInsurance.sol
│   ├── LoanMatching.sol
│   ├── ProductLedger.sol
│   └── UserRegistry.sol
├── build/contracts/          # Compiled contract artifacts (ABIs, bytecode)
├── migrations/               # Truffle migration scripts
├── truffle-config.js         # Truffle config
└── README.md                 
```

---

## Quick Start

### 1. Prerequisites

- **Node.js** (v16+ recommended)
- **Python** (3.8+)
- **Truffle** (`npm install -g truffle`)
- **Ganache** (for local blockchain, or use testnet)
- **MetaMask** (browser extension)

### 2. Blockchain Setup

```sh
cd contracts
truffle compile
truffle migrate
```

### 3. AI Server Setup

```sh
cd ai-server
pip install -r requirements.txt
python app.py
```
- The AI server runs at `http://localhost:8000/` and exposes endpoints for insurance scoring and loan evaluation.

### 4. Client Setup

```sh
cd client
npm install
npm run dev
```
- The React app runs at `http://localhost:5173/` (or as shown in your terminal).

---

## API Endpoints

### Insurance Scoring

```http
POST /api/insurance/score
{
  "cropType": "Rice",
  "areaHa": 2.5,
  "farmingMethod": "Organic",
  "district": "Kerala",
  "toolsOwned": 3,
}
```

### Loan Evaluation

```http
POST /api/loan/evaluate
{
  "farmerId": "farmer123",
  "landSize": 1.5,
  "cropType": "Wheat",
  "isInsured": true,
  "previousLoanRepayment": "Good"
}
```

---

## Model Performance

- **Risk Model Accuracy:** ~85-90%
- **Loan Model Accuracy:** ~95-98%
- **Explainability:** Top features and reasoning returned with each prediction.

---

## Blockchain Integration Points

- **Premium in Wei:** Directly usable by smart contracts.
- **Model Hashing:** Immutable version tracking.
- **Risk Scoring:** Standardized [0,1] scale.
- **Decision Auditing:** Full reasoning chain for loan/insurance decisions.

---

## Future Enhancements

- Real-time weather and IoT data integration.
- Parametric insurance index calculations.
- Advanced ensemble models (XGBoost, Neural Networks).
- Time-series forecasting for crop yields.

---

## License

MIT

---

## Acknowledgements

- [Truffle Suite](https://www.trufflesuite.com/)
- [React](https://react.dev/)
- [Flask](https://flask.palletsprojects.com/)
- [scikit-learn](https://scikit-learn.org/)