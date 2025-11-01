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
  }, [userRegistry, account, refreshTrigger]); // Added refreshTrigger dependency

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
      triggerRefresh(); // Refresh user data to get the new role
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
        return "Verifier";
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

      <main className="max-w-4xl mx-auto mt-8 p-4">
        {!account ? (
          <div className="p-6 bg-white rounded shadow text-center">
            <h2 className="text-2xl font-semibold">
              Welcome to the Future of Agriculture
            </h2>
            <p className="mt-2 text-gray-600">
              Please connect your MetaMask wallet to begin.
            </p>
          </div>
        ) : userRole === 0 ? (
          <div className="p-6 bg-white rounded shadow text-center">
            <h2 className="text-2xl font-semibold">Register to Continue</h2>
            <p className="mt-2 text-gray-600">
              Choose your role to get started.
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={() => handleOpenRegistrationModal("Farmer")}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
              >
                Register as Farmer
              </button>
              <button
                onClick={() => handleOpenRegistrationModal("Vendor")}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Register as Vendor
              </button>
              <button
                onClick={() => handleOpenRegistrationModal("Consumer")}
                className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition"
              >
                Register as Consumer
              </button>
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
    </div>
  );
}

export default App;
