import FarmerDashboard from "./FarmerDashboard";
import VendorDashboard from "./VendorDashboard";
import VerifierDashboard from "./VerifierDashboard";
import ConsumerDashboard from "./ConsumerDashboard";
import BankDashboard from "./BankDashboard";
import InsuranceDashboard from "./InsuranceDashboard";
import AdminPanel from "../components/AdminPanel";

const Dashboard = ({
  isOwner,
  web3,
  userRole,
  account,
  userRegistry,
  productLedger,
  cropInsurance,
  loanMatching,
  showNotification,
  refreshTrigger,
  triggerRefresh,
}) => {
  const renderDashboard = () => {
    switch (userRole) {
      case 1: // Farmer
        return (
          <FarmerDashboard
            account={account}
            userRegistry={userRegistry}
            productLedger={productLedger}
            cropInsurance={cropInsurance}
            loanMatching={loanMatching}
            showNotification={showNotification}
            refreshTrigger={refreshTrigger}
          />
        );
      case 2: // Vendor
        return (
          <VendorDashboard
            productLedger={productLedger}
            account={account}
            showNotification={showNotification}
          />
        );
      case 3: // Consumer
        return <ConsumerDashboard productLedger={productLedger} />;
      case 4: // Bank
        return (
          <BankDashboard
            loanMatching={loanMatching}
            account={account}
            showNotification={showNotification}
          />
        );
      case 5: // Insurance
        return (
          <InsuranceDashboard
            cropInsurance={cropInsurance}
            account={account}
            showNotification={showNotification}
          />
        );
      case 6: // Verifier
        return (
          <VerifierDashboard
            productLedger={productLedger}
            account={account}
            showNotification={showNotification}
          />
        );
      default:
        return <p>No dashboard available for this role.</p>;
    }
  };

  return (
    <div className="space-y-8">
      <div>{renderDashboard()}</div>

      {isOwner && (
        <AdminPanel
          web3={web3}
          userRegistry={userRegistry}
          account={account}
          showNotification={showNotification}
          triggerRefresh={triggerRefresh}
        />
      )}
    </div>
  );
};

export default Dashboard;
