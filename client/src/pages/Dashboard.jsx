// import React from 'react';
// import FarmerDashboard from './FarmerDashboard';
// import VerifierDashboard from './VerifierDashboard';
// import ConsumerDashboard from './ConsumerDashboard';

// const Dashboard = ({ userRole, account, productLedger, showNotification, roleToString }) => {
//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Dashboard - {roleToString(userRole)}</h2>
//       {userRole === 1 && (
//         <FarmerDashboard productLedger={productLedger} account={account} showNotification={showNotification} />
//       )}
//       {userRole === 6 && (
//         <VerifierDashboard productLedger={productLedger} account={account} showNotification={showNotification} />
//       )}
//       {userRole === 3 && (
//         <ConsumerDashboard productLedger={productLedger} showNotification={showNotification} />
//       )}
//     </div>
//   );
// };

// export default Dashboard;

// src/components/Dashboard.jsx

// import FarmerDashboard from './FarmerDashboard';
// import VendorDashboard from './VendorDashboard';
// import VerifierDashboard from './VerifierDashboard';
// import ConsumerDashboard from './ConsumerDashboard';

// // Placeholder for roles without a full dashboard yet
// const PlaceholderDashboard = ({ roleName }) => (
//   <div className="bg-white p-6 rounded-lg shadow-md text-center">
//     <h3 className="text-xl font-semibold">Welcome, {roleName}</h3>
//     <p className="mt-2 text-gray-600">Your dashboard is under construction.</p>
//   </div>
// );

// const Dashboard = ({ userRole, account, productLedger, showNotification, roleToString }) => {
//   const renderDashboard = () => {
//     switch (userRole) {
//       case 1: // Farmer
//         return <FarmerDashboard productLedger={productLedger} account={account} showNotification={showNotification} />;
//       case 2: // Vendor
//         return <VendorDashboard productLedger={productLedger} account={account} showNotification={showNotification} />;
//       case 3: // Consumer
//         return <ConsumerDashboard productLedger={productLedger} />;
//       case 4: // Bank
//         return <PlaceholderDashboard roleName="Bank" />;
//       case 5: // Insurance
//         return <PlaceholderDashboard roleName="Insurance Agent" />;
//       case 6: // Verifier
//         return <VerifierDashboard productLedger={productLedger} account={account} showNotification={showNotification} />;
//       default:
//         return <p>No dashboard available for this role.</p>;
//     }
//   };

//   return (
//     <div>
//       {/* <h2 className="text-3xl font-bold mb-6">My Dashboard</h2> */}
//       {renderDashboard()}
//     </div>
//   );
// };

// export default Dashboard;



// ❗ CHANGED: Import and render new dashboards
import FarmerDashboard from './FarmerDashboard';
import VendorDashboard from './VendorDashboard';
import VerifierDashboard from './VerifierDashboard';
import ConsumerDashboard from './ConsumerDashboard';
import BankDashboard from './BankDashboard'; // 🆕 ADDED
import InsuranceDashboard from './InsuranceDashboard'; // 🆕 ADDED
import AdminPanel from '../components/AdminPanel'; // 🆕 ADDED

const Dashboard = ({ isOwner, web3, userRole, account, userRegistry, productLedger, cropInsurance, loanMatching, showNotification, refreshTrigger, triggerRefresh }) => {
    const renderDashboard = () => {
        switch (userRole) {
            case 1: // Farmer
                return <FarmerDashboard
                    account={account}
                    userRegistry={userRegistry}
                    productLedger={productLedger}
                    cropInsurance={cropInsurance}
                    loanMatching={loanMatching}
                    showNotification={showNotification}
                    refreshTrigger={refreshTrigger}
                />;
            case 2: // Vendor
                return <VendorDashboard productLedger={productLedger} account={account} showNotification={showNotification} />;
            case 3: // Consumer
                return <ConsumerDashboard productLedger={productLedger} />;
            case 4: // Bank
                return <BankDashboard loanMatching={loanMatching} account={account} showNotification={showNotification} />;
            case 5: // Insurance
                return <InsuranceDashboard cropInsurance={cropInsurance} account={account} showNotification={showNotification} />;
            case 6: // Verifier
                return <VerifierDashboard productLedger={productLedger} account={account} showNotification={showNotification} />;
            default:
                return <p>No dashboard available for this role.</p>;
        }
    };

    // return <div>{renderDashboard()}</div>;
    return (
        <div className="space-y-8">
            {/* This will render the user's primary dashboard (e.g., FarmerDashboard) */}
            <div>{renderDashboard()}</div>

            {/* 👇 2. RENDER ADMINPANEL IF THE USER IS THE OWNER 👇 */}
            {/* This appears IN ADDITION to their regular dashboard */}
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