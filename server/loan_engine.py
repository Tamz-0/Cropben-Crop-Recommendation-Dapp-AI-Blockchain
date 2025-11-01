from datetime import datetime

class LoanMatchingEngine:
    def __init__(self):
        self.loan_schemes = self.initialize_loan_schemes()
        self.rules = self.initialize_rules()

    def initialize_loan_schemes(self):
        return {
            "PM_KISAN": {
                "name": "PM-Kisan Samman Nidhi",
                "description": "Direct income support of ₹6,000 per year",
                "type": "direct_benefit",
                "eligibility": {
                    "landHolding": {"max": 2}, # hectares
                    "farmerCategory": ["marginal", "small"],
                    "insuranceRequired": False
                },
                "benefits": {
                    "amount": 6000,
                    "frequency": "annual",
                    "installments": 3,
                    "installmentAmount": 2000
                },
                "priority": 1
            },
            "KCC_SMALL": {
                "name": "Kisan Credit Card - Small Farmer",
                "description": "Short-term credit facility for agricultural needs",
                "type": "credit_facility",
                "eligibility": {
                    "landHolding": {"min": 0.1, "max": 2},
                    "farmerCategory": ["marginal", "small"],
                    "insuranceRequired": False,
                    "insuranceBonus": True
                },
                "benefits": {
                    "creditLimit": "crop_based",
                    "interestRate": 7,
                    "subsidyRate": 3,
                    "effectiveRate": 4
                },
                "priority": 2
            },
            "KCC_MEDIUM": {
                "name": "Kisan Credit Card - Medium/Large Farmer",
                "description": "Credit facility for medium and large scale farming",
                "type": "credit_facility",
                "eligibility": {
                    "landHolding": {"min": 2},
                    "farmerCategory": ["medium", "large"],
                    "insuranceRequired": False,
                    "insuranceBonus": True
                },
                "benefits": {
                    "creditLimit": "crop_based",
                    "interestRate": 7,
                    "subsidyRate": 3,
                    "effectiveRate": 4
                },
                "priority": 2
            },
            "PMFBY_LINKED_LOAN": {
                "name": "PMFBY-Linked Agricultural Loan",
                "description": "Special loan for insured farmers under PMFBY",
                "type": "insurance_linked",
                "eligibility": {
                    "landHolding": {"min": 0.5},
                    "farmerCategory": ["all"],
                    "insuranceRequired": True
                },
                "benefits": {
                    "creditLimit": "enhanced",
                    "interestRate": 6,
                    "subsidyRate": 4,
                    "effectiveRate": 2,
                    "additionalBenefits": "Lower interest due to reduced risk"
                },
                "priority": 1
            },
            "ORGANIC_FARMING_LOAN": {
                "name": "Organic Farming Development Loan",
                "description": "Special loan scheme for organic farmers",
                "type": "development_loan",
                "eligibility": {
                    "landHolding": {"min": 0.5},
                    "farmerCategory": ["all"],
                    "farmingMethod": ["Organic"],
                    "insuranceRequired": False
                },
                "benefits": {
                    "maxAmount": 500000,
                    "interestRate": 6.5,
                    "subsidyRate": 2,
                },
                "priority": 2
            },
            "NABARD_CROP_LOAN": {
                "name": "NABARD Crop Loan",
                "description": "Refinanced loan for crop production",
                "type": "crop_loan",
                "eligibility": {
                    "landHolding": {"min": 1},
                    "farmerCategory": ["small", "medium", "large"],
                    "insuranceRequired": False,
                    "cropSpecific": ["Rice", "Wheat", "Cotton", "Sugarcane"]
                },
                "benefits": {
                    "interestRate": 9,
                    "subsidyAvailable": True,
                    "creditLimit": "crop_based"
                },
                "priority": 3
            },
        }

    def initialize_rules(self):
        def categorize_farmer(land_size):
            if land_size <= 1: return "marginal"
            if land_size <= 2: return "small"
            if land_size <= 4: return "medium"
            return "large"

        def calculate_credit_limit(land_size, crop_type, farming_method):
            crop_base_limits = {
                "Rice": 40000, "Wheat": 35000, "Cotton": 55000,
                "Sugarcane": 70000, "Vegetables": 60000, "Pulses": 30000,
                "Default": 35000
            }
            base_limit = crop_base_limits.get(crop_type, crop_base_limits["Default"]) * land_size
            organic_multiplier = 1.25 if farming_method == "Organic" else 1.0
            return round(base_limit * organic_multiplier)

        def assess_risk(is_insured, farming_method, land_size):
            risk_score = 50
            if is_insured: risk_score -= 20
            if farming_method == "Organic": risk_score -= 10
            if land_size < 0.5: risk_score += 15
            if land_size > 3: risk_score -= 10
            
            if risk_score <= 30: return "low"
            if risk_score <= 60: return "medium"
            return "high"

        def get_crop_category(crop_type):
            if crop_type in ["Cotton", "Sugarcane", "Tobacco"]: return "cash_crop"
            if crop_type in ["Rice", "Wheat", "Maize", "Pulses"]: return "food_grain"
            if crop_type in ["Vegetables", "Fruits"]: return "horticulture"
            return "other"

        return {
            "categorize_farmer": categorize_farmer,
            "calculate_credit_limit": calculate_credit_limit,
            "assess_risk": assess_risk,
            "get_crop_category": get_crop_category
        }

    def generate_report(self, blockchain_payload):
        matches = self.match_loans(blockchain_payload)
        farmer_category = self.rules["categorize_farmer"](blockchain_payload.get("landSize", 0))
        crop_category = self.rules["get_crop_category"](blockchain_payload.get("cropType"))
        overall_risk = self.rules["assess_risk"](
            blockchain_payload.get("isInsured", False),
            blockchain_payload.get("farmingMethod", "Inorganic"),
            blockchain_payload.get("landSize", 0)
        )
        max_limit = 0
        if matches:
            max_limit = max(m.get("estimatedAmount", 0) for m in matches)

        return {
            "timestamp": datetime.now().isoformat(),
            "farmerProfile": {
                "landSize": blockchain_payload.get("landSize"),
                "category": farmer_category,
                "cropType": blockchain_payload.get("cropType"),
                "cropCategory": crop_category,
                "farmingMethod": blockchain_payload.get("farmingMethod"),
                "isInsured": blockchain_payload.get("isInsured"),
                "district": blockchain_payload.get("district", "Not specified")
            },
            "eligibleSchemes": matches,
            "totalEligibleSchemes": len(matches),
            "topRecommendation": matches[0] if matches else None,
            "overallRisk": overall_risk,
            "maxCreditLimit": max_limit
        }

    def match_loans(self, blockchain_payload):
        eligible_schemes = []
        land_size = blockchain_payload.get("landSize", 0)
        farmer_category = self.rules["categorize_farmer"](land_size)

        for scheme_id, scheme in self.loan_schemes.items():
            eligibility = self.evaluate_eligibility(
                scheme,
                blockchain_payload,
                farmer_category
            )
            if eligibility["isEligible"]:
                eligible_schemes.append({
                    "schemeId": scheme_id,
                    "schemeName": scheme.get("name"),
                    "description": scheme.get("description"),
                    "type": scheme.get("type"),
                    "benefits": scheme.get("benefits"),
                    "matchScore": eligibility["score"],
                    "priority": scheme.get("priority"),
                    "recommendations": eligibility["recommendations"],
                    "estimatedAmount": eligibility["estimatedAmount"]
                })
        
        eligible_schemes.sort(key=lambda x: (x["priority"], -x["matchScore"]))
        return eligible_schemes

    def evaluate_eligibility(self, scheme, payload, farmer_category):
        score = 100
        recommendations = []
        is_eligible = True
        eligibility_rules = scheme.get("eligibility", {})
        
        land_holding_rules = eligibility_rules.get("landHolding", {})
        if "min" in land_holding_rules and payload.get("landSize", 0) < land_holding_rules["min"]:
            is_eligible = False
        if "max" in land_holding_rules and payload.get("landSize", 0) > land_holding_rules["max"]:
            is_eligible = False

        category_rules = eligibility_rules.get("farmerCategory", [])
        if "all" not in category_rules and farmer_category not in category_rules:
            is_eligible = False

        method_rules = eligibility_rules.get("farmingMethod")
        if method_rules and payload.get("farmingMethod") not in method_rules:
            is_eligible = False

        if eligibility_rules.get("insuranceRequired") and not payload.get("isInsured"):
            is_eligible = False
            recommendations.append("Crop insurance is required for this scheme.")
        
        if eligibility_rules.get("insuranceBonus") and payload.get("isInsured"):
            score = min(100, score + 20)
            recommendations.append("Insurance coverage provides better loan terms.")
        
        crop_rules = eligibility_rules.get("cropSpecific")
        if crop_rules and payload.get("cropType") not in crop_rules:
            score -= 15 
            recommendations.append(f"Scheme optimized for: {', '.join(crop_rules)}")

        estimated_amount = self.rules["calculate_credit_limit"](
            payload.get("landSize", 0),
            payload.get("cropType", "Default"),
            payload.get("farmingMethod", "Inorganic")
        )
        
        if scheme["benefits"].get("creditLimit") != "crop_based":
             estimated_amount = scheme["benefits"].get("maxAmount", estimated_amount)

        return {
            "isEligible": is_eligible,
            "score": max(0, min(100, score)),
            "recommendations": recommendations,
            "estimatedAmount": estimated_amount
        }