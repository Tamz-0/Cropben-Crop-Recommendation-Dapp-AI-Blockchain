

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

## License

MIT

---

## Acknowledgements

- [Truffle Suite](https://www.trufflesuite.com/)
- [React](https://react.dev/)
- [Flask](https://flask.palletsprojects.com/)
- [scikit-learn](https://scikit-learn.org/)
