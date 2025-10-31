import { useState, useEffect } from "react";

const loanStatusToString = (status) => {
  const statuses = ["Pending", "Approved", "Disbursed", "Repaid", "Rejected"];
  return statuses[Number(status)] || "Unknown";
};

const FarmerLoans = ({
  loanMatching,
  cropInsurance,
  productLedger,
  userRegistry,
  account,
  showNotification,
}) => {
  // Form State
  const [selectedBankAddress, setSelectedBankAddress] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // State to hold the list of available banks
  const [banks, setBanks] = useState([]);

  // Application List State
  const [applications, setApplications] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [repayingLoanId, setRepayingLoanId] = useState(null); // state for repayment loading

  const fetchApplications = async () => {
    if (!loanMatching || !account) return;
    setListLoading(true);

    try {
      const applicationViews = await loanMatching.methods
        .getApplicationsAndBankNamesByFarmer(account)
        .call();

      const combinedApps = applicationViews.map((view) => ({
        ...view.application,
        bankName: view.bankName,
      }));

      setApplications([...combinedApps].reverse());
    } catch (err) {
      console.error("Error fetching loan applications:", err);
      showNotification("Error fetching loan applications", "error");
    } finally {
      setListLoading(false);
    }
  };

  const fetchBanks = async () => {
    if (!userRegistry) return;
    try {
      const bankAddresses = await userRegistry.methods
        .getBankAddresses()
        .call();

      if (bankAddresses.length > 0) {
        const bankUsers = await userRegistry.methods
          .getUsersByAddresses(bankAddresses)
          .call();

        const fetchedBanks = bankUsers.map((user) => ({
          name: user.name,
          address: user.userAddress,
        }));

        setBanks(fetchedBanks);
        if (fetchedBanks.length > 0) {
          setSelectedBankAddress(fetchedBanks[0].address);
        }
      }
    } catch (err) {
      console.error("Error fetching banks:", err);
      showNotification("Could not fetch the list of banks.", "error");
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchBanks();
  }, [loanMatching, userRegistry, account]);

  const aggregateFarmerHistory = async () => {
    if (!userRegistry || !loanMatching || !cropInsurance) return null;

    // Get User Data and Loan History Concurrently
    const [userData, loanResult] = await Promise.all([
      userRegistry.methods.getUser(account).call(),
      loanMatching.methods.getApplicationsAndBankNamesByFarmer(account).call(),
    ]);

    const landSize = Number(userData.landholdingSize);

    const farmerLoans = loanResult;

    const previousLoanCount = farmerLoans.length;
    const repaidOnTime = farmerLoans.filter(
      (app) => Number(app.application.status) === 3
    ).length;
    const previousLoanRepayment =
      previousLoanCount > 0 ? repaidOnTime / previousLoanCount : 0;

    // Get Insurance History
    const farmerPolicies = await cropInsurance.methods
      .getPoliciesByFarmer(account)
      .call();

    // Check for active insurance
    const hasActiveInsurance = farmerPolicies.some(
      (policy) => Number(policy.status) === 1
    );

    return {
      landSize: landSize,
      insuranceStatus: hasActiveInsurance,
      previousLoanRepaymentScore: previousLoanRepayment,
    };
  };

  const handleApplyForLoan = async (e) => {
    e.preventDefault();
    if (!selectedBankAddress || !loanAmount) {
      showNotification(
        "Please select a bank and enter a loan amount.",
        "error"
      );
      return;
    }
    setFormLoading(true);
    showNotification("Gathering your on-chain history...", "info");

    try {
      const historyData = await aggregateFarmerHistory();

      if (!historyData) {
        showNotification(
          "Could not fetch historical data. Please try again.",
          "error"
        );
        setFormLoading(false);
        return;
      }

      const payload = {
        farmerId: account,
        landSize: historyData.landSize,
        cropType: "Rice",
        farmingMethod: "Organic",
        isInsured: historyData.insuranceStatus,
        farmerRating: 4,
        previousLoanRepayment:
          historyData.previousLoanRepaymentScore === 1
            ? "Good"
            : historyData.previousLoanRepaymentScore > 0
            ? "Fair"
            : "None",
      };

      showNotification(
        "Submitting profile to AI for eligibility check...",
        "info"
      );
      console.log("Sending payload to AI:", payload);
      const mockAiResult = { loanEligible: "Eligible" }; // Mock AI call

      if (mockAiResult.loanEligible === "Eligible") {
        await loanMatching.methods
          .applyForLoan(selectedBankAddress, loanAmount, 0)
          .send({ from: account });
        showNotification(
          "AI check passed! Loan application submitted on-chain.",
          "success"
        );
        fetchApplications();
        setLoanAmount("");
        if (banks.length > 0) {
          setSelectedBankAddress(banks[0].address);
        }
      } else {
        showNotification(
          "Sorry, you are not eligible for a loan based on the AI assessment.",
          "error"
        );
      }
    } catch (err) {
      console.error("Loan application process failed:", err);
      showNotification(
        "An error occurred during the application process.",
        "error"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleRepayLoan = async (appId, amount) => {
    if (!loanMatching || !account) return;
    setRepayingLoanId(appId);

    try {
      showNotification("Processing repayment transaction...", "info");
      await loanMatching.methods
        .repayLoan(appId)
        .send({ from: account, value: amount });
      showNotification("Loan successfully repaid!", "success");
      fetchApplications();
    } catch (err) {
      console.error("Error repaying loan:", err);
      showNotification(
        "Loan repayment failed. Check console for details.",
        "error"
      );
    } finally {
      setRepayingLoanId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4">Apply for a New Loan</h3>
        <form onSubmit={handleApplyForLoan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select a Bank
            </label>
            <select
              value={selectedBankAddress}
              onChange={(e) => setSelectedBankAddress(e.target.value)}
              className="border p-2 rounded w-full bg-white"
              disabled={banks.length === 0}
            >
              {banks.length > 0 ? (
                banks.map((bank) => (
                  <option key={bank.address} value={bank.address}>
                    {bank.name}
                  </option>
                ))
              ) : (
                <option>Loading banks...</option>
              )}
            </select>
          </div>

          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="Loan Amount (in Wei)"
            className="border p-2 rounded w-full"
          />
          <button
            type="submit"
            disabled={formLoading}
            className="w-full px-4 py-2 rounded bg-purple-600 text-white disabled:bg-gray-400"
          >
            {formLoading
              ? "Checking Eligibility..."
              : "Check Eligibility & Apply"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-2xl font-semibold mb-4">Your Loan Applications</h3>
        {listLoading ? (
          <p>Loading applications...</p>
        ) : (
          <div className="space-y-4">
            {applications.length > 0 ? (
              applications.map((app) => (
                <div key={app.id} className="border p-4 rounded-md bg-gray-50">
                  <p>
                    <strong>Application ID:</strong> {String(app.id)}
                  </p>
                  <p>
                    <strong>Status:</strong> {loanStatusToString(app.status)}
                  </p>
                  <p>
                    <strong>Amount:</strong> {String(app.amount)} Wei
                  </p>
                  <p className="text-sm">
                    <strong>Bank:</strong> {app.bankName || app.bank}
                  </p>

                  {String(app.status) === "1" && (
                    <button
                      onClick={() => handleRepayLoan(app.id, app.amount)}
                      disabled={repayingLoanId === app.id}
                      className="mt-3 w-full px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {repayingLoanId === app.id
                        ? "Processing Repayment..."
                        : "Repay Loan"}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">You have no loan applications.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerLoans;
