// import React, { useState, useEffect, useCallback } from "react";
// import Web3 from "web3";
// import {
//   // USER_REGISTRY_ABI,
//   USER_REGISTRY_ADDRESS,
//   // PRODUCT_LEDGER_ABI,
//   PRODUCT_LEDGER_ADDRESS,
// } from "./config.js";
// import UserRegistry from './abis/UserRegistry.json'
// import ProductLedger from './abis/ProductLedger.json'
// import Header from "./components/Header";
// import Notification from "./components/Notification";
// import Dashboard from "./pages/Dashboard";

// function App() {
//   const [web3, setWeb3] = useState(null);
//   const [account, setAccount] = useState(null);
//   const [userRole, setUserRole] = useState(null);
//   const [userRegistry, setUserRegistry] = useState(null);
//   const [productLedger, setProductLedger] = useState(null);
//   const [notification, setNotification] = useState({ message: "", type: "" });

//   useEffect(() => {
//     if (window.ethereum) {
//       const w3 = new Web3(window.ethereum);
//       setWeb3(w3);
//     }
//   }, []);

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification({ message: "", type: "" }), 4000);
//   };

//   // App.jsx

//   const connectWallet = useCallback(async () => {
//     try {
//       if (!window.ethereum) {
//         showNotification("MetaMask not found. Install MetaMask and try again.", "error");
//         return;
//       }

//       await window.ethereum.request({ method: "eth_requestAccounts" });
//       const w3 = new Web3(window.ethereum);
//       setWeb3(w3);

//       const accounts = await w3.eth.getAccounts();
//       const acc = accounts[0];
//       setAccount(acc);
//       console.log("Connected account:", acc);
//       showNotification("Wallet connected: " + acc, "success");

//       // Correctly instantiate contracts
//       // --- FIX 1: Check for the object and its .abi property ---
//       if (UserRegistry && UserRegistry.abi && USER_REGISTRY_ADDRESS) {
//         const ur = new w3.eth.Contract(UserRegistry.abi, USER_REGISTRY_ADDRESS);
//         setUserRegistry(ur);
//         console.log("UserRegistry loaded at:", USER_REGISTRY_ADDRESS);
//       } else {
//         console.error("UserRegistry ABI/Address missing!");
//       }

//       // --- FIX 2: Same check for ProductLedger ---
//       if (ProductLedger && ProductLedger.abi && PRODUCT_LEDGER_ADDRESS) {
//         const pl = new w3.eth.Contract(ProductLedger.abi, PRODUCT_LEDGER_ADDRESS);
//         setProductLedger(pl);
//         console.log("ProductLedger loaded at:", PRODUCT_LEDGER_ADDRESS);
//       } else {
//         console.error("ProductLedger ABI/Address missing!");
//       }
      
//       // The rest of the function depends on the userRegistry state, which is set above.
//       // By adding userRegistry to the dependency array, this function will re-run
//       // with the correct state after the contracts are initialized.
//     } catch (err) {
//       console.error("connectWallet error:", err);
//       showNotification("Failed to connect wallet.", "error");
//     }
//   }, []); // Initial call for connection

//   // Use a separate useEffect to fetch the role after userRegistry is set
//   useEffect(() => {
//     const fetchRole = async () => {
//       if (userRegistry && account) {
//           try {
//           if (userRegistry) {
//             const role = await userRegistry.methods.getRole(account).call();
//             console.log("Fetched role:", role);
//             setUserRole(Number(role));
//           } else {
//             console.warn("UserRegistry not initialized yet");
//             setUserRole(0);
//           }
//         } catch (err) {
//           console.warn("Could not read role from registry:", err);
//           setUserRole(0);
//         }
//       }
//     };
//     fetchRole();
//   }, [userRegistry, account]); // --- FIX 3: Run this effect when userRegistry or account changes ---

//   // const connectWallet = useCallback(async () => {
//   //   try {
//   //     if (!window.ethereum) {
//   //       showNotification("MetaMask not found. Install MetaMask and try again.", "error");
//   //       return;
//   //     }

//   //     await window.ethereum.request({ method: "eth_requestAccounts" });
//   //     const w3 = new Web3(window.ethereum);
//   //     setWeb3(w3);

//   //     const accounts = await w3.eth.getAccounts();
//   //     const acc = accounts[0];
//   //     setAccount(acc);
//   //     console.log("Connected account:", acc);
//   //     showNotification("Wallet connected: " + acc, "success");

//   //     // instantiate contracts
//   //     if (UserRegistry.length && USER_REGISTRY_ADDRESS) {
//   //       const ur = new w3.eth.Contract(UserRegistry.abi, USER_REGISTRY_ADDRESS);
//   //       setUserRegistry(ur);
//   //       console.log("UserRegistry loaded at:", USER_REGISTRY_ADDRESS);
//   //     } else {
//   //       console.error("UserRegistry ABI/Address missing!");
//   //     }

//   //     if (UserRegistry.length && PRODUCT_LEDGER_ADDRESS) {
//   //       const pl = new w3.eth.Contract(UserRegistry.abi, PRODUCT_LEDGER_ADDRESS);
//   //       setProductLedger(pl);
//   //       console.log("ProductLedger loaded at:", PRODUCT_LEDGER_ADDRESS);
//   //     }

//   //     // fetch user role
//   //     try {
//   //       if (userRegistry) {
//   //         const role = await userRegistry.methods.getRole(acc).call();
//   //         console.log("Fetched role:", role);
//   //         setUserRole(Number(role));
//   //       } else {
//   //         console.warn("UserRegistry not initialized yet");
//   //         setUserRole(0);
//   //       }
//   //     } catch (err) {
//   //       console.warn("Could not read role from registry:", err);
//   //       setUserRole(0);
//   //     }
//   //   } catch (err) {
//   //     console.error("connectWallet error:", err);
//   //     showNotification("Failed to connect wallet.", "error");
//   //   }
//   // }, []);


//   // register function
//   const register = async (role) => {
//     try {
//       if (!userRegistry || !account) return;

//       if (role === "Farmer") {
//         await userRegistry.methods
//           .registerAsFarmer("My Name")
//           .send({ from: account });
//       } else if (role === "Vendor") {
//         await userRegistry.methods
//           .registerAsVendor("My Name")
//           .send({ from: account });
//       } else if (role === "Consumer") {
//         await userRegistry.methods
//           .registerAsConsumer("My Name")
//           .send({ from: account });
//       }

//       showNotification(`Registered successfully as ${role}!`, "success");

//       // re-fetch role
//       const r = await userRegistry.methods.getRole(account).call();
//       setUserRole(Number(r));
//     } catch (err) {
//       console.error("Registration failed:", err);
//       showNotification("Registration failed.", "error");
//     }
//   };

//   const roleToString = (r) => {
//     switch (Number(r)) {
//       case 0:
//         return "Unassigned";
//       case 1:
//         return "Farmer";
//       case 2:
//         return "Vendor";
//       case 3:
//         return "Consumer";
//       case 4:
//         return "Bank";
//       case 5:
//         return "Insurance";
//       case 6:
//         return "Verifier";
//       default:
//         return "Unknown";
//     }
//   };

//   return (
//     <div className="bg-gray-100 max-h-screen min-h-screen w-full">
//       <Header account={account} userRole={userRole} connectWallet={connectWallet} roleToString={roleToString} />
//       {notification.message && (
//         <Notification message={notification.message} type={notification.type} />
//       )}
//       <main className="max-w-4xl mx-auto mt-8">
//         {!account ? (
//           <div className="p-6 bg-white rounded shadow text-center">
//             <h2 className="text-2xl font-semibold">Welcome to the Future of Agriculture</h2>
//             <p className="mt-2 text-gray-600">
//               Please connect your MetaMask wallet to begin.
//             </p>
//             {/* <button
//               onClick={connectWallet}
//               className="mt-4 px-4 py-2 rounded bg-blue-600 text-white"
//             >
//               Connect Wallet
//             </button> */}
//           </div>
//         ) : userRole === 0 ? (
//           <div className="p-6 bg-white rounded shadow text-center">
//             <h2 className="text-2xl font-semibold">Register to Continue</h2>
//             <p className="mt-2 text-gray-600">Choose your role to get started.</p>
//             <div className="mt-4 flex justify-center space-x-4">
//               <button
//                 onClick={() => register("Farmer")}
//                 className="px-4 py-2 rounded bg-green-600 text-white"
//               >
//                 Register as Farmer
//               </button>
//               <button
//                 onClick={() => register("Vendor")}
//                 className="px-4 py-2 rounded bg-blue-600 text-white"
//               >
//                 Register as Vendor
//               </button>
//               <button
//                 onClick={() => register("Consumer")}
//                 className="px-4 py-2 rounded bg-purple-600 text-white"
//               >
//                 Register as Consumer
//               </button>
//             </div>
//           </div>
//         ) : (
//           <Dashboard
//             userRole={userRole}
//             account={account}
//             productLedger={productLedger}
//             showNotification={showNotification}
//             roleToString={roleToString}
//           />
//         )}
//       </main>
//     </div>
//   );
// }

// export default App;



// import React, { useState, useEffect, useCallback } from "react";
// import Web3 from "web3";
// import {
//   USER_REGISTRY_ADDRESS,
//   PRODUCT_LEDGER_ADDRESS,
// } from "./config.js";
// import UserRegistry from './abis/UserRegistry.json';
// import ProductLedger from './abis/ProductLedger.json';
// import Header from "./components/Header";
// import Notification from "./components/Notification";
// import Dashboard from "./pages/Dashboard";
// import AccountSelectionModal from "./components/AccountSelectionModal";

// function App() {
//   const [web3, setWeb3] = useState(null);
//   const [account, setAccount] = useState(null);
//   const [accounts, setAccounts] = useState([]); // New state for all accounts
//   const [userRole, setUserRole] = useState(null);
//   const [userRegistry, setUserRegistry] = useState(null);
//   const [productLedger, setProductLedger] = useState(null);
//   const [notification, setNotification] = useState({ message: "", type: "" });
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     if (window.ethereum) {
//       const w3 = new Web3(window.ethereum);
//       setWeb3(w3);
//     }
//   }, []);

//   // Handle MetaMask account changes
//   useEffect(() => {
//     if (window.ethereum) {
//       const handleAccountsChanged = (newAccounts) => {
//         if (newAccounts.length > 0) {
//           setAccounts(newAccounts);
//           setAccount(newAccounts[0]); // Default to the first account
//           showNotification("Switched to account: " + newAccounts[0], "success");
//         } else {
//           setAccounts([]);
//           setAccount(null);
//           setUserRole(null);
//           showNotification("Wallet disconnected.", "info");
//         }
//       };

//       window.ethereum.on("accountsChanged", handleAccountsChanged);

//       return () => {
//         window.ethereum.removeAllListeners("accountsChanged");
//       };
//     }
//   }, []);

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification({ message: "", type: "" }), 4000);
//   };

//   // const connectWallet = useCallback(async () => {
//   //   try {
//   //     if (!window.ethereum) {
//   //       showNotification("MetaMask not found. Install MetaMask and try again.", "error");
//   //       return;
//   //     }

//   //     await window.ethereum.request({ method: "eth_requestAccounts" });
//   //     const w3 = new Web3(window.ethereum);
//   //     setWeb3(w3);

//   //     const accountsList = await w3.eth.getAccounts();
//   //     console.log("Accounts from web3:", accountsList);
//   //     setAccounts(accountsList); // Store all accounts

//   //     if (accountsList.length > 0) {
//   //       const acc = accountsList[0];
//   //       setAccount(acc);
//   //       console.log("Connected account:", acc);
//   //       showNotification("Wallet connected: " + acc, "success");
//   //     } else {
//   //       showNotification("No account selected.", "error");
//   //       return;
//   //     }

//   //     if (UserRegistry && UserRegistry.abi && USER_REGISTRY_ADDRESS) {
//   //       const ur = new w3.eth.Contract(UserRegistry.abi, USER_REGISTRY_ADDRESS);
//   //       setUserRegistry(ur);
//   //       console.log("UserRegistry loaded at:", USER_REGISTRY_ADDRESS);
//   //     } else {
//   //       console.error("UserRegistry ABI/Address missing!");
//   //     }

//   //     if (ProductLedger && ProductLedger.abi && PRODUCT_LEDGER_ADDRESS) {
//   //       const pl = new w3.eth.Contract(ProductLedger.abi, PRODUCT_LEDGER_ADDRESS);
//   //       setProductLedger(pl);
//   //       console.log("ProductLedger loaded at:", PRODUCT_LEDGER_ADDRESS);
//   //     } else {
//   //       console.error("ProductLedger ABI/Address missing!");
//   //     }
//   //   } catch (err) {
//   //     console.error("connectWallet error:", err);
//   //     showNotification("Failed to connect wallet.", "error");
//   //   }
//   // }, []);

//   const connectWallet = useCallback(async () => {
//     try {
//       if (!window.ethereum) {
//         showNotification("MetaMask not found. Install MetaMask and try again.", "error");
//         return;
//       }

//       // This prompts the user to select accounts in MetaMask
//       const accountsList = await window.ethereum.request({ method: "eth_requestAccounts" });
      
//       if (accountsList.length === 0) {
//         showNotification("No account selected.", "error");
//         return;
//       }
      
//       const w3 = new Web3(window.ethereum);
//       setWeb3(w3);
//       setAccounts(accountsList); // Store all connected accounts

//       // If only one account is connected, set it directly
//       if (accountsList.length === 1) {
//         handleAccountSelected(accountsList[0]);
//       } else {
//         // If multiple accounts, open our custom modal for selection
//         setIsModalOpen(true);
//       }
      
//       // Load contracts right after connecting, they don't depend on the selected account yet
//       if (UserRegistry && UserRegistry.abi && USER_REGISTRY_ADDRESS) {
//         const ur = new w3.eth.Contract(UserRegistry.abi, USER_REGISTRY_ADDRESS);
//         setUserRegistry(ur);
//       }
//       if (ProductLedger && ProductLedger.abi && PRODUCT_LEDGER_ADDRESS) {
//         const pl = new w3.eth.Contract(ProductLedger.abi, PRODUCT_LEDGER_ADDRESS);
//         setProductLedger(pl);
//       }
//     } catch (err) {
//       console.error("connectWallet error:", err);
//       showNotification("Failed to connect wallet.", "error");
//     }
//   }, []);
  
//   // --- NEW FUNCTION to handle account selection from the modal ---
//   const handleAccountSelected = (selectedAccount) => {
//     setAccount(selectedAccount);
//     setIsModalOpen(false); // Close the modal
//     console.log("Connected account:", selectedAccount);
//     showNotification("Wallet connected: " + selectedAccount, "success");
//   };

//   useEffect(() => {
//     const fetchRole = async () => {
//       if (userRegistry && account) {
//         try {
//           const role = await userRegistry.methods.getRole(account).call();
//           console.log("Fetched role:", role);
//           setUserRole(Number(role));
//         } catch (err) {
//           console.warn("Could not read role from registry:", err);
//           setUserRole(0);
//         }
//       }
//     };
//     fetchRole();
//   }, [userRegistry, account]);

//   const handleAccountChange = (selectedAccount) => {
//     setAccount(selectedAccount);
//     showNotification("Switched to account: " + selectedAccount, "success");
//   };

//   const register = async (role) => {
//     try {
//       if (!userRegistry || !account) return;

//       if (role === "Farmer") {
//         await userRegistry.methods
//           .registerAsFarmer("My Name")
//           .send({ from: account });
//       } else if (role === "Vendor") {
//         await userRegistry.methods
//           .registerAsVendor("My Name")
//           .send({ from: account });
//       } else if (role === "Consumer") {
//         await userRegistry.methods
//           .registerAsConsumer("My Name")
//           .send({ from: account });
//       }

//       showNotification(`Registered successfully as ${role}!`, "success");

//       const r = await userRegistry.methods.getRole(account).call();
//       setUserRole(Number(r));
//     } catch (err) {
//       console.error("Registration failed:", err);
//       showNotification("Registration failed.", "error");
//     }
//   };

//   const roleToString = (r) => {
//     switch (Number(r)) {
//       case 0:
//         return "Unassigned";
//       case 1:
//         return "Farmer";
//       case 2:
//         return "Vendor";
//       case 3:
//         return "Consumer";
//       case 4:
//         return "Bank";
//       case 5:
//         return "Insurance";
//       case 6:
//         return "Verifier";
//       default:
//         return "Unknown";
//     }
//   };

//   return (
//     <div className="bg-gray-100 min-h-screen w-full">
//       <Header
//         account={account}
//         accounts={accounts}
//         userRole={userRole}
//         connectWallet={connectWallet}
//         roleToString={roleToString}
//         handleAccountChange={handleAccountChange}
//       />
//       {notification.message && (
//         <Notification message={notification.message} type={notification.type} />
//       )}
//       {isModalOpen && (
//         <AccountSelectionModal
//           accounts={accounts}
//           onSelect={handleAccountSelected}
//           onClose={() => setIsModalOpen(false)}
//         />
//       )}
//       <main className="max-w-4xl mx-auto mt-8">
//         {!account ? (
//           <div className="p-6 bg-white rounded shadow text-center">
//             <h2 className="text-2xl font-semibold">Welcome to the Future of Agriculture</h2>
//             <p className="mt-2 text-gray-600">
//               Please connect your MetaMask wallet to begin.
//             </p>
//             {/* <button
//               onClick={connectWallet}
//               className="mt-4 px-4 py-2 rounded bg-blue-600 text-white"
//             >
//               Connect Wallet
//             </button> */}
//           </div>
//         ) : userRole === 0 ? (
//           <div className="p-6 bg-white rounded shadow text-center">
//             <h2 className="text-2xl font-semibold">Register to Continue</h2>
//             <p className="mt-2 text-gray-600">Choose your role to get started.</p>
//             <div className="mt-4 flex justify-center space-x-4">
//               <button
//                 onClick={() => register("Farmer")}
//                 className="px-4 py-2 rounded bg-green-600 text-white"
//               >
//                 Register as Farmer
//               </button>
//               <button
//                 onClick={() => register("Vendor")}
//                 className="px-4 py-2 rounded bg-blue-600 text-white"
//               >
//                 Register as Vendor
//               </button>
//               <button
//                 onClick={() => register("Consumer")}
//                 className="px-4 py-2 rounded bg-purple-600 text-white"
//               >
//                 Register as Consumer
//               </button>
//             </div>
//           </div>
//         ) : (
//           <Dashboard
//             userRole={userRole}
//             account={account}
//             productLedger={productLedger}
//             showNotification={showNotification}
//             roleToString={roleToString}
//           />
//         )}
//       </main>
//     </div>
//   );
// }

// export default App;



// import React, { useState, useEffect, useCallback } from "react";
// import Web3 from "web3";
// import {
//   USER_REGISTRY_ADDRESS,
//   PRODUCT_LEDGER_ADDRESS,
// } from "./config.js";
// import UserRegistry from './abis/UserRegistry.json';
// import ProductLedger from './abis/ProductLedger.json';
// import Header from "./components/Header";
// import Notification from "./components/Notification";
// import Dashboard from "./pages/Dashboard";
// import AccountSelectionModal from "./components/AccountSelectionModal";
// import NicknameModal from "./components/NickNameModal"; // 👈 1. IMPORT THE NEW MODAL COMPONENT

// function App() {
//   const [web3, setWeb3] = useState(null);
//   const [account, setAccount] = useState(null);
//   const [accounts, setAccounts] = useState([]);
//   const [userRole, setUserRole] = useState(null);
//   const [userRegistry, setUserRegistry] = useState(null);
//   const [productLedger, setProductLedger] = useState(null);
//   const [notification, setNotification] = useState({ message: "", type: "" });
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // 👇 2. ADD NEW STATE FOR NICKNAME MANAGEMENT
//   const [nickname, setNickname] = useState('');
//   const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);

//   useEffect(() => {
//     if (window.ethereum) {
//       const w3 = new Web3(window.ethereum);
//       setWeb3(w3);
//     }
//   }, []);

//   useEffect(() => {
//     if (window.ethereum) {
//       const handleAccountsChanged = (newAccounts) => {
//         if (newAccounts.length > 0) {
//           setAccounts(newAccounts);
//           setAccount(newAccounts[0]);
//           showNotification("Switched to account: " + newAccounts[0], "success");
//         } else {
//           setAccounts([]);
//           setAccount(null);
//           setUserRole(null);
//           showNotification("Wallet disconnected.", "info");
//         }
//       };
//       window.ethereum.on("accountsChanged", handleAccountsChanged);
//       return () => {
//         window.ethereum.removeAllListeners("accountsChanged");
//       };
//     }
//   }, []);

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification({ message: "", type: "" }), 4000);
//   };

//   const connectWallet = useCallback(async () => {
//     try {
//       if (!window.ethereum) {
//         showNotification("MetaMask not found. Install MetaMask and try again.", "error");
//         return;
//       }
//       const accountsList = await window.ethereum.request({ method: "eth_requestAccounts" });
      
//       if (accountsList.length === 0) {
//         showNotification("No account selected.", "error");
//         return;
//       }
      
//       const w3 = new Web3(window.ethereum);
//       setWeb3(w3);
//       setAccounts(accountsList);

//       if (accountsList.length === 1) {
//         handleAccountSelected(accountsList[0]);
//       } else {
//         setIsModalOpen(true);
//       }
      
//       if (UserRegistry && UserRegistry.abi && USER_REGISTRY_ADDRESS) {
//         const ur = new w3.eth.Contract(UserRegistry.abi, USER_REGISTRY_ADDRESS);
//         setUserRegistry(ur);
//       }
//       if (ProductLedger && ProductLedger.abi && PRODUCT_LEDGER_ADDRESS) {
//         const pl = new w3.eth.Contract(ProductLedger.abi, PRODUCT_LEDGER_ADDRESS);
//         setProductLedger(pl);
//       }
//     } catch (err) {
//       console.error("connectWallet error:", err);
//       showNotification("Failed to connect wallet.", "error");
//     }
//   }, []);
  
//   const handleAccountSelected = (selectedAccount) => {
//     setAccount(selectedAccount);
//     setIsModalOpen(false);
//     console.log("Connected account:", selectedAccount);
//     showNotification("Wallet connected: " + selectedAccount, "success");
//   };

//   // 👇 3. UPDATE USEEFFECT TO FETCH ROLE AND NICKNAME
//   useEffect(() => {
//     const fetchUserData = async () => {
//       // Fetch role from smart contract
//       if (userRegistry && account) {
//         try {
//           const role = await userRegistry.methods.getRole(account).call();
//           console.log("Fetched role:", role);
//           setUserRole(Number(role));
//         } catch (err) {
//           console.warn("Could not read role from registry:", err);
//           setUserRole(0);
//         }
//       }
//       // Fetch nickname from localStorage
//       if (account) {
//         const savedNickname = localStorage.getItem(`nickname_${account}`);
//         if (savedNickname) {
//           setNickname(savedNickname);
//         } else {
//           setNickname(''); // Reset if no nickname for this account
//         }
//       } else {
//         setUserRole(null);
//         setNickname(''); // Reset nickname if wallet disconnects
//       }
//     };
//     fetchUserData();
//   }, [userRegistry, account]);

//   // 👇 4. ADD A FUNCTION TO SAVE THE NICKNAME
//   const handleSetNickname = (newNickname) => {
//     if (!account) {
//       showNotification("Please connect your wallet first.", "error");
//       return;
//     }
//     if (!newNickname || newNickname.trim() === '') {
//       showNotification("Nickname cannot be empty.", "error");
//       return;
//     }
//     const trimmedNickname = newNickname.trim();
//     localStorage.setItem(`nickname_${account}`, trimmedNickname);
//     setNickname(trimmedNickname);
//     showNotification("Nickname updated successfully!", "success");
//     setIsNicknameModalOpen(false); // Close the modal
//   };

//   const handleAccountChange = (selectedAccount) => {
//     setAccount(selectedAccount);
//     showNotification("Switched to account: " + selectedAccount, "success");
//   };

//   const register = async (role) => {
//     try {
//       if (!userRegistry || !account) return;
//       // ... (rest of the register function is unchanged)
//       if (role === "Farmer") {
//         await userRegistry.methods
//           .registerAsFarmer("My Name")
//           .send({ from: account });
//       } else if (role === "Vendor") {
//         await userRegistry.methods
//           .registerAsVendor("My Name")
//           .send({ from: account });
//       } else if (role === "Consumer") {
//         await userRegistry.methods
//           .registerAsConsumer("My Name")
//           .send({ from: account });
//       }
//       showNotification(`Registered successfully as ${role}!`, "success");
//       const r = await userRegistry.methods.getRole(account).call();
//       setUserRole(Number(r));
//     } catch (err) {
//       console.error("Registration failed:", err);
//       showNotification("Registration failed.", "error");
//     }
//   };

//   const roleToString = (r) => {
//     // ... (roleToString function is unchanged)
//     switch (Number(r)) {
//       case 0: return "Unassigned";
//       case 1: return "Farmer";
//       case 2: return "Vendor";
//       case 3: return "Consumer";
//       case 4: return "Bank";
//       case 5: return "Insurance";
//       case 6: return "Verifier";
//       default: return "Unknown";
//     }
//   };

//   return (
//     <div className="bg-gray-100 min-h-screen w-full">
//       <Header
//         account={account}
//         accounts={accounts}
//         userRole={userRole}
//         connectWallet={connectWallet}
//         roleToString={roleToString}
//         handleAccountChange={handleAccountChange}
//         // 👇 5. PASS NICKNAME PROPS TO HEADER
//         nickname={nickname}
//         onSetNickname={() => setIsNicknameModalOpen(true)}
//       />
//       {notification.message && (
//         <Notification message={notification.message} type={notification.type} />
//       )}
//       {isModalOpen && (
//         <AccountSelectionModal
//           accounts={accounts}
//           onSelect={handleAccountSelected}
//           onClose={() => setIsModalOpen(false)}
//         />
//       )}
//       {/* 👇 6. RENDER THE NICKNAME MODAL */}
//       {isNicknameModalOpen && (
//         <NicknameModal
//           onSave={handleSetNickname}
//           onClose={() => setIsNicknameModalOpen(false)}
//           currentNickname={nickname}
//         />
//       )}
//       <main className="max-w-4xl mx-auto mt-8">
//         {/* ... (rest of the JSX is unchanged) */}
//         {!account ? (
//           <div className="p-6 bg-white rounded shadow text-center">
//             <h2 className="text-2xl font-semibold">Welcome to the Future of Agriculture</h2>
//             <p className="mt-2 text-gray-600">
//               Please connect your MetaMask wallet to begin.
//             </p>
//           </div>
//         ) : userRole === 0 ? (
//           <div className="p-6 bg-white rounded shadow text-center">
//              <h2 className="text-2xl font-semibold">Register to Continue</h2>
//              <p className="mt-2 text-gray-600">Choose your role to get started.</p>
//              <div className="mt-4 flex justify-center space-x-4">
//                <button onClick={() => register("Farmer")} className="px-4 py-2 rounded bg-green-600 text-white">Register as Farmer</button>
//                <button onClick={() => register("Vendor")} className="px-4 py-2 rounded bg-blue-600 text-white">Register as Vendor</button>
//                <button onClick={() => register("Consumer")} className="px-4 py-2 rounded bg-purple-600 text-white">Register as Consumer</button>
//              </div>
//           </div>
//         ) : (
//           <Dashboard
//             userRole={userRole}
//             account={account}
//             productLedger={productLedger}
//             showNotification={showNotification}
//             roleToString={roleToString}
//           />
//         )}
//       </main>
//     </div>
//   );
// }

// export default App;





// import  { useState, useEffect, useCallback } from "react";
// import Web3 from "web3";
// import {
//     USER_REGISTRY_ADDRESS,
//     PRODUCT_LEDGER_ADDRESS,
//     CROP_INSURANCE_ADDRESS, // 🆕 ADDED
//     LOAN_MATCHING_ADDRESS,   // 🆕 ADDED
// } from "./config.js";
// import UserRegistry from './abis/UserRegistry.json';
// import ProductLedger from './abis/ProductLedger.json';
// import CropInsurance from './abis/CropInsurance.json'; // 🆕 ADDED
// import LoanMatching from './abis/LoanMatching.json';   // 🆕 ADDED
// import Header from "./components/Header";
// import Notification from "./components/Notification";
// import Dashboard from "./pages/Dashboard";
// import AccountSelectionModal from "./components/AccountSelectionModal";
// import NicknameModal from "./components/NickNameModal";

// function App() {
//     // --- Web3 State ---
//     const [web3, setWeb3] = useState(null);
//     const [account, setAccount] = useState(null);
//     const [accounts, setAccounts] = useState([]);
//     const [userRole, setUserRole] = useState(null);

//     // --- Contract State ---
//     const [userRegistry, setUserRegistry] = useState(null);
//     const [productLedger, setProductLedger] = useState(null);
//     const [cropInsurance, setCropInsurance] = useState(null); // 🆕 ADDED
//     const [loanMatching, setLoanMatching] = useState(null);   // 🆕 ADDED

//     // --- UI State ---
//     const [notification, setNotification] = useState({ message: "", type: "" });
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [nickname, setNickname] = useState('');
//     const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);

//     // ... (useEffect for wallet connection and account changes are fine)
//     useEffect(() => {
//     if (window.ethereum) {
//       const w3 = new Web3(window.ethereum);
//       setWeb3(w3);
//     }
//   }, []);

//   useEffect(() => {
//     if (window.ethereum) {
//       const handleAccountsChanged = (newAccounts) => {
//         if (newAccounts.length > 0) {
//           setAccounts(newAccounts);
//           setAccount(newAccounts[0]);
//           showNotification("Switched to account: " + newAccounts[0], "success");
//         } else {
//           setAccounts([]);
//           setAccount(null);
//           setUserRole(null);
//           showNotification("Wallet disconnected.", "info");
//         }
//       };
//       window.ethereum.on("accountsChanged", handleAccountsChanged);
//       return () => {
//         window.ethereum.removeAllListeners("accountsChanged");
//       };
//     }
//   }, []);

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification({ message: "", type: "" }), 4000);
//   };

//     const connectWallet = useCallback(async () => {
//         try {
//             if (!window.ethereum) {
//                 showNotification("MetaMask not found.", "error");
//                 return;
//             }
//             const accountsList = await window.ethereum.request({ method: "eth_requestAccounts" });
//             if (accountsList.length === 0) return;

//             const w3 = new Web3(window.ethereum);
//             setWeb3(w3);
//             setAccounts(accountsList);

//             // ❗ CHANGED: Instantiate all contracts
//             const ur = new w3.eth.Contract(UserRegistry.abi, USER_REGISTRY_ADDRESS);
//             const pl = new w3.eth.Contract(ProductLedger.abi, PRODUCT_LEDGER_ADDRESS);
//             const ci = new w3.eth.Contract(CropInsurance.abi, CROP_INSURANCE_ADDRESS);
//             const lm = new w3.eth.Contract(LoanMatching.abi, LOAN_MATCHING_ADDRESS);
//             setUserRegistry(ur);
//             setProductLedger(pl);
//             setCropInsurance(ci);
//             setLoanMatching(lm);

//             if (accountsList.length === 1) {
//                 handleAccountSelected(accountsList[0]);
//             } else {
//                 setIsModalOpen(true);
//             }
//         } catch (err) {
//             console.error("connectWallet error:", err);
//             showNotification("Failed to connect wallet.", "error");
//         }
//     }, []);

//     // ... (handleAccountSelected, useEffect for fetchUserData, handleSetNickname are fine)
//     const handleAccountSelected = (selectedAccount) => {
//     setAccount(selectedAccount);
//     setIsModalOpen(false);
//     console.log("Connected account:", selectedAccount);
//     showNotification("Wallet connected: " + selectedAccount, "success");
//   };

//   // 👇 3. UPDATE USEEFFECT TO FETCH ROLE AND NICKNAME
//   useEffect(() => {
//     const fetchUserData = async () => {
//       // Fetch role from smart contract
//       if (userRegistry && account) {
//         try {
//           const role = await userRegistry.methods.getUser(account).call();
//           console.log("Fetched role:", role);
//           setUserRole(Number(role));
//         } catch (err) {
//           console.warn("Could not read role from registry:", err);
//           setUserRole(0);
//         }
//       }
//       // Fetch nickname from localStorage
//       if (account) {
//         const savedNickname = localStorage.getItem(`nickname_${account}`);
//         if (savedNickname) {
//           setNickname(savedNickname);
//         } else {
//           setNickname(''); // Reset if no nickname for this account
//         }
//       } else {
//         setUserRole(null);
//         setNickname(''); // Reset nickname if wallet disconnects
//       }
//     };
//     fetchUserData();
//   }, [userRegistry, account]);

//   // 👇 4. ADD A FUNCTION TO SAVE THE NICKNAME
//   const handleSetNickname = (newNickname) => {
//     if (!account) {
//       showNotification("Please connect your wallet first.", "error");
//       return;
//     }
//     if (!newNickname || newNickname.trim() === '') {
//       showNotification("Nickname cannot be empty.", "error");
//       return;
//     }
//     const trimmedNickname = newNickname.trim();
//     localStorage.setItem(`nickname_${account}`, trimmedNickname);
//     setNickname(trimmedNickname);
//     showNotification("Nickname updated successfully!", "success");
//     setIsNicknameModalOpen(false); // Close the modal
//   };

//   const handleAccountChange = (selectedAccount) => {
//     setAccount(selectedAccount);
//     showNotification("Switched to account: " + selectedAccount, "success");
//   };

//     // ❗ CHANGED: Registration logic updated for farmer
//     const register = async (role) => {
//         try {
//             if (!userRegistry || !account || !nickname.trim()) {
//                 showNotification("Please connect wallet and set a name first.", "error");
//                 return;
//             }

//             if (role === "Farmer") {
//                 const landSize = prompt("Please enter your landholding size (in acres):");
//                 if (!landSize || isNaN(landSize) || landSize <= 0) {
//                     showNotification("Invalid land size provided.", "error");
//                     return;
//                 }
//                 await userRegistry.methods.registerAsFarmer(nickname, landSize).send({ from: account });
//             } else if (role === "Vendor") {
//                 await userRegistry.methods.registerAsVendor(nickname).send({ from: account });
//             } else if (role === "Consumer") {
//                 await userRegistry.methods.registerAsConsumer(nickname).send({ from: account });
//             }
//             showNotification(`Registered successfully as ${role}!`, "success");
//             const r = await userRegistry.methods.getUser(account).call();
//             setUserRole(Number(r.role));
//         } catch (err) {
//             console.error("Registration failed:", err);
//             showNotification("Registration failed.", "error");
//         }
//     };
    
//     // ... (roleToString and return JSX is mostly the same, but pass down new contracts to Dashboard)
//     const roleToString = (r) => {
//     // ... (roleToString function is unchanged)
//     switch (Number(r)) {
//       case 0: return "Unassigned";
//       case 1: return "Farmer";
//       case 2: return "Vendor";
//       case 3: return "Consumer";
//       case 4: return "Bank";
//       case 5: return "Insurance";
//       case 6: return "Verifier";
//       default: return "Unknown";
//     }
//   };
    
//     return (
//         <div className="bg-gray-100 min-h-screen w-full">
//           <Header
//         account={account}
//         accounts={accounts}
//         userRole={userRole}
//         connectWallet={connectWallet}
//         roleToString={roleToString}
//         handleAccountChange={handleAccountChange}
//         // 👇 5. PASS NICKNAME PROPS TO HEADER
//         nickname={nickname}
//         onSetNickname={() => setIsNicknameModalOpen(true)}
//       />
//         {notification.message && (
//         <Notification message={notification.message} type={notification.type} />
//       )}
//       {isModalOpen && (
//         <AccountSelectionModal
//           accounts={accounts}
//           onSelect={handleAccountSelected}
//           onClose={() => setIsModalOpen(false)}
//         />
//       )}
//       {/* 👇 6. RENDER THE NICKNAME MODAL */}
//       {isNicknameModalOpen && (
//         <NicknameModal
//           onSave={handleSetNickname}
//           onClose={() => setIsNicknameModalOpen(false)}
//           currentNickname={nickname}
//         />
//       )}
//             <main className="max-w-4xl mx-auto mt-8">
//                 {/* ...welcome/registration UI... */}
//         {!account ? (
//           <div className="p-6 bg-white rounded shadow text-center">
//             <h2 className="text-2xl font-semibold">Welcome to the Future of Agriculture</h2>
//             <p className="mt-2 text-gray-600">
//               Please connect your MetaMask wallet to begin.
//             </p>
//           </div>
//         ) : userRole === 0 ? (
//           <div className="p-6 bg-white rounded shadow text-center">
//             <h2 className="text-2xl font-semibold">Register to Continue</h2>
//             <p className="mt-2 text-gray-600">Choose your role to get started.</p>
//             <div className="mt-4 flex justify-center space-x-4">
//               <button onClick={() => register("Farmer")} className="px-4 py-2 rounded bg-green-600 text-white">Register as Farmer</button>
//               <button onClick={() => register("Vendor")} className="px-4 py-2 rounded bg-blue-600 text-white">Register as Vendor</button>
//               <button onClick={() => register("Consumer")} className="px-4 py-2 rounded bg-purple-600 text-white">Register as Consumer</button>
//             </div>
//           </div>
//         ) : (
//           <Dashboard
//             userRole={userRole}
//             account={account}
//             userRegistry={userRegistry} // Pass all contracts
//             productLedger={productLedger}
//             cropInsurance={cropInsurance}
//             loanMatching={loanMatching}
//             showNotification={showNotification}
//             roleToString={roleToString}
//           />
//         )}
//             </main>
//         </div>
//     );
// }

// export default App;



// import { useState, useEffect, useCallback } from "react";
// import Web3 from "web3";
// import {
//     USER_REGISTRY_ADDRESS,
//     PRODUCT_LEDGER_ADDRESS,
//     CROP_INSURANCE_ADDRESS,
//     LOAN_MATCHING_ADDRESS,
// } from "./config.js";
// import UserRegistry from './abis/UserRegistry.json';
// import ProductLedger from './abis/ProductLedger.json';
// import CropInsurance from './abis/CropInsurance.json';
// import LoanMatching from './abis/LoanMatching.json';
// import Header from "./components/Header";
// import Notification from "./components/Notification";
// import Dashboard from "./pages/Dashboard";
// import AccountSelectionModal from "./components/AccountSelectionModal";
// import NicknameModal from "./components/NickNameModal";

// function App() {
//     // --- Web3 State ---
//     const [web3, setWeb3] = useState(null);
//     const [account, setAccount] = useState(null);
//     const [accounts, setAccounts] = useState([]);
//     const [userRole, setUserRole] = useState(null);
//     const [isOwner, setIsOwner] = useState(false);

//     // --- Contract State ---
//     const [userRegistry, setUserRegistry] = useState(null);
//     const [productLedger, setProductLedger] = useState(null);
//     const [cropInsurance, setCropInsurance] = useState(null);
//     const [loanMatching, setLoanMatching] = useState(null);
//     const [refreshTrigger, setRefreshTrigger] = useState(0);

//     // --- UI State ---
//     const [notification, setNotification] = useState({ message: "", type: "" });
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [nickname, setNickname] = useState('');
//     const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);

//     useEffect(() => {
//         if (window.ethereum) {
//             const w3 = new Web3(window.ethereum);
//             setWeb3(w3);
//         }
//     }, []);

//     useEffect(() => {
//         if (window.ethereum) {
//             const handleAccountsChanged = (newAccounts) => {
//                 if (newAccounts.length > 0) {
//                     setAccounts(newAccounts);
//                     setAccount(newAccounts[0]);
//                     showNotification("Switched to account: " + newAccounts[0], "success");
//                 } else {
//                     setAccounts([]);
//                     setAccount(null);
//                     setUserRole(null);
//                     showNotification("Wallet disconnected.", "info");
//                 }
//             };
//             window.ethereum.on("accountsChanged", handleAccountsChanged);
//             return () => {
//                 window.ethereum.removeAllListeners("accountsChanged");
//             };
//         }
//     }, []);

//     const showNotification = (message, type = "success") => {
//         setNotification({ message, type });
//         setTimeout(() => setNotification({ message: "", type: "" }), 4000);
//     };

//     const connectWallet = useCallback(async () => {
//         try {
//             if (!window.ethereum) {
//                 showNotification("MetaMask not found.", "error");
//                 return;
//             }
//             const accountsList = await window.ethereum.request({ method: "eth_requestAccounts" });
//             if (accountsList.length === 0) return;

//             const w3 = new Web3(window.ethereum);
//             setWeb3(w3);
//             setAccounts(accountsList);
//             console.log("Web3 and accounts set:", w3, accountsList);

//             // Instantiate all contracts
//             const ur = new w3.eth.Contract(UserRegistry.abi, USER_REGISTRY_ADDRESS);
//             const pl = new w3.eth.Contract(ProductLedger.abi, PRODUCT_LEDGER_ADDRESS);
//             const ci = new w3.eth.Contract(CropInsurance.abi, CROP_INSURANCE_ADDRESS);
//             const lm = new w3.eth.Contract(LoanMatching.abi, LOAN_MATCHING_ADDRESS);
//             setUserRegistry(ur);
//             setProductLedger(pl);
//             setCropInsurance(ci);
//             setLoanMatching(lm);

//             if (accountsList.length === 1) {
//                 handleAccountSelected(accountsList[0]);
//             } else {
//                 setIsModalOpen(true);
//             }
//         } catch (err) {
//             console.error("connectWallet error:", err);
//             showNotification("Failed to connect wallet.", "error");
//         }
//     }, []);

//     const handleAccountSelected = (selectedAccount) => {
//         setAccount(selectedAccount);
//         setIsModalOpen(false);
//         console.log("Connected account:", selectedAccount);
//         showNotification("Wallet connected: " + selectedAccount, "success");
//     };

//     // ✅ CORRECTED: Safely access the 'role' property from the returned struct
//     // useEffect(() => {
//     //     const fetchUserData = async () => {
//     //         if (userRegistry && account) {
//     //             try {
//     //                 const userData = await userRegistry.methods.getUser(account).call();
//     //                 console.log("Fetched user data:", userData);
//     //                 setUserRole(Number(userData.role)); // Correctly access the 'role' property
//     //             } catch (err) {
//     //                 console.warn("Could not read role from registry:", err);
//     //                 setUserRole(0); // Default to Unassigned
//     //             }
//     //         }
//     //         if (account) {
//     //             const savedNickname = localStorage.getItem(`nickname_${account}`);
//     //             setNickname(savedNickname || '');
//     //         } else {
//     //             setUserRole(null);
//     //             setNickname('');
//     //         }
//     //     };
//     //     fetchUserData();
//     // }, [userRegistry, account]);

//     // 🔽 THIS IS THE UPDATED LOGIC 🔽
//     useEffect(() => {
//         const fetchUserData = async () => {
//             if (!userRegistry || !account) {
//                 // Clear user state if account is disconnected
//                 if (!account) {
//                     setUserRole(null);
//                     setIsOwner(false);
//                     setNickname('');
//                 }
//                 return;
//             }

//             try {
//                 // Step 1: Always fetch the owner address first
//                 const contractOwner = await userRegistry.methods.owner().call();
//                 const isUserTheOwner = account.toLowerCase() === contractOwner.toLowerCase();
                
//                 setIsOwner(isUserTheOwner); // 👈 Set owner status

//                 // Step 2: Check if the connected user is the owner
//                 if (isUserTheOwner) {
//                     // 👈 If they are the owner, assign the Admin/Verifier role directly
//                     // This bypasses the need to call getUser() for them.
//                     console.log("User is the contract owner. Assigning Admin role.");
//                     setUserRole(6); // Role 6 is 'Verifier', a good default for an admin
//                 } else {
//                     // 👈 If they are a regular user, fetch their data from the contract
//                     console.log("User is not the owner. Fetching specific role.");
//                     const userData = await userRegistry.methods.getUser(account).call();
//                     setUserRole(Number(userData.role));
//                 }

//                 // Step 3: Fetch nickname from local storage for any connected account
//                 const savedNickname = localStorage.getItem(`nickname_${account}`);
//                 setNickname(savedNickname || '');

//             } catch (err) {
//                 console.warn("Could not read user data from registry:", err);
//                 setUserRole(0); // Default to Unassigned on any error
//                 setIsOwner(false);
//             }
//         };

//         fetchUserData();
//     }, [userRegistry, account]);

//     const handleSetNickname = (newNickname) => {
//         if (!account) {
//             showNotification("Please connect your wallet first.", "error");
//             return;
//         }
//         if (!newNickname || newNickname.trim() === '') {
//             showNotification("Nickname cannot be empty.", "error");
//             return;
//         }
//         const trimmedNickname = newNickname.trim();
//         localStorage.setItem(`nickname_${account}`, trimmedNickname);
//         setNickname(trimmedNickname);
//         showNotification("Nickname updated successfully!", "success");
//         setIsNicknameModalOpen(false);
//     };

//     const handleAccountChange = (selectedAccount) => {
//         setAccount(selectedAccount);
//         showNotification("Switched to account: " + selectedAccount, "success");
//     };

//     // 🆕 CREATE A FUNCTION TO TRIGGER THE REFRESH
//     const triggerRefresh = () => {
//         console.log("Triggering data refresh...");
//         setRefreshTrigger(prev => prev + 1); // Increment to trigger useEffect hooks
//     };

//     // ✅ CHANGED: Registration logic doesn't force pre-setting a nickname
//     const register = async (role) => {
//         try {
//             if (!userRegistry || !account) {
//                 showNotification("Please connect wallet first.", "error");
//                 return;
//             }

//             // If nickname is not set, prompt for it now.
//             let registrationName = nickname.trim();
//             if (!registrationName) {
//                 registrationName = prompt("Please enter a name for registration:");
//                 if (!registrationName || registrationName.trim() === '') {
//                     showNotification("A name is required to register.", "error");
//                     return;
//                 }
//                 // Also save the newly entered name for convenience
//                 handleSetNickname(registrationName);
//             }

//             if (role === "Farmer") {
//                 const landSize = prompt("Please enter your landholding size (in acres):");
//                 if (!landSize || isNaN(landSize) || landSize <= 0) {
//                     showNotification("Invalid land size provided.", "error");
//                     return;
//                 }
//                 await userRegistry.methods.registerAsFarmer(registrationName, landSize).send({ from: account });
//             } else if (role === "Vendor") {
//                 await userRegistry.methods.registerAsVendor(registrationName).send({ from: account });
//             } else if (role === "Consumer") {
//                 await userRegistry.methods.registerAsConsumer(registrationName).send({ from: account });
//             }

//             showNotification(`Registered successfully as ${role}!`, "success");
//             const updatedUserData = await userRegistry.methods.getUser(account).call();
//             setUserRole(Number(updatedUserData.role));

//         } catch (err) {
//             console.error("Registration failed:", err);
//             showNotification("Registration failed.", "error");
//         }
//     };

//     const roleToString = (r) => {
//         switch (Number(r)) {
//             case 0: return "Unassigned";
//             case 1: return "Farmer";
//             case 2: return "Vendor";
//             case 3: return "Consumer";
//             case 4: return "Bank";
//             case 5: return "Insurance";
//             case 6: return "Verifier";
//             default: return "Unknown";
//         }
//     };

//     return (
//         <div className="bg-gray-100 min-h-screen w-full">
//             <Header
//                 account={account}
//                 accounts={accounts}
//                 userRole={userRole}
//                 connectWallet={connectWallet}
//                 roleToString={roleToString}
//                 handleAccountChange={handleAccountChange}
//                 nickname={nickname}
//                 onSetNickname={() => setIsNicknameModalOpen(true)}
//             />
//             {notification.message && (
//                 <Notification message={notification.message} type={notification.type} />
//             )}
//             {isModalOpen && (
//                 <AccountSelectionModal
//                     accounts={accounts}
//                     onSelect={handleAccountSelected}
//                     onClose={() => setIsModalOpen(false)}
//                 />
//             )}
//             {isNicknameModalOpen && (
//                 <NicknameModal
//                     onSave={handleSetNickname}
//                     onClose={() => setIsNicknameModalOpen(false)}
//                     currentNickname={nickname}
//                 />
//             )}
//             <main className="max-w-4xl mx-auto mt-8 p-4">
//                 {!account ? (
//                     <div className="p-6 bg-white rounded shadow text-center">
//                         <h2 className="text-2xl font-semibold">Welcome to the Future of Agriculture</h2>
//                         <p className="mt-2 text-gray-600">
//                             Please connect your MetaMask wallet to begin.
//                         </p>
//                     </div>
//                 ) : userRole === 0 ? (
//                     <div className="p-6 bg-white rounded shadow text-center">
//                         <h2 className="text-2xl font-semibold">Register to Continue</h2>
//                         <p className="mt-2 text-gray-600">Choose your role to get started.</p>
//                         <div className="mt-4 flex justify-center space-x-4">
//                             <button onClick={() => register("Farmer")} className="px-4 py-2 rounded bg-green-600 text-white">Register as Farmer</button>
//                             <button onClick={() => register("Vendor")} className="px-4 py-2 rounded bg-blue-600 text-white">Register as Vendor</button>
//                             <button onClick={() => register("Consumer")} className="px-4 py-2 rounded bg-purple-600 text-white">Register as Consumer</button>
//                         </div>
//                     </div>
//                 ) : (
//                     <Dashboard
//                         isOwner={isOwner}
//                         web3={web3}
//                         userRole={userRole}
//                         account={account}
//                         userRegistry={userRegistry}
//                         productLedger={productLedger}
//                         cropInsurance={cropInsurance}
//                         loanMatching={loanMatching}
//                         showNotification={showNotification}
//                         roleToString={roleToString}
//                         refreshTrigger={refreshTrigger}
//                         triggerRefresh={triggerRefresh}
//                     />
//                 )}
//             </main>
//         </div>
//     );
// }

// export default App;



import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import {
    USER_REGISTRY_ADDRESS,
    PRODUCT_LEDGER_ADDRESS,
    CROP_INSURANCE_ADDRESS,
    LOAN_MATCHING_ADDRESS,
} from "./config.js";
import UserRegistry from './abis/UserRegistry.json';
import ProductLedger from './abis/ProductLedger.json';
import CropInsurance from './abis/CropInsurance.json';
import LoanMatching from './abis/LoanMatching.json';
import Header from "./components/Header";
import Notification from "./components/Notification";
import Dashboard from "./pages/Dashboard";
import AccountSelectionModal from "./components/AccountSelectionModal";
import NicknameModal from "./components/NickNameModal";
import RegistrationModal from "./components/RegistrationModal"; // 🆕 IMPORT THE NEW MODAL

function App() {
    // --- Web3 State ---
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    // --- Contract State ---
    const [userRegistry, setUserRegistry] = useState(null);
    const [productLedger, setProductLedger] = useState(null);
    const [cropInsurance, setCropInsurance] = useState(null);
    const [loanMatching, setLoanMatching] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // --- UI State ---
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nickname, setNickname] = useState('');
    const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
    
    // 🆕 ADDED STATE FOR REGISTRATION MODAL
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
            const accountsList = await window.ethereum.request({ method: "eth_requestAccounts" });
            if (accountsList.length === 0) return;

            const w3 = new Web3(window.ethereum);
            setWeb3(w3);
            setAccounts(accountsList);
            console.log("Web3 and accounts set:", w3, accountsList);

            const ur = new w3.eth.Contract(UserRegistry.abi, USER_REGISTRY_ADDRESS);
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
                    setNickname('');
                }
                return;
            }

            try {
                const contractOwner = await userRegistry.methods.owner().call();
                const isUserTheOwner = account.toLowerCase() === contractOwner.toLowerCase();
                
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
                setNickname(savedNickname || '');

            } catch (err) {
                console.warn("Could not read user data from registry:", err);
                setUserRole(0); // Default to Unassigned on any error
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
        if (!newNickname || newNickname.trim() === '') {
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
        setRefreshTrigger(prev => prev + 1);
    };

    // 🆕 NEW: Function to open the registration modal
    const handleOpenRegistrationModal = (role) => {
        setSelectedRoleForRegistration(role);
        setIsRegistrationModalOpen(true);
    };

    // ✅ REFACTORED: The registration logic now takes form data as input
    const handleRegistrationSubmit = async (formData) => {
        const { nickname: registrationName, landSize, toolsOwned } = formData;
        const role = selectedRoleForRegistration;
        
        try {
            if (!userRegistry || !account) {
                showNotification("Please connect wallet first.", "error");
                return;
            }

            // Also save the newly entered name for convenience
            handleSetNickname(registrationName);
            console.log(`Registration attempt for ${role} with name ${registrationName}.`);

            if (role === "Farmer") {
                console.log(`Farmer details - Land: ${landSize}, Tools: ${toolsOwned}`);
                // Note: The `toolsOwned` is captured but not sent to the contract,
                // as the original contract function doesn't accept it.
                // This would require a smart contract modification to store it on-chain.
                await userRegistry.methods.registerAsFarmer(registrationName, landSize).send({ from: account });
            } else if (role === "Vendor") {
                await userRegistry.methods.registerAsVendor(registrationName).send({ from: account });
            } else if (role === "Consumer") {
                await userRegistry.methods.registerAsConsumer(registrationName).send({ from: account });
            }

            showNotification(`Registered successfully as ${role}!`, "success");
            triggerRefresh(); // Refresh user data to get the new role
            setIsRegistrationModalOpen(false); // Close the modal on success

        } catch (err) {
            console.error("Registration failed:", err);
            showNotification("Registration failed. Check console for details.", "error");
        }
    };


    const roleToString = (r) => {
        switch (Number(r)) {
            case 0: return "Unassigned";
            case 1: return "Farmer";
            case 2: return "Vendor";
            case 3: return "Consumer";
            case 4: return "Bank";
            case 5: return "Insurance";
            case 6: return "Verifier";
            default: return "Unknown";
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
            {/* 🆕 RENDER THE NEW REGISTRATION MODAL */}
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
                        <h2 className="text-2xl font-semibold">Welcome to the Future of Agriculture</h2>
                        <p className="mt-2 text-gray-600">
                            Please connect your MetaMask wallet to begin.
                        </p>
                    </div>
                ) : userRole === 0 ? (
                    <div className="p-6 bg-white rounded shadow text-center">
                        <h2 className="text-2xl font-semibold">Register to Continue</h2>
                        <p className="mt-2 text-gray-600">Choose your role to get started.</p>
                        <div className="mt-4 flex justify-center space-x-4">
                            {/* ✅ BUTTONS NOW OPEN THE MODAL INSTEAD OF CALLING REGISTER DIRECTLY */}
                            <button onClick={() => handleOpenRegistrationModal("Farmer")} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition">Register as Farmer</button>
                            <button onClick={() => handleOpenRegistrationModal("Vendor")} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">Register as Vendor</button>
                            <button onClick={() => handleOpenRegistrationModal("Consumer")} className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition">Register as Consumer</button>
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
                    />
                )}
            </main>
        </div>
    );
}

export default App;