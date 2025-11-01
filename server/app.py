from flask import Flask, request, jsonify
from utils import enrich_data, build_features, predict_risk, calculate_premium
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return """
    <h2>AI Crop Insurance API</h2>
    <p>POST to <code>/insurance/estimate</code> with JSON:</p>
    <pre>
{
  "cropType": "Rice",
  "areaHa": 2.5,
  "farmingMethod": "Organic",
  "district": "Kerala",
  "sowing_month": 7
}
    </pre>
    """

@app.route('/insurance/estimate', methods=['POST'])
def estimate_insurance():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400

        required = ["cropType", "areaHa", "farmingMethod", "district"]
        for field in required:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        if data["cropType"] not in ["Wheat", "Rice", "Maize", "Barley", "Soybean", "Cotton"]:
            return jsonify({"error": "Invalid cropType"}), 400

        if data["farmingMethod"] not in ["Organic", "Conventional"]:
            return jsonify({"error": "farmingMethod must be 'Organic' or 'Conventional'"}), 400

        if not isinstance(data["areaHa"], (int, float)) or data["areaHa"] <= 0:
            return jsonify({"error": "areaHa must be positive number"}), 400

        sowing_month = data.get("sowing_month")
        if sowing_month is not None and not (1 <= sowing_month <= 12):
            return jsonify({"error": "sowing_month must be 1-12"}), 400
        data["sowing_month"] = sowing_month
        data["irrigationUsed"] = data.get("irrigationUsed", True)

        # Enrich
        enriched = enrich_data(data)

        # Build features
        features = build_features(enriched)

        # Predict risk
        risk = predict_risk(features)

        # Calculate premium
        result = calculate_premium(data, data["areaHa"], risk)

        return jsonify({
            "status": "success",
            "input": data,
            "enriched_features": enriched,
            "prediction": result
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)