// import React, { useState, useEffect } from 'react';

// const loanStatusToString = (status) => {
//     const statuses = ['Pending', 'Approved', 'Disbursed', 'Repaid', 'Rejected'];
//     return statuses[Number(status)] || 'Unknown';
// }

// const FarmerLoans = ({ loanMatching, cropInsurance, productLedger, userRegistry, account, showNotification }) => {
//     // --- Form State ---
//     // ❗ RENAMED: from bankAddress to selectedBankAddress for clarity
//     const [selectedBankAddress, setSelectedBankAddress] = useState('');
//     const [loanAmount, setLoanAmount] = useState('');
//     const [formLoading, setFormLoading] = useState(false);

//     // 🆕 --- State to hold the list of available banks ---
//     const [banks, setBanks] = useState([]);

//     // --- Application List State ---
//     const [applications, setApplications] = useState([]);
//     const [listLoading, setListLoading] = useState(true);

//     // const fetchApplications = async () => {
//     //     if (!loanMatching) return;
//     //     setListLoading(true);
//     //     try {
//     //         const appCounter = await loanMatching.methods.applicationCounter().call();
//     //         const fetchedApps = [];
//     //         for (let i = 1; i <= appCounter; i++) {
//     //             const app = await loanMatching.methods.applications(i).call();
//     //             if (app.farmer.toLowerCase() === account.toLowerCase()) {
//     //                 // 🆕 Also fetch the bank's name for better display
//     //                 const bankUser = await userRegistry.methods.users(app.bank).call();
//     //                 app.bankName = bankUser.name;
//     //                 fetchedApps.push(app);
//     //             }
//     //         }
//     //         setApplications(fetchedApps.reverse());
//     //     } catch (err) {
//     //         console.error("Error fetching loan applications:", err);
//     //         showNotification('Could not fetch loan applications.', 'error');
//     //     } finally {
//     //         setListLoading(false);
//     //     }
//     // };

//     // 🆕 --- Function to fetch all registered banks from the contract ---
    
//     const fetchApplications = async () => {
//         if (!loanMatching || !account) return;
//         setListLoading(true);

//         try {
//             // --- UPDATED LOGIC FOR PARALLEL ARRAYS ---

//             // 1. Call the new function that returns two arrays.
//             // Web3.js returns multiple values in an object with numeric keys.
//             const result = await loanMatching.methods.getApplicationsAndBankNamesByFarmer(account).call();
//             const rawApps = result[0];      // The array of LoanApplication structs
//             const bankNames = result[1];    // The array of bank name strings

//             // 2. Combine the two parallel arrays into a single array of objects.
//             // This makes it easy for the rest of the component to use the data.
//             const combinedApps = rawApps.map((app, index) => ({
//                 ...app, // Copy all properties from the original app struct
//                 bankName: bankNames[index] // Add the bankName from the second array
//             }));

//             // 3. Set the combined data into state (reversing for chronological order).
//             setApplications([...combinedApps].reverse());

//         } catch (err) {
//             console.error("Error fetching loan applications:", err);
//             showNotification("Error fetching loan applications", "error");
//         } finally {
//             setListLoading(false);
//         }
//     };
    
//     const fetchBanks = async () => {
//         if (!userRegistry) return;
//         try {
//             // const fetchedBanks = [];
//             // const allUserAddresses = await userRegistry.methods.userAddresses().call();
//             // for (const address of allUserAddresses) {
//             //     const user = await userRegistry.methods.users(address).call();
//             //     // UserRole Enum in Solidity: Bank is 4
//             //     if (Number(user.role) === 4) {
//             //         fetchedBanks.push({ name: user.name, address: user.userAddress });
//             //     }
//             // }
//             // setBanks(fetchedBanks);
//             // // Set a default selection if any banks were found
//             // if (fetchedBanks.length > 0) {
//             //     setSelectedBankAddress(fetchedBanks[0].address);
//             // }
//             const allUserAddresses = [];
//             let index = 0;
//             while (true) {
//                 try {
//                     // Fetch one address at a time by its index
//                     const address = await userRegistry.methods.userAddresses(index).call();
//                     allUserAddresses.push(address);
//                     index++;
//                 } catch (e) {
//                     // An error means the index is out of bounds; we're done.
//                     break;
//                 }
//             }
//             console.log("All user addresses:", allUserAddresses.length);
//             const fetchedProviders = [];
//             for (const address of allUserAddresses) {
//                 const user = await userRegistry.methods.users(address).call();
//                 // UserRole Enum in Solidity: Insurance is 5
//                 if (Number(user.role) === 4) {
//                     fetchedProviders.push({ name: user.name, address: user.userAddress });
//                 }
//             }

//             setBanks(fetchedProviders);
//             if (fetchedProviders.length > 0) {
//                 setSelectedBankAddress(fetchedProviders[0].address);
//             }
//         } catch (err) {
//             console.error("Error fetching banks:", err);
//             showNotification('Could not fetch the list of banks.', 'error');
//         }
//     };


//     useEffect(() => {
//         // Fetch both applications and the list of banks on load
//         fetchApplications();
//         fetchBanks();
//     }, [loanMatching, userRegistry, account]);

//     const aggregateFarmerHistory = async () => {
//         if (!userRegistry || !productLedger || !loanMatching || !cropInsurance) return null;
//         const userData = await userRegistry.methods.getUser(account).call();
//         const landSize = Number(userData.landholdingSize);
//         let previousLoanCount = 0;
//         let repaidOnTime = 0;
//         const appCounter = await loanMatching.methods.applicationCounter().call();
//         for (let i = 1; i <= appCounter; i++) {
//             const app = await loanMatching.methods.applications(i).call();
//             if (app.farmer.toLowerCase() === account.toLowerCase()) {
//                 previousLoanCount++;
//                 if (Number(app.status) === 3) {
//                     repaidOnTime++;
//                 }
//             }
//         }
//         const previousLoanRepayment = previousLoanCount > 0 ? (repaidOnTime / previousLoanCount) : 0;
//         let hasActiveInsurance = false;
//         const policyCounter = await cropInsurance.methods.policyCounter().call();
//         for (let i = 1; i <= policyCounter; i++) {
//             const policy = await cropInsurance.methods.policies(i).call();
//             // ❗ FIX: Active status is 1, not 0. PendingApproval is 0.
//             if (policy.farmer.toLowerCase() === account.toLowerCase() && Number(policy.status) === 1) { // Status 1 is "Active"
//                 hasActiveInsurance = true;
//                 break;
//             }
//         }
//         return {
//             landSize: landSize,
//             insuranceStatus: hasActiveInsurance,
//             previousLoanRepaymentScore: previousLoanRepayment,
//         };
//     };

//     const handleApplyForLoan = async (e) => {
//         e.preventDefault();
//         // ❗ UPDATED: Check for selectedBankAddress
//         if (!selectedBankAddress || !loanAmount) {
//             showNotification('Please select a bank and enter a loan amount.', 'error');
//             return;
//         }
//         setFormLoading(true);
//         showNotification('Gathering your on-chain history...', 'info');

//         const historyData = await aggregateFarmerHistory();
//         if (!historyData) {
//             showNotification('Could not fetch historical data. Please try again.', 'error');
//             setFormLoading(false);
//             return;
//         }

//         const payload = {
//             farmerId: account,
//             landSize: historyData.landSize,
//             cropType: "Rice",
//             farmingMethod: "Organic",
//             isInsured: historyData.insuranceStatus,
//             farmerRating: 4,
//             previousLoanRepayment: historyData.previousLoanRepaymentScore === 1 ? "Good" : (historyData.previousLoanRepaymentScore > 0 ? "Fair" : "None"),
//         };

//         //backend call to AI for eligibility

//         showNotification('Submitting profile to AI for eligibility check...', 'info');
//         console.log("Sending payload to AI:", payload);
//         const mockAiResult = { loanEligible: "Eligible" };

//         if (mockAiResult.loanEligible === "Eligible") {
//             try {
//                 // ❗ UPDATED: Use selectedBankAddress from the dropdown
//                 await loanMatching.methods.applyForLoan(selectedBankAddress, loanAmount, 0).send({ from: account });
//                 showNotification('AI check passed! Loan application submitted on-chain.', 'success');
//                 fetchApplications(); // Refresh list
//                 setLoanAmount('');
//                 // Reset dropdown to the first bank
//                 if (banks.length > 0) {
//                     setSelectedBankAddress(banks[0].address);
//                 }
//             } catch (err) {
//                 console.error("On-chain loan application failed:", err);
//                 showNotification('AI approved, but blockchain transaction failed.', 'error');
//             }
//         } else {
//             showNotification('Sorry, you are not eligible for a loan based on the AI assessment.', 'error');
//         }
//         setFormLoading(false);
//     };

//     return (
//         <div className="space-y-8">
//             <div className="bg-white p-6 rounded-lg shadow-md">
//                 <h3 className="text-2xl font-semibold mb-4">Apply for a New Loan</h3>
//                 <form onSubmit={handleApplyForLoan} className="space-y-4">
//                     {/* ❗ REPLACED: Input field is now a dropdown select */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Select a Bank</label>
//                         <select
//                             value={selectedBankAddress}
//                             onChange={(e) => setSelectedBankAddress(e.target.value)}
//                             className="border p-2 rounded w-full bg-white"
//                             disabled={banks.length === 0}
//                         >
//                             {banks.length > 0 ? (
//                                 banks.map(bank => (
//                                     <option key={bank.address} value={bank.address}>
//                                         {bank.name}
//                                     </option>
//                                 ))
//                             ) : (
//                                 <option>No banks available</option>
//                             )}
//                         </select>
//                     </div>

//                     <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="Loan Amount (in INR)" className="border p-2 rounded w-full" />
//                     <button type="submit" disabled={formLoading} className="w-full px-4 py-2 rounded bg-purple-600 text-white disabled:bg-gray-400">
//                         {formLoading ? 'Checking Eligibility...' : 'Check Eligibility & Apply'}
//                     </button>
//                 </form>
//             </div>

//             <div>
//                 <h3 className="text-2xl font-semibold mb-4">Your Loan Applications</h3>
//                 {listLoading ? <p>Loading applications...</p> : (
//                     <div className="space-y-4">
//                         {applications.length > 0 ? applications.map(app => (
//                             <div key={app.id} className="border p-4 rounded-md bg-gray-50">
//                                 <p><strong>Application ID:</strong> {String(app.id)}</p>
//                                 <p><strong>Status:</strong> {loanStatusToString(app.status)}</p>
//                                 <p><strong>Amount:</strong> ₹{String(app.amount)}</p>
//                                 {/* ❗ UPDATED: Display bank name instead of address */}
//                                 <p className="text-sm"><strong>Bank:</strong> {app.bankName || app.bank}</p>
//                             </div>
//                         )) : <p className="text-gray-500">You have no loan applications.</p>}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default FarmerLoans;


import React, { useState, useEffect } from 'react';

const loanStatusToString = (status) => {
    const statuses = ['Pending', 'Approved', 'Disbursed', 'Repaid', 'Rejected'];
    return statuses[Number(status)] || 'Unknown';
}

const FarmerLoans = ({ loanMatching, cropInsurance, productLedger, userRegistry, account, showNotification }) => {
    // --- Form State ---
    const [selectedBankAddress, setSelectedBankAddress] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // --- State to hold the list of available banks ---
    const [banks, setBanks] = useState([]);

    // --- Application List State ---
    const [applications, setApplications] = useState([]);
    const [listLoading, setListLoading] = useState(true);

    // ✅ OPTIMIZED: This function was already well-optimized to fetch data in bulk. No changes needed.
    // const fetchApplications = async () => {
    //     if (!loanMatching || !account) return;
    //     setListLoading(true);

    //     try {
    //         // 1. Call the function that returns two parallel arrays in one go.
    //         const result = await loanMatching.methods.getApplicationsAndBankNamesByFarmer(account).call();
    //         const rawApps = result[0];
    //         const bankNames = result[1];

    //         // 2. Combine the parallel arrays into a single array of objects for easy use.
    //         const combinedApps = rawApps.map((app, index) => ({
    //             ...app,
    //             bankName: bankNames[index]
    //         }));

    //         // 3. Set the combined data into state (reversing for chronological order).
    //         setApplications([...combinedApps].reverse());

    //     } catch (err) {
    //         console.error("Error fetching loan applications:", err);
    //         showNotification("Error fetching loan applications", "error");
    //     } finally {
    //         setListLoading(false);
    //     }
    // };

    const fetchApplications = async () => {
    if (!loanMatching || !account) return;
    setListLoading(true);

    try {
        // 1. ✅ The contract returns a SINGLE array of view objects.
        const applicationViews = await loanMatching.methods.getApplicationsAndBankNamesByFarmer(account).call();

        // 2. ✅ Map this single array to flatten the structure for your state.
        // The 'application' object is nested inside each 'view' object.
        const combinedApps = applicationViews.map(view => ({
            ...view.application, // Spread the nested application data
            bankName: view.bankName    // Add the bank name
        }));

        // 3. Set the combined data into state.
        setApplications([...combinedApps].reverse());

    } catch (err) {
        console.error("Error fetching loan applications:", err);
        showNotification("Error fetching loan applications", "error");
    } finally {
        setListLoading(false);
    }
};
    
    // ✅ OPTIMIZED: Replaced the inefficient looping with two efficient contract calls.
    const fetchBanks = async () => {
        if (!userRegistry) return;
        try {
            // STEP 1: Get all registered bank addresses in a single call.
            const bankAddresses = await userRegistry.methods.getBankAddresses().call();

            if (bankAddresses.length > 0) {
                // STEP 2: Get all User structs for those addresses in a second single call.
                const bankUsers = await userRegistry.methods.getUsersByAddresses(bankAddresses).call();

                // STEP 3: Map the results into the format needed for the dropdown (no more blockchain calls).
                const fetchedBanks = bankUsers.map(user => ({
                    name: user.name,
                    address: user.userAddress
                }));
                
                setBanks(fetchedBanks);
                // Set a default selection
                if (fetchedBanks.length > 0) {
                    setSelectedBankAddress(fetchedBanks[0].address);
                }
            }
        } catch (err) {
            console.error("Error fetching banks:", err);
            showNotification('Could not fetch the list of banks.', 'error');
        }
    };


    useEffect(() => {
        // Fetch both applications and the list of banks on load
        fetchApplications();
        fetchBanks();
    }, [loanMatching, userRegistry, account]);

    // ✅ OPTIMIZED: Replaced both for-loops with single, efficient bulk-fetch calls.
    // const aggregateFarmerHistory = async () => {
    //     if (!userRegistry || !loanMatching || !cropInsurance) return null;
        
    //     // --- Get User Data and Loan History Concurrently ---
    //     const [userData, loanResult] = await Promise.all([
    //         userRegistry.methods.getUser(account).call(),
    //         loanMatching.methods.getApplicationsAndBankNamesByFarmer(account).call()
    //     ]);

    //     const landSize = Number(userData.landholdingSize);
    //     const farmerLoans = loanResult[0]; // Get the array of LoanApplication structs

    //     // Process loan history in JavaScript (fast)
    //     const previousLoanCount = farmerLoans.length;
    //     const repaidOnTime = farmerLoans.filter(app => Number(app.status) === 3).length; // 3: Repaid
    //     const previousLoanRepayment = previousLoanCount > 0 ? (repaidOnTime / previousLoanCount) : 0;

    //     // --- Get Insurance History ---
    //     const farmerPolicies = await cropInsurance.methods.getPoliciesByFarmer(account).call();

    //     // Check for active insurance in JavaScript (fast)
    //     const hasActiveInsurance = farmerPolicies.some(policy => Number(policy.status) === 1); // 1: Active
        
    //     return {
    //         landSize: landSize,
    //         insuranceStatus: hasActiveInsurance,
    //         previousLoanRepaymentScore: previousLoanRepayment,
    //     };
    // };

    const aggregateFarmerHistory = async () => {
    if (!userRegistry || !loanMatching || !cropInsurance) return null;
    
    // --- Get User Data and Loan History Concurrently ---
    const [userData, loanResult] = await Promise.all([
        userRegistry.methods.getUser(account).call(),
        loanMatching.methods.getApplicationsAndBankNamesByFarmer(account).call()
    ]);

    const landSize = Number(userData.landholdingSize);
    
    // ✅ FIX: loanResult is the entire array of loan applications.
    const farmerLoans = loanResult; 

    // Process loan history in JavaScript (fast)
    // This line will now work correctly
    const previousLoanCount = farmerLoans.length; 
    const repaidOnTime = farmerLoans.filter(app => Number(app.application.status) === 3).length; // 3: Repaid
    const previousLoanRepayment = previousLoanCount > 0 ? (repaidOnTime / previousLoanCount) : 0;

    // --- Get Insurance History ---
    const farmerPolicies = await cropInsurance.methods.getPoliciesByFarmer(account).call();

    // Check for active insurance in JavaScript (fast)
    const hasActiveInsurance = farmerPolicies.some(policy => Number(policy.status) === 1); // 1: Active
    
    return {
        landSize: landSize,
        insuranceStatus: hasActiveInsurance,
        previousLoanRepaymentScore: previousLoanRepayment,
    };
};

    const handleApplyForLoan = async (e) => {
        e.preventDefault();
        if (!selectedBankAddress || !loanAmount) {
            showNotification('Please select a bank and enter a loan amount.', 'error');
            return;
        }
        setFormLoading(true);
        showNotification('Gathering your on-chain history...', 'info');

        try {
            const historyData = await aggregateFarmerHistory();

            if (!historyData) {
                showNotification('Could not fetch historical data. Please try again.', 'error');
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
                previousLoanRepayment: historyData.previousLoanRepaymentScore === 1 ? "Good" : (historyData.previousLoanRepaymentScore > 0 ? "Fair" : "None"),
            };

            showNotification('Submitting profile to AI for eligibility check...', 'info');
            console.log("Sending payload to AI:", payload);
            const mockAiResult = { loanEligible: "Eligible" }; // Mock AI call

            if (mockAiResult.loanEligible === "Eligible") {
                await loanMatching.methods.applyForLoan(selectedBankAddress, loanAmount, 0).send({ from: account });
                showNotification('AI check passed! Loan application submitted on-chain.', 'success');
                fetchApplications(); // Refresh list
                setLoanAmount('');
                if (banks.length > 0) {
                    setSelectedBankAddress(banks[0].address);
                }
            } else {
                showNotification('Sorry, you are not eligible for a loan based on the AI assessment.', 'error');
            }
        } catch (err) {
            console.error("Loan application process failed:", err);
            showNotification('An error occurred during the application process.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-4">Apply for a New Loan</h3>
                <form onSubmit={handleApplyForLoan} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select a Bank</label>
                        <select
                            value={selectedBankAddress}
                            onChange={(e) => setSelectedBankAddress(e.target.value)}
                            className="border p-2 rounded w-full bg-white"
                            disabled={banks.length === 0}
                        >
                            {banks.length > 0 ? (
                                banks.map(bank => (
                                    <option key={bank.address} value={bank.address}>
                                        {bank.name}
                                    </option>
                                ))
                            ) : (
                                <option>Loading banks...</option>
                            )}
                        </select>
                    </div>

                    <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="Loan Amount (in INR)" className="border p-2 rounded w-full" />
                    <button type="submit" disabled={formLoading} className="w-full px-4 py-2 rounded bg-purple-600 text-white disabled:bg-gray-400">
                        {formLoading ? 'Checking Eligibility...' : 'Check Eligibility & Apply'}
                    </button>
                </form>
            </div>

            <div>
                <h3 className="text-2xl font-semibold mb-4">Your Loan Applications</h3>
                {listLoading ? <p>Loading applications...</p> : (
                    <div className="space-y-4">
                        {applications.length > 0 ? applications.map(app => (
                            <div key={app.id} className="border p-4 rounded-md bg-gray-50">
                                <p><strong>Application ID:</strong> {String(app.id)}</p>
                                <p><strong>Status:</strong> {loanStatusToString(app.status)}</p>
                                <p><strong>Amount:</strong> ₹{String(app.amount)}</p>
                                <p className="text-sm"><strong>Bank:</strong> {app.bankName || app.bank}</p>
                            </div>
                        )) : <p className="text-gray-500">You have no loan applications.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerLoans;