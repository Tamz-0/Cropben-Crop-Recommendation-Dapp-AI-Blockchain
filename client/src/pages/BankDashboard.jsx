import { useState, useEffect } from "react";

const loanStatusToString = (status) => {
  const statuses = ["Pending", "Approved", "Disbursed", "Repaid", "Rejected"];
  return statuses[Number(status)] || "Unknown";
};

const getStatusClass = (status) => {
  const s = Number(status);
  switch (s) {
    case 1:
      return "text-green-600 font-semibold"; // Approved
    case 2:
      return "text-blue-600 font-semibold"; // Disbursed
    case 3:
      return "text-indigo-600 font-semibold"; // Repaid
    case 4:
      return "text-red-600 font-semibold"; // Rejected
    default:
      return "text-yellow-600 font-semibold"; // Pending
  }
};

const BankDashboard = ({ loanMatching, account, showNotification }) => {
  const [pendingApplications, setPendingApplications] = useState([]);
  const [historicalApplications, setHistoricalApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    if (!loanMatching) return;
    setLoading(true);
    try {
      const count = await loanMatching.methods.applicationCounter().call();
      const pendingApps = [];
      const historicalApps = [];
      for (let i = 1; i <= count; i++) {
        const app = await loanMatching.methods.applications(i).call();
        if (app.bank.toLowerCase() === account.toLowerCase()) {
          if (Number(app.status) === 0) {
            pendingApps.push(app);
          } else {
            historicalApps.push(app);
          }
        }
      }
      setPendingApplications(pendingApps.reverse());
      setHistoricalApplications(historicalApps.reverse());
    } catch (err) {
      console.error("Error fetching loan applications:", err);
      showNotification("Could not fetch loan applications.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [loanMatching, account]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await loanMatching.methods
        .updateLoanStatus(appId, newStatus)
        .send({ from: account });
      showNotification(
        `Application #${appId} status updated successfully.`,
        "success"
      );
      fetchApplications();
    } catch (err) {
      showNotification("Failed to update loan status.", "error");
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
      <h3 className="text-2xl font-semibold mb-4">Bank Loan Dashboard</h3>

      <div>
        <h4 className="text-xl font-semibold mb-2">Pending Applications</h4>
        {loading ? (
          <p>Loading applications...</p>
        ) : (
          <div className="space-y-4">
            {pendingApplications.length > 0 ? (
              pendingApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border rounded-md flex justify-between items-center"
                >
                  <div>
                    <p>
                      <strong>App ID:</strong> {String(app.id)}
                    </p>
                    <p className="text-sm">
                      <strong>Farmer:</strong>{" "}
                      <span className="font-mono text-xs">{app.farmer}</span>
                    </p>
                    <p>
                      <strong>Amount:</strong> {String(app.amount)} Wei
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(app.id, 1)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 4)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                No pending applications for this bank.
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xl font-semibold mb-2">Loan History</h4>
        {loading ? (
          <p>Loading history...</p>
        ) : (
          <div className="space-y-4">
            {historicalApplications.length > 0 ? (
              historicalApplications.map((app) => (
                <div key={app.id} className="p-4 border rounded-md bg-gray-50">
                  <div>
                    <p className="font-bold text-gray-800">
                      App ID: {String(app.id)}
                    </p>
                    <p className="text-sm">
                      <strong>Farmer:</strong>{" "}
                      <span className="font-mono text-xs">{app.farmer}</span>
                    </p>
                    <p>
                      <strong>Amount:</strong> {String(app.amount)} Wei
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={getStatusClass(app.status)}>
                        {loanStatusToString(app.status)}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                No historical loan data available.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankDashboard;
