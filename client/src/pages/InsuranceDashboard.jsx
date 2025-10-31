import { useState, useEffect } from "react";

const policyStatusToString = (status) => {
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
    case 3:
      return "text-indigo-600 font-semibold"; // Claim Approved
    default:
      return "text-yellow-600 font-semibold"; // Pending/Requested
  }
};

const InsuranceDashboard = ({ cropInsurance, account, showNotification }) => {
  const [pendingPolicies, setPendingPolicies] = useState([]);
  const [activeClaims, setActiveClaims] = useState([]);
  const [historicalPolicies, setHistoricalPolicies] = useState([]); // 🆕 For policy history
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!cropInsurance) return;
    setLoading(true);
    try {
      const policyCounter = await cropInsurance.methods.policyCounter().call();
      const pending = [];
      const claims = [];
      const historical = [];

      for (let i = 1; i <= policyCounter; i++) {
        const p = await cropInsurance.methods.policies(i).call();
        if (p.insuranceProvider.toLowerCase() === account.toLowerCase()) {
          const status = Number(p.status);
          if (status === 0) {
            pending.push(p);
          } else if (status === 2) {
            claims.push(p);
          } else {
            historical.push(p);
          }
        }
      }
      setPendingPolicies(pending.reverse());
      setActiveClaims(claims.reverse());
      setHistoricalPolicies(historical.reverse());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      showNotification(
        "Could not fetch dashboard data from the blockchain.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [cropInsurance, account]);

  const handleApprovePolicy = async (policyId) => {
    try {
      await cropInsurance.methods
        .approvePolicy(policyId)
        .send({ from: account });
      showNotification(
        `Policy #${policyId} has been approved and is now active!`,
        "success"
      );
      fetchDashboardData();
    } catch (err) {
      console.error("Error approving policy:", err);
      showNotification(
        "Failed to approve policy. The transaction may have been rejected.",
        "error"
      );
    }
  };

  const handleRejectPolicy = async (policyId) => {
    try {
      await cropInsurance.methods
        .rejectPolicy(policyId)
        .send({ from: account });
      showNotification(`Policy #${policyId} has been rejected.`, "info");
      fetchDashboardData();
    } catch (err) {
      console.error("Error rejecting policy:", err);
      showNotification(
        "Failed to reject policy. The transaction may have been rejected.",
        "error"
      );
    }
  };

  const handleApproveClaim = async (policyId) => {
    try {
      await cropInsurance.methods
        .approveClaim(policyId)
        .send({ from: account });
      showNotification(
        `Claim for Policy #${policyId} has been approved.`,
        "success"
      );
      fetchDashboardData();
    } catch (err) {
      console.error("Error approving claim:", err);
      showNotification(
        "Failed to approve claim. Please check the policy status.",
        "error"
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
      <h3 className="text-2xl font-semibold mb-4">Insurance Agent Dashboard</h3>

      <div>
        <h4 className="text-xl font-semibold mb-2">Pending Policy Approvals</h4>
        {loading ? (
          <p>Loading...</p>
        ) : pendingPolicies.length > 0 ? (
          pendingPolicies.map((p) => (
            <div
              key={p.id}
              className="border p-4 rounded-md flex justify-between items-center mb-3"
            >
              <div>
                <p>
                  <strong>Policy ID:</strong> {String(p.id)} (for Product #
                  {String(p.productId)})
                </p>
                <p className="text-sm">
                  <strong>Farmer:</strong>{" "}
                  <span className="font-mono text-xs">{p.farmer}</span>
                </p>
                <p>
                  <strong>Sum Insured:</strong> {String(p.sumInsured)} INR
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApprovePolicy(p.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRejectPolicy(p.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">
            No policies are awaiting your approval.
          </p>
        )}
      </div>

      <div>
        <h4 className="text-xl font-semibold mb-2">Pending Claims</h4>
        {loading ? (
          <p>Loading...</p>
        ) : activeClaims.length > 0 ? (
          activeClaims.map((p) => (
            <div
              key={p.id}
              className="border p-4 rounded-md flex justify-between items-center mb-3"
            >
              <div>
                <p>
                  <strong>Policy ID:</strong> {String(p.id)}
                </p>
                <p className="text-sm">
                  <strong>Farmer:</strong>{" "}
                  <span className="font-mono text-xs">{p.farmer}</span>
                </p>
                <p>
                  <strong>Claim Status:</strong>{" "}
                  <span className="font-semibold">
                    {policyStatusToString(p.status)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleApproveClaim(p.id)}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                Approve Claim
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">
            No active claims require your attention.
          </p>
        )}
      </div>

      <div>
        <h4 className="text-xl font-semibold mb-2">Policy History</h4>
        {loading ? (
          <p>Loading...</p>
        ) : historicalPolicies.length > 0 ? (
          historicalPolicies.map((p) => (
            <div key={p.id} className="border p-4 rounded-md mb-3 bg-gray-50">
              <div>
                <p className="font-bold text-gray-800">
                  Policy ID: {String(p.id)}
                </p>
                <p className="text-sm">
                  <strong>Farmer:</strong>{" "}
                  <span className="font-mono text-xs">{p.farmer}</span>
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={getStatusClass(p.status)}>
                    {policyStatusToString(p.status)}
                  </span>
                </p>
                <p>
                  <strong>Sum Insured:</strong> {String(p.sumInsured)} INR
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No historical policy data available.</p>
        )}
      </div>
    </div>
  );
};

export default InsuranceDashboard;
