import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import {
  USER_REGISTRY_ADDRESS,
  PRODUCT_LEDGER_ADDRESS,
  CROP_INSURANCE_ADDRESS,
  LOAN_MATCHING_ADDRESS,
} from "./config.js";
import UserRegistry from "../../build/contracts/UserRegistry.json";
import ProductLedger from "../../build/contracts/ProductLedger.json";
import CropInsurance from "../../build/contracts/CropInsurance.json";
import LoanMatching from "../../build/contracts/LoanMatching.json";
import Header from "./components/Header";
import Notification from "./components/Notification";
import Dashboard from "./pages/Dashboard";
import AccountSelectionModal from "./components/AccountSelectionModal";
import NicknameModal from "./components/NickNameModal";
import RegistrationModal from "./components/RegistrationModal";

const CheckIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const DollarIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8C9.791 8 8 9.791 8 12c0 2.209 1.791 4 4 4 2.209 0 4-1.791 4-4 0-2.209-1.791-4-4-4zM12 21a9 9 0 100-18 9 9 0 000 18z"
    />
  </svg>
);

const ShieldIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);


function App() {
  // Web3 State
 const [web3, setWeb3] = useState(null);
 const [account, setAccount] = useState(null);
 const [accounts, setAccounts] = useState([]);
 const [userRole, setUserRole] = useState(null);
 const [isOwner, setIsOwner] = useState(false);

 // Contract State
 const [userRegistry, setUserRegistry] = useState(null);
 const [productLedger, setProductLedger] = useState(null);
 const [cropInsurance, setCropInsurance] = useState(null);
 const [loanMatching, setLoanMatching] = useState(null);
 const [refreshTrigger, setRefreshTrigger] = useState(0);

 // UI State
 const [notification, setNotification] = useState({ message: "", type: "" });
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [nickname, setNickname] = useState("");
 const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);

 const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
 const [selectedRoleForRegistration, setSelectedRoleForRegistration] = useState(null);

 useEffect(() => {
  if (window.ethereum) {
   const w3 = new Web3(window.ethereum);
   setWeb3(w3);
  }
 }, []);

 useEffect(() => {
  if (window.ethereum) {
   const handleAccountsChanged = (newAccounts) => {
    if (newAccounts.length > 0) {
     console.log(newAccounts);
     setAccounts(newAccounts);
     setAccount(newAccounts[0]);
     showNotification("Switched to account: " + newAccounts[0], "success");
    } else {
     setAccounts([]);
     setAccount(null);
     setUserRole(null);
     showNotification("Wallet disconnected.", "info");
    }
   };
   window.ethereum.on("accountsChanged", handleAccountsChanged);
   return () => {
    window.ethereum.removeAllListeners("accountsChanged");
   };
  }
 }, []);

 const showNotification = (message, type = "success") => {
  setNotification({ message, type });
  setTimeout(() => setNotification({ message: "", type: "" }), 4000);
 };

 const connectWallet = useCallback(async () => {
  try {
   if (!window.ethereum) {
    showNotification("MetaMask not found.", "error");
    return;
   }
   console.log(window.ethereum);
   const accountsList = await window.ethereum.request({
    method: "eth_requestAccounts",
   });
   if (accountsList.length === 0) return;

   const w3 = new Web3(window.ethereum);
   setWeb3(w3);
   setAccounts(accountsList);
   console.log("Web3 and accounts set:", w3, accountsList);

   const ur = new w3.eth.Contract(UserRegistry.abi, USER_REGISTRY_ADDRESS);
   console.log("UserRegistry contract instantiated:", USER_REGISTRY_ADDRESS);
   const pl = new w3.eth.Contract(ProductLedger.abi, PRODUCT_LEDGER_ADDRESS);
   const ci = new w3.eth.Contract(CropInsurance.abi, CROP_INSURANCE_ADDRESS);
   const lm = new w3.eth.Contract(LoanMatching.abi, LOAN_MATCHING_ADDRESS);
   setUserRegistry(ur);
   setProductLedger(pl);
   setCropInsurance(ci);
   setLoanMatching(lm);

   if (accountsList.length === 1) {
    handleAccountSelected(accountsList[0]);
   } else {
    setIsModalOpen(true);
   }
  } catch (err) {
   console.error("connectWallet error:", err);
   showNotification("Failed to connect wallet.", "error");
  }
 }, []);

 const handleAccountSelected = (selectedAccount) => {
  setAccount(selectedAccount);
  setIsModalOpen(false);
  console.log("Connected account:", selectedAccount);
  showNotification("Wallet connected: " + selectedAccount, "success");
 };

 useEffect(() => {
  const fetchUserData = async () => {
   if (!userRegistry || !account) {
    if (!account) {
     setUserRole(null);
     setIsOwner(false);
     setNickname("");
    }
    return;
   }

   try {
    const contractOwner = await userRegistry.methods.owner().call();
    const isUserTheOwner =
     account.toLowerCase() === contractOwner.toLowerCase();

    setIsOwner(isUserTheOwner);

    if (isUserTheOwner) {
     console.log("User is the contract owner. Assigning Admin role.");
     setUserRole(6); 
    } else {
     console.log("User is not the owner. Fetching specific role.");
     const userData = await userRegistry.methods.getUser(account).call();
     setUserRole(Number(userData.role));
    }

    const savedNickname = localStorage.getItem(`nickname_${account}`);
    setNickname(savedNickname || "");
   } catch (err) {
    console.warn("Could not read user data from registry:", err);
    setUserRole(0);
    setIsOwner(false);
   }
  };

  fetchUserData();
 }, [userRegistry, account, refreshTrigger]); 

 const handleSetNickname = (newNickname) => {
  if (!account) {
   showNotification("Please connect your wallet first.", "error");
   return;
  }
  if (!newNickname || newNickname.trim() === "") {
   showNotification("Nickname cannot be empty.", "error");
   return;
  }
  const trimmedNickname = newNickname.trim();
  localStorage.setItem(`nickname_${account}`, trimmedNickname);
  setNickname(trimmedNickname);
  showNotification("Nickname updated successfully!", "success");
  setIsNicknameModalOpen(false);
 };

 const handleAccountChange = (selectedAccount) => {
  setAccount(selectedAccount);
  showNotification("Switched to account: " + selectedAccount, "success");
 };

 const triggerRefresh = () => {
  console.log("Triggering data refresh...");
  setRefreshTrigger((prev) => prev + 1);
 };

 const handleOpenRegistrationModal = (role) => {
  setSelectedRoleForRegistration(role);
  setIsRegistrationModalOpen(true);
 };

 const handleRegistrationSubmit = async (formData) => {
  const { nickname: registrationName, landSize, toolsOwned } = formData;
  const role = selectedRoleForRegistration;

  try {
   if (!userRegistry || !account) {
    showNotification("Please connect wallet first.", "error");
    return;
   }

   handleSetNickname(registrationName);
   console.log(
    `Registration attempt for ${role} with name ${registrationName}.`
   );

   if (role === "Farmer") {
    console.log(`Farmer details - Land: ${landSize}, Tools: ${toolsOwned}`);
    // Note: The `toolsOwned` is captured but not sent to the contract,
    // as the original contract function doesn't accept it.
 	  await userRegistry.methods
     .registerAsFarmer(registrationName, landSize)
     .send({ from: account });
   } else if (role === "Vendor") {
    await userRegistry.methods
     .registerAsVendor(registrationName)
     .send({ from: account });
   } else if (role === "Consumer") {
    await userRegistry.methods
     .registerAsConsumer(registrationName)
     .send({ from: account });
   }

   showNotification(`Registered successfully as ${role}!`, "success");
   triggerRefresh(); 
   setIsRegistrationModalOpen(false);
  } catch (err) {
   console.error("Registration failed:", err);
   showNotification(
    "Registration failed. Check console for details.",
    "error"
   );
  }
 };

 const roleToString = (r) => {
  switch (Number(r)) {
   case 0:
    return "Unassigned";
   case 1:
    return "Farmer";
   case 2:
    return "Vendor";
   case 3:
    return "Consumer";
   case 4:
    return "Bank";
   case 5:
    return "Insurance";
   case 6:
      // If owner is role 6, this should probably be "Admin" or "Owner"
    return "Verifier"; // Or "Admin"
   default:
    return "Unknown";
  }
 };


  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <Header
        account={account}
        accounts={accounts}
        userRole={userRole}
        connectWallet={connectWallet}
        roleToString={roleToString}
        handleAccountChange={handleAccountChange}
        nickname={nickname}
        onSetNickname={() => setIsNicknameModalOpen(true)}
      />
      {notification.message && (
        <Notification message={notification.message} type={notification.type} />
      )}
      {isModalOpen && (
        <AccountSelectionModal
          accounts={accounts}
          onSelect={handleAccountSelected}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {isNicknameModalOpen && (
        <NicknameModal
          onSave={handleSetNickname}
          onClose={() => setIsNicknameModalOpen(false)}
          currentNickname={nickname}
        />
      )}
      {isRegistrationModalOpen && (
        <RegistrationModal
          role={selectedRoleForRegistration}
          onClose={() => setIsRegistrationModalOpen(false)}
          onSubmit={handleRegistrationSubmit}
          currentNickname={nickname}
        />
      )}

      {!account ? (
        <div className="relative bg-white overflow-hidden mt-25 max-w-7xl mx-auto rounded-lg shadow-2xl p-4">
          <div className="lg:flex justify-center">
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
              <div>
                <span className="inline-block bg-green-200 text-green-800 text-xs px-3 py-1 font-semibold rounded-full uppercase tracking-wider">
                  Powered by Blockchain & AI
                </span>
                <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                  The Future of{" "}
                  <span className="text-green-600">
                    Agricultural Transparency
                  </span>
                </h1>
                <p className="mt-6 text-xl text-gray-600">
                  Our platform connects farmers, vendors, and consumers with an
                  immutable, transparent, and intelligent supply chain.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Farm-to-Table Traceability:</strong> Know the
                      origin of every product.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <DollarIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Smart Financial Tools:</strong> Access AI-matched
                      loans and crop insurance.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <ShieldIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Verified & Secure:</strong> All data is secured on
                      the blockchain.
                    </p>
                  </div>
                </div>
                <div className="mt-10">
                  <button
                    onClick={connectWallet}
                    className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300"
                  >
                    Connect Wallet to Begin
                  </button>
                </div>
              </div>
            </div>
            {/* <div className="lg:w-1/2 relative hidden lg:block">
              <img
                className="absolute inset-0 h-full w-full object-cover rounded-r-lg"
                src="https://images.unsplash.com/photo-1560493676-0407186f467b?auto=format&fit=crop&w=1074&q=80"
                alt="Modern agriculture"
              />
            </div> */}
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto mt-8 p-4">
          {userRole === 0 ? (
            <div className="p-8 bg-white rounded-xl shadow-lg text-center max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800">
                Choose Your Role
              </h2>
              <p className="mt-3 text-lg text-gray-600">
                Select how you'd like to participate in the ecosystem.
              </p>
              <div className="mt-8 grid md:grid-cols-3 gap-6">
                
                <div className="p-8 border border-gray-200 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300">
                  <div className="text-5xl mb-4">👨‍🌾</div>
                  <h3 className="text-2xl font-semibold text-green-700">
                    Farmer
                  </h3>
                  <p className="mt-2 text-gray-600 min-h-[60px]">
                    Register your farm, manage your produce, and access financial
                    tools.
                  </p>
                  <button
                    onClick={() => handleOpenRegistrationModal("Farmer")}
                    className="mt-6 px-6 py-2 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition"
                  >
                    Register as Farmer
                  </button>
                </div>

                <div className="p-8 border border-gray-200 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300">
                  <div className="text-5xl mb-4">🏪</div>
                  <h3 className="text-2xl font-semibold text-blue-700">
                    Vendor
                  </h3>
                  <p className="mt-2 text-gray-600 min-h-[60px]">
                    Purchase produce from farmers and manage your inventory.
                  </p>
                  <button
                    onClick={() => handleOpenRegistrationModal("Vendor")}
                    className="mt-6 px-6 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                  >
                    Register as Vendor
                  </button>
                </div>

                <div className="p-8 border border-gray-200 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300">
                  <div className="text-5xl mb-4">🛒</div>
                  <h3 className="text-2xl font-semibold text-purple-700">
                    Consumer
                  </h3>
                  <p className="mt-2 text-gray-600 min-h-[60px]">
                    Trace your food back to the farm and verify its journey.
                  </p>
                  <button
                    onClick={() => handleOpenRegistrationModal("Consumer")}
                    className="mt-6 px-6 py-2 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
                  >
                    Register as Consumer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Dashboard
              isOwner={isOwner}
              web3={web3}
              userRole={userRole}
              account={account}
              userRegistry={userRegistry}
              productLedger={productLedger}
              cropInsurance={cropInsurance}
              loanMatching={loanMatching}
              showNotification={showNotification}
              roleToString={roleToString}
              refreshTrigger={refreshTrigger}
              triggerRefresh={triggerRefresh}
              allAccounts={accounts}
            />
          )}
        </main>
      )}
    </div>
  );
}

export default App;