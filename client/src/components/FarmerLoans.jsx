import { useState, useEffect } from "react";

const LoanApplicationForm = ({
  scheme,
  banks,
  onApply,
  disabled,
  ethToInrRate,
}) => {
  const [selectedBankAddress, setSelectedBankAddress] = useState("");
  const [loanAmountINR, setLoanAmountINR] = useState("");

  useEffect(() => {
    if (scheme.estimatedAmount > 0) {
      setLoanAmountINR(scheme.estimatedAmount);
    }
    if (banks.length > 0) {
      setSelectedBankAddress(banks[0].address);
    }
  }, [scheme, banks]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ethToInrRate) {
      alert(
        "ETH to INR conversion rate is not loaded. Cannot submit application."
      );
      return;
    }

    const weiPerEth = 10n ** 18n;
    const amountInWei =
      (BigInt(loanAmountINR) * weiPerEth) / BigInt(Math.round(ethToInrRate));

    onApply(selectedBankAddress, amountInWei.toString(), scheme.schemeId);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Bank
        </label>
        <select
          value={selectedBankAddress}
          onChange={(e) => setSelectedBankAddress(e.target.value)}
          className="border p-2 rounded w-full bg-white font-mono text-sm"
          disabled={banks.length === 0 || disabled}
        >
          {banks.length > 0 ? (
            banks.map((bank) => (
              <option key={bank.address} value={bank.address}>
                {bank.name}
              </option>
            ))
          ) : (
            <option>No banks available</option>
          )}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Loan Amount (INR)
        </label>
        <input
          type="number"
          value={loanAmountINR}
          onChange={(e) => setLoanAmountINR(e.target.value)}
          placeholder="Loan Amount (in INR)"
          className="border p-2 rounded w-full"
          disabled={disabled}
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !selectedBankAddress || !loanAmountINR}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
      >
        {disabled ? "Processing..." : `Apply for ${scheme.schemeName}`}
      </button>
    </form>
  );
};

const FarmerLoans = ({
  loanMatching,
  cropInsurance,
  productLedger,
  userRegistry,
  account,
  showNotification,
}) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [profile, setProfile] = useState(null);
  const [banks, setBanks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(false);
  const [repayingLoanId, setRepayingLoanId] = useState(null);
  const [ethToInrRate, setEthToInrRate] = useState(null);

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
      }
    } catch (err) {
      console.error("Error fetching banks:", err);
    }
  };

  const fetchEthRate = async () => {
    try {
      const url =
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr";
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("CoinGecko API failed");
      const data = await resp.json();
      const rate = parseFloat(data["ethereum"]["inr"]);
      if (rate > 0) {
        setEthToInrRate(rate);
      } else {
        throw new Error("Invalid rate");
      }
    } catch (e) {
      console.warn(`CoinGecko API failed: ${e}. Using fallback rate.`);
      setEthToInrRate(280000.0);
    }
  };

  const aggregateFarmerHistory = async () => {
    if (!userRegistry || !loanMatching || !cropInsurance || !productLedger)
      return null;

    setLoading(true);
    showNotification("Gathering on-chain profile...", "info");
    try {
      const [userData, farmerPolicies, productIds] = await Promise.all([
        userRegistry.methods.getUser(account).call(),
        cropInsurance.methods.getPoliciesByFarmer(account).call(),
        productLedger.methods.getProductIdsByFarmer(account).call(),
      ]);

      const landSizeAcres = Number(userData.landholdingSize);
      const landSizeHectares = landSizeAcres * 0.404686;

      const hasActiveInsurance = farmerPolicies.some(
        (policy) => Number(policy.status) === 1
      );

      let cropType = "Rice";
      let farmingMethod = "Inorganic";
      let district = "Thanjavur";

      if (productIds && productIds.length > 0) {
        const latestProductId = productIds[productIds.length - 1];
        const productDetails = await productLedger.methods
          .getProductDetails(latestProductId)
          .call();
        const core = productDetails[0];
        const meta = productDetails[1];
        cropType = meta.name || "Rice";
        farmingMethod = Number(core.practice) === 1 ? "Organic" : "Inorganic";
        district = meta.location || "Thanjavur";
      }

      const payload = {
        landSize: landSizeHectares,
        cropType: cropType,
        farmingMethod: farmingMethod,
        isInsured: hasActiveInsurance,
        district: district,
      };

      setProfile(payload);
      return payload;
    } catch (err) {
      console.error("Failed to aggregate history:", err);
      showNotification("Could not fetch your on-chain data.", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleFetchLoans = async () => {
    const farmerPayload = await aggregateFarmerHistory();
    if (!farmerPayload) return;

    setLoading(true);
    showNotification("Submitting profile to AI for matching...", "info");
    try {
      const response = await fetch("http://localhost:5000/loan/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(farmerPayload),
      });

      if (!response.ok) {
        const errText = await response.json();
        throw new Error(errText.error || "AI server failed");
      }

      const result = await response.json();
      if (result.success) {
        setReport(result.data);
        showNotification("Loan report generated successfully!", "success");
      } else {
        throw new Error(result.error || "Failed to get report");
      }
    } catch (error) {
      console.error("Error fetching loan recommendations:", error);
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForLoan = async (bankAddress, amountWei, schemeId) => {
    if (!bankAddress || !amountWei) {
      showNotification("Bank and amount (in Wei) are required.", "error");
      return;
    }
    setAppLoading(true);
    try {
      showNotification(
        `Submitting application for ${schemeId} to the blockchain...`,
        "info"
      );

      await loanMatching.methods
        .applyForLoan(bankAddress, amountWei, 0)
        .send({ from: account });

      showNotification("Loan application submitted successfully!", "success");
      fetchApplications();
      setReport(null);
      setProfile(null);
    } catch (err) {
      console.error("Loan application failed:", err);
      showNotification(
        "On-chain application failed. Transaction rejected.",
        "error"
      );
    } finally {
      setAppLoading(false);
    }
  };

  const handleRepayLoan = async (appId, amountWei) => {
    if (!loanMatching || !account) return;
    setRepayingLoanId(appId);
    try {
      showNotification("Processing repayment transaction...", "info");
      await loanMatching.methods
        .repayLoan(appId)
        .send({ from: account, value: amountWei }); // amount is already in Wei
      showNotification("Loan successfully repaid!", "success");
      fetchApplications();
    } catch (err) {
      console.error("Error repaying loan:", err);
      showNotification(
        "Loan repayment failed. Ensure you are sending the correct amount.",
        "error"
      );
    } finally {
      setRepayingLoanId(null);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchBanks();
    fetchEthRate();
  }, [loanMatching, userRegistry, account]);

  const getRiskColor = (risk) => {
    if (risk === "low") return "text-green-600 bg-green-100";
    if (risk === "medium") return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getTypeIcon = (type) => {
    if (type === "direct_benefit")
      return <span title="Direct Benefit">📈</span>;
    if (type === "insurance_linked")
      return <span title="Insurance Linked">🛡️</span>;
    if (type === "development_loan")
      return <span title="Development Loan">🌿</span>;
    return <span title="Info">(i)</span>;
  };

  const loanStatusToString = (status) => {
    const statuses = ["Pending", "Approved", "Disbursed", "Repaid", "Rejected"];
    return statuses[Number(status)] || "Unknown";
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          📋 Your Farmer Profile (From Blockchain)
        </h2>
        {profile ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Land Size</p>
              <p className="text-xl font-bold text-blue-700">
                {profile.landSize.toFixed(2)} hectares
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Crop Type</p>
              <p className="text-xl font-bold text-green-700">
                {profile.cropType}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-gray-600">Farming Method</p>
              <p className="text-xl font-bold text-purple-700">
                {profile.farmingMethod}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <p className="text-sm text-gray-600">Insurance Status</p>
              <p className="text-xl font-bold text-orange-700">
                {profile.isInsured ? "✓ Insured" : "✗ Not Insured"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">
            Click the button below to load your on-chain profile.
          </p>
        )}

        <button
          onClick={handleFetchLoans}
          disabled={loading || !ethToInrRate}
          className="mt-6 w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50"
        >
          {loading
            ? "Analyzing Eligibility..."
            : !ethToInrRate
            ? "Loading Conversion Rate..."
            : "🔍 Find Eligible Loan Schemes"}
        </button>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Eligible Schemes</p>
                  <p className="text-4xl font-bold mt-1">
                    {report.totalEligibleSchemes}
                  </p>
                </div>
                <span className="text-4xl opacity-50">✅</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Max Credit Limit</p>
                  <p className="text-3xl font-bold mt-1">
                    ₹{report.maxCreditLimit.toLocaleString()}
                  </p>
                </div>
                <span className="text-4xl opacity-50">📈</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Risk Assessment</p>
                  <p
                    className={`text-2xl font-bold mt-1 px-3 py-1 rounded inline-block ${getRiskColor(
                      report.overallRisk
                    )}`}
                  >
                    {report.overallRisk.toUpperCase()}
                  </p>
                </div>
                <span className="text-4xl opacity-50">🛡️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              🎯 Recommended Loan Schemes
            </h2>
            {report.eligibleSchemes.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl text-gray-400 mb-4">⚠️</span>
                <p className="text-gray-600 text-lg">
                  No eligible schemes found based on your current profile.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {report.eligibleSchemes.map((scheme, index) => (
                  <div
                    key={scheme.schemeId}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-full text-xl">
                          {getTypeIcon(scheme.type)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {index + 1}. {scheme.schemeName}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {scheme.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {scheme.matchScore}% Match
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 mb-1">
                          Estimated Amount (INR)
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                          ₹{scheme.estimatedAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 mb-1">
                          Key Benefit
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {scheme.benefits.effectiveRate
                            ? `${scheme.benefits.effectiveRate}% effective rate`
                            : scheme.benefits.additionalBenefits ||
                              scheme.benefits.frequency ||
                              "N/A"}
                        </p>
                      </div>
                    </div>

                    {scheme.recommendations.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded mb-4">
                        <p className="text-sm font-semibold text-blue-800 mb-2">
                          💡 Recommendations:
                        </p>
                        <ul className="space-y-1">
                          {scheme.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-blue-700">
                              • {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <LoanApplicationForm
                      scheme={scheme}
                      banks={banks}
                      onApply={handleApplyForLoan}
                      disabled={appLoading}
                      ethToInrRate={ethToInrRate}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {!profile.isInsured && (
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-yellow-600 flex-shrink-0 mt-1">
                  ⚠️
                </span>
                <div>
                  <h3 className="font-bold text-yellow-800 mb-2">
                    💡 Recommendation: Get Crop Insurance
                  </h3>
                  <p className="text-yellow-700 mb-2">
                    You can unlock additional loan schemes and reduce interest
                    rates by up to 3% with crop insurance coverage.
                  </p>
                  <button
                    onClick={() =>
                      showNotification(
                        "Go to 'My Insurance' tab to get started.",
                        "info"
                      )
                    }
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
                  >
                    Explore Insurance Options
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
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
                        : "Repay Loan (in Wei)"}
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
