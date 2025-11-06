# AgriChain: AI-Integrated Blockchain for Agricultural Transparency

**AgriChain** is a full-stack, decentralized application designed to revolutionize the agricultural supply chain. By integrating a React frontend, a Python AI-backend, and Solidity smart contracts, this platform provides end-to-end product traceability, AI-driven crop insurance, and intelligent loan matching for farmers.

The system creates an immutable, transparent, and intelligent ecosystem connecting Farmers, Vendors, Consumers, Banks, Insurance Providers, and Verifiers.

-----

## 🚀 Key Features

  * **Multi-Role-Based Access Control:** A robust `UserRegistry` contract provides distinct dashboards and permissions for each participant:

      * 🚜 **Farmer:** Manage products, apply for insurance, and request loans.
      * 🏪 **Vendor:** Purchase products from farmers, manage inventory, and confirm receipts.
      * 🛍️ **Consumer:** Trace a product's full journey from "Sown" to "Sold".
      * 🏦 **Bank:** Review and approve on-chain loan applications.
      * 🛡️ **Insurance:** Approve and manage crop insurance policies.
      * ✅ **Verifier:** Certify products (e.g., as "Organic").
      * 🔒 **Admin (Owner):** Add and manage official Bank, Insurance, and Verifier entities.

  * **Immutable Product Traceability:** The `ProductLedger` contract tracks every step:

      * `Sown` -\> `Harvested` -\> `InTransit` -\> `AtVendor` -\> `Sold`.
      * Consumers can scan a QR code (or use the public page) to view a product's full history.

  * **AI-Powered Crop Insurance:**

      * Farmers can request an insurance quote for a "Sown" product.
      * The React client sends on-chain data (crop type, location, land size) to the AI server's `/insurance/estimate` endpoint.
      * The AI (using `scikit-learn`) enriches this data (weather, soil type) and predicts a risk score (low, medium, high) to calculate a premium.
      * The `CropInsurance` contract logs the policy request, allowing an insurance agent to approve or reject it on-chain.

  * **AI-Driven Loan Matching:**

      * Farmers can "Find Eligible Loan Schemes" from their dashboard.
      * The AI server's `/loan/evaluate` endpoint receives the farmer's on-chain profile (land size, crop type, insurance status).
      * A rule-based `LoanMatchingEngine` assesses risk and matches the farmer with suitable loan schemes (e.g., KCC, PMFBY-Linked).
      * The farmer can then select a scheme and submit an application to the `LoanMatching` contract, which a Bank agent can then approve.

-----

## 🛠 Technology Stack

  * **Blockchain:**

      * **Solidity:** For writing smart contracts.
      * **Truffle:** For contract compilation and migration.
      * **Ganache:** For local blockchain development.
      * **Web3.js (v4):** Used in the client to interact with smart contracts.

  * **Frontend (Client):**

      * **React 19**
      * **Vite:** As the build tool and development server.
      * **TailwindCSS:** For utility-first styling (inferred from `className` attributes in JSX files).
      * **React Router (v7):** For client-side routing.

  * **AI Backend (Server):**

      * **Python 3.10**
      * **Flask:** As the web server to expose AI endpoints.
      * **scikit-learn:** For the risk prediction model.
      * **Pandas:** For data manipulation.

  * **Deployment:**

      * **Docker & Docker Compose:** The entire application (blockchain, migration, server, client) is containerized for easy setup and deployment.

-----

## 🚦 Getting Started (Docker)

The simplest way to run the entire application stack is using Docker Compose.

### Prerequisites

  * [Docker](https://www.docker.com/products/docker-desktop/)
  * [Docker Compose](https://docs.docker.com/compose/install/)
  * A **WeatherAPI Key** (for the AI server). Get one at [weatherapi.com](https://www.weatherapi.com/).
  * **MetaMask** browser extension, configured to connect to `http://localhost:7545`.

### Installation & Setup

1.  **Clone the Repository:**

    ```sh
    git clone <repository-url>
    cd smart-agri-blockchain
    ```

2.  **Create Environment File:**
    Create a `.env` file in the project's root directory. The `docker-compose.yml` file requires these variables:

    ```env
    # A 12-word mnemonic phrase for Ganache to generate accounts
    MNEMONIC="your twelve word mnemonic phrase here"

    # Your API key from weatherapi.com
    WEATHER_API_KEY="your_weather_api_key_here"
    ```

3.  **Build and Run with Docker Compose:**
    This single command will build the images, start all services, and migrate the contracts.

    ```sh
    docker-compose up --build
    ```

4.  **Access the Application:**

      * **Frontend (React):** `http://localhost:5173`
      * **AI Server (Flask):** `http://localhost:5000`
      * **Blockchain (Ganache):** `http://localhost:7545` (This is the RPC URL for MetaMask)

5.  **Configure MetaMask:**

      * Open MetaMask and add a new network:
          * **Network Name:** `Local Ganache`
          * **New RPC URL:** `http://localhost:7545`
          * **Chain ID:** `5777` (or as set in `docker-compose.yml`)
      * Import accounts into MetaMask using the `MNEMONIC` you provided in the `.env` file. The first account is the **Admin/Owner**. The others (`accounts[1]`, `accounts[2]`, etc.) are pre-registered as Banks, Insurers, etc., by the migration script.

-----

## 📦 Project Components

### Smart Contracts (`/contracts`)

  * **`UserRegistry.sol`**: The central hub for identity. It maps wallet addresses to user data, including their role (Farmer, Bank, etc.) and land size.
  * **`ProductLedger.sol`**: The core of the supply chain. It stores `ProductCore` data (ID, owner, stage) and `ProductMetadata` (name, location). It also logs `TraceEvent` structs for each stage change.
  * **`CropInsurance.sol`**: Manages insurance policies. It links a `policyId` to a `productId` and stores the sum insured, premium (in WEI), and status (Pending, Active, Claimed, etc.).
  * **`LoanMatching.sol`**: Manages the loan lifecycle. Farmers `applyForLoan`, and Banks `updateLoanStatus`. It tracks the status (Pending, Approved, Repaid, etc.).

### AI Server (`/server`)

  * **`app.py`**: The Flask server that defines the API.
      * **`POST /insurance/estimate`**: Receives farmer data, calls the utility functions to get a risk profile and premium, and returns a JSON response.
      * **`POST /loan/evaluate`**: Receives a farmer's profile, uses the `LoanMatchingEngine` to find eligible schemes, and returns a detailed report.
  * **`utils.py`**: A helper for the insurance module. It fetches weather data, enriches the input, builds the feature vector, and calls the loaded `risk_model.pkl` to get a prediction.
  * **`loan_engine.py`**: A rule-based engine that defines and evaluates loan schemes (e.g., "PM\_KISAN", "KCC\_SMALL"). It checks the farmer's profile against eligibility rules to generate a report.
  * **`train_model.py`**: A script (not run at runtime) used to train the `RandomForestClassifier` model and save it as `model/risk_model.pkl`.

-----

## 🔮 Future Scope & AI Enhancements

The current AI implementation (a `RandomForestClassifier` and a rule-based engine) provides a strong foundation. This can be significantly expanded:

  * **Advanced ML Models:** Upgrade the insurance risk model from a `RandomForestClassifier` to more advanced architectures like **Gradient Boosting Machines (XGBoost, LightGBM)** or **Neural Networks**. This would improve the accuracy of risk prediction and premium calculation.

  * **Real-Time Data Integration:** Integrate with **on-farm IoT sensors** (e.g., for soil moisture, temperature, humidity) and satellite imagery. This live data would feed into the AI models for dynamic risk assessment, moving beyond the current 90-day forecast.

  * **ML-Based Loan Engine:** Evolve the `LoanMatchingEngine` from rule-based matching to a predictive machine learning model. This new model could assess a farmer's creditworthiness and default risk based on their on-chain history (yields, insurance claims, past loan repayments) to offer more personalized financial products.

  * **Parametric Insurance Oracles:** Implement **parametric (index-based) insurance**. In this model, the `CropInsurance.sol` contract could automatically execute a payout if an external, trusted data source (an "oracle") reports a trigger event (e.g., rainfall in a district below 20mm for 30 consecutive days).

  * **Predictive Yield Forecasting:** Create a new AI endpoint for time-series forecasting to predict **future crop yields**. This would provide valuable insights for farmers (when to sell) and vendors (managing future inventory).

-----

## License

This project is licensed under the Apache License 2.0.