import { useState } from "react";
import FarmerProducts from "../components/FarmerProducts";
import FarmerInsurance from "../components/FarmerInsurance";
import FarmerLoans from "../components/FarmerLoans";

const FarmerDashboard = ({
  account,
  userRegistry,
  productLedger,
  cropInsurance,
  loanMatching,
  showNotification,
  refreshTrigger,
}) => {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div>
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
              activeTab === "products"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Products
          </button>
          <button
            onClick={() => setActiveTab("insurance")}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
              activeTab === "insurance"
                ? "bg-green-100 text-green-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Insurance
          </button>
          <button
            onClick={() => setActiveTab("loans")}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
              activeTab === "loans"
                ? "bg-purple-100 text-purple-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Loans
          </button>
        </nav>
      </div>

      <div>
        {activeTab === "products" && (
          <FarmerProducts
            productLedger={productLedger}
            cropInsurance={cropInsurance}
            account={account}
            userRegistry={userRegistry}
            showNotification={showNotification}
            refreshTrigger={refreshTrigger}
          />
        )}
        {activeTab === "insurance" && (
          <FarmerInsurance
            cropInsurance={cropInsurance}
            account={account}
            showNotification={showNotification}
          />
        )}
        {activeTab === "loans" && (
          <FarmerLoans
            cropInsurance={cropInsurance}
            productLedger={productLedger}
            userRegistry={userRegistry}
            loanMatching={loanMatching}
            account={account}
            showNotification={showNotification}
          />
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
