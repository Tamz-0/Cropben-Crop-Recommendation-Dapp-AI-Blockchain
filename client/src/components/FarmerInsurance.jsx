import React, { useState, useEffect } from "react";

// Helper function to get a Tailwind CSS class based on policy status for color-coding
const getStatusClass = (status) => {
  const s = Number(status);
  switch (s) {
    case 1:
      return "text-green-600 font-semibold"; // Active
    case 6:
      return "text-red-600 font-semibold"; // Rejected
    case 4:
      return "text-blue-600 font-semibold"; // PaidOut
    case 5:
      return "text-gray-500"; // Expired
    default:
      return "text-yellow-600 font-semibold"; // Pending statuses
  }
};

// Helper function to convert policy status enum to a readable string
const statusToString = (status) => {
  const statuses = [
    "Pending Approval",
    "Active",
    "Claim Requested",
    "Claim Approved",
    "Paid Out",
    "Expired",
    "Rejected",
  ];
  return statuses[Number(status)] || "Unknown";
};

const FarmerInsurance = ({ cropInsurance, account, showNotification }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    if (!cropInsurance) return;
    setLoading(true);
    try {
      const fetchedPolicies = await cropInsurance.methods
        .getPoliciesByFarmer(account)
        .call();

      setPolicies(fetchedPolicies.reverse());
    } catch (err) {
      console.error("Error fetching policies:", err);
      showNotification("Could not fetch insurance policies.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [cropInsurance, account]);

  const handleRequestClaim = async (policyId) => {
    try {
      await cropInsurance.methods
        .requestClaim(policyId)
        .send({ from: account });
      showNotification(
        `Claim requested for Policy #${policyId}. The insurer will be notified.`,
        "success"
      );
      fetchPolicies();
    } catch (err) {
      console.error("Error requesting claim:", err);
      showNotification(
        "Failed to request claim. Ensure the policy is active.",
        "error"
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">My Insurance Policies</h3>
      {loading ? (
        <p>Loading policies...</p>
      ) : (
        <div className="space-y-4">
          {policies.length > 0 ? (
            policies.map((policy) => (
              <div
                key={policy.id}
                className="border p-4 rounded-lg shadow-sm bg-gray-50"
              >
                <p className="font-bold text-gray-800">
                  Policy ID: {String(policy.id)} (for Product ID:{" "}
                  {String(policy.productId)})
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={getStatusClass(policy.status)}>
                    {statusToString(policy.status)}
                  </span>
                </p>
                <p>
                  <strong>Sum Insured:</strong> {String(policy.sumInsured)} INR
                </p>
                <p>
                  <strong>Premium:</strong> {String(policy.premium)} INR
                </p>
                {Number(policy.status) === 1 && (
                  <button
                    onClick={() => handleRequestClaim(policy.id)}
                    className="mt-2 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    File a Claim
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              You have no active or past insurance policies.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmerInsurance;
