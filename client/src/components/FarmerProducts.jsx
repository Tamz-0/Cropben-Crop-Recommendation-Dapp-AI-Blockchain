// import React, { useState, useEffect } from 'react';

// // Helper to convert enum index to string
// const stageToString = (stage) => {
//     const stages = ['Harvested', 'InTransit', 'AtVendor', 'Sold'];
//     return stages[Number(stage)] || 'Unknown';
// };

// const FarmerProducts = ({ productLedger, account, showNotification }) => {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(false);

//     // Function to fetch all products from the contract
//     const fetchProducts = async () => {
//         if (!productLedger) return;
//         setLoading(true);
//         try {
//             const productCounter = await productLedger.methods.productCounter().call();
//             const fetchedProducts = [];
//             for (let i = 1; i <= productCounter; i++) {
//                 const p = await productLedger.methods.getProductDetails(i).call();
//                 fetchedProducts.push(p);
//             }
//             setProducts(fetchedProducts);
//         } catch (err) {
//             console.error("Error fetching products:", err);
//             showNotification('Could not fetch product list.', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fetch products on component mount and when the contract object changes
//     useEffect(() => {
//         fetchProducts();
//     }, [productLedger]);

//     // Handler for the "Ship Product" button
//     const handleShipProduct = async (productId) => {
//         try {
//             await productLedger.methods.updateStageToTransit(productId).send({ from: account });
//             showNotification(`Product #${productId} is now in transit! 🚚`, 'success');
//             fetchProducts(); // Refresh the list to show the updated stage
//         } catch (err) {
//             console.error("Error shipping product:", err);
//             showNotification('Failed to update product stage.', 'error');
//         }
//     };

//     if (loading) return <p>Loading products...</p>;

//     return (
//         <div className="mt-8">
//             <h3 className="text-2xl font-semibold mb-4">Your Products</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {products.map((product) => (
//                     // Only show products owned by the current user (farmer)
//                     product.farmer === account && (
//                         <div key={product.id} className="bg-gray-100 p-4 rounded-lg shadow">
//                             <p><strong>ID:</strong> {Number(product.id)}</p>
//                             <p><strong>Name:</strong> {product.name}</p>
//                             <p><strong>Stage:</strong> <span className="font-bold">{stageToString(product.stage)}</span></p>
//                             <p><strong>Owner:</strong> {product.currentOwner.substring(0, 8)}...</p>
                            
//                             {/* --- THIS IS THE CRUCIAL PART --- */}
//                             {/* Show button only if the product is Harvested and owned by the farmer */}
//                             {Number(product.stage) === 0 && product.currentOwner === account && (
//                                 <button
//                                     onClick={() => handleShipProduct(product.id)}
//                                     className="mt-4 px-4 py-2 rounded bg-orange-500 text-white w-full"
//                                 >
//                                     Ship Product
//                                 </button>
//                             )}
//                         </div>
//                     )
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default FarmerProducts;


// src/components/FarmerProducts.jsx

// import React from 'react';

// const stageToString = (stage) => {
//     const stages = ['Harvested', 'InTransit', 'AtVendor', 'Sold'];
//     return stages[Number(stage)] || 'Unknown';
// };

// const FarmerProducts = ({ products, loading, account, productLedger, onProductUpdate, showNotification }) => {

//     const handleShipProduct = async (productId) => {
//         try {
//             await productLedger.methods.updateStageToTransit(productId).send({ from: account });
//             showNotification(`Product #${productId} is now in transit! 🚚`, 'success');
//             onProductUpdate(); // Call the parent's fetch function to refresh
//         } catch (err) {
//             console.error("Error shipping product:", err);
//             showNotification('Failed to update product stage.', 'error');
//         }
//     };

//     if (loading) return <p className="mt-8 text-center">Loading your products...</p>;

//     // Filter products for the current farmer, comparing addresses safely
//     const farmerProducts = products.filter(p => p.farmer.toLowerCase() === account.toLowerCase());

//     if (farmerProducts.length === 0) {
//         return (
//             <div className="mt-8">
//                 <h3 className="text-2xl font-semibold mb-4">Your Products</h3>
//                 <p className="text-gray-500">You have not added any products yet. Use the form above to get started.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="mt-8">
//             <h3 className="text-2xl font-semibold mb-4">Your Products</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {farmerProducts.map((product) => (
//                     <div key={product.id} className="bg-gray-100 p-4 rounded-lg shadow">
//                         <p><strong>ID:</strong> {Number(product.id)}</p>
//                         <p><strong>Name:</strong> {product.name}</p>
//                         <p><strong>Stage:</strong> <span className="font-bold">{stageToString(product.stage)}</span></p>
//                         <p><strong>Owner:</strong> {product.currentOwner.substring(0, 8)}...</p>

//                         {/* Button is only shown for products at the 'Harvested' stage */}
//                         {Number(product.stage) === 0 && (
//                             <button
//                                 onClick={() => handleShipProduct(product.id)}
//                                 className="mt-4 px-4 py-2 rounded bg-orange-500 text-white w-full"
//                             >
//                                 Ship Product
//                             </button>
//                         )}
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default FarmerProducts;




import { useState, useEffect } from 'react';
// import { QRCode } from 'qrcode.react';
import { QRCodeCanvas } from "qrcode.react"; 

// A helper function to format the product stage
const stageToString = (stage) => {
    const stages = ['Sown', 'Harvested', 'In Transit', 'At Vendor', 'Sold'];
    return stages[Number(stage)] || 'Unknown';
};

// ❗ Pass the `userRegistry` contract instance as a prop
const FarmerProducts = ({ productLedger, cropInsurance, account, userRegistry, showNotification, refreshTrigger }) => {
    // --- Form State ---
    const [productName, setProductName] = useState('');
    const [practice, setPractice] = useState(0);
    const [location, setLocation] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('kg');
    const [formLoading, setFormLoading] = useState(false);

    // --- Product List State ---
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    // --- State for Insurance Quote Modal ---
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [selectedProductForQuote, setSelectedProductForQuote] = useState(null);

    // 🆕 --- State for Insurance Provider Selection ---
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
    const [insuranceProviders, setInsuranceProviders] = useState([]);
    const [selectedProviderAddress, setSelectedProviderAddress] = useState('');

    // 🆕 --- State for Transfer to Vendor Modal ---
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [productToTransfer, setProductToTransfer] = useState(null);
    const [vendorAddress, setVendorAddress] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);
    const [salePrice, setSalePrice] = useState(''); // 🆕 ADD STATE FOR PRICE

    //ADD NEW STATE to manage the QR code modal
    const [qrCodeProductId, setQrCodeProductId] = useState(null);


    // --- Fetch Products Logic ---
    // const fetchProducts = async () => {
    //     if (!productLedger) return;
    //     setProductsLoading(true);
    //     try {
    //         // const productCounter = await productLedger.methods.productCounter().call();
    //         // const fetchedProducts = [];
    //         // for (let i = productCounter; i >= 1; i--) {
    //         //     const p = await productLedger.methods.getProductDetails(i).call();
    //         //     if (p.farmer.toLowerCase() === account.toLowerCase()) {
    //         //         fetchedProducts.push(p);
    //         //     }
    //         // }
    //         // setProducts(fetchedProducts);

    //         // 1. Get all product IDs for the current farmer in one call.
    //         const productIds = await productLedger.methods.getProductIdsByFarmer(account).call();
            
    //         if (productIds.length > 0) {
    //             // 2. Get details for ALL products in a single second call.
    //             const fetchedProducts = await productLedger.methods.getProductsByIds(productIds).call();
    //             setProducts(fetchedProducts.slice().reverse()); // Use slice() to avoid mutating the original array
    //         } else {
    //             setProducts([]); // Handle case where there are no products
    //         }
    //     } catch (err) {
    //         console.error("Error fetching farmer products:", err);
    //         showNotification('Could not fetch your product list.', 'error');
    //     } finally {
    //         setProductsLoading(false);
    //     }
    // };

    // const fetchProducts = async () => {
    //     if (!productLedger || !account) return;
    //     setProductsLoading(true);
    //     try {
    //         // ✅ --- OPTIMIZATION ---
    //         // 1. Get all product IDs for the current farmer in one call.
    //         const productIds = await productLedger.methods.getProductIdsByFarmer(account).call();
            
    //         if (productIds && productIds.length > 0) {
    //             // 2. Get details for ALL of those products in a single second call.
    //             const [cores, metadata] = await productLedger.methods.getProductsByIds(productIds).call();

    //             // 3. Combine the results
    //             const fetchedProducts = cores.map((core, index) => ({
    //                 ...core,
    //                 ...metadata[index]
    //             }));

    //             // Show newest products first
    //             setProducts(fetchedProducts.reverse());
    //         } else {
    //             setProducts([]); // Handle case where farmer has no products
    //         }
    //     } catch (err) {
    //         console.error("Error fetching farmer products:", err);
    //         showNotification('Could not fetch your product list.', 'error');
    //     } finally {
    //         setProductsLoading(false);
    //     }
    // };

    const fetchProducts = async () => {
    if (!productLedger || !account) return;
    setProductsLoading(true);
    try {
        // 1. Get all product IDs for the current farmer in one call.
        const productIds = await productLedger.methods.getProductIdsByFarmer(account).call();
        
        if (productIds && productIds.length > 0) {
            // ✅ --- FIX: Handle the object returned by web3.js ---
            // The call returns an object with numeric keys, not a direct array.
            const productData = await productLedger.methods.getProductsByIds(productIds).call();
            const cores = productData[0];     // Access the first returned array
            const metadata = productData[1];  // Access the second returned array

            // 3. Combine the results (This part remains the same)
            const fetchedProducts = cores.map((core, index) => ({
                ...core,
                ...metadata[index]
            }));

            // Show newest products first
            setProducts(fetchedProducts.reverse());
        } else {
            setProducts([]); // Handle case where farmer has no products
        }
    } catch (err) {
        console.error("Error fetching farmer products:", err);
        showNotification('Could not fetch your product list.', 'error');
    } finally {
        setProductsLoading(false);
    }
};

    // 🆕 --- Fetch Insurance Providers Logic from the UserRegistry contract ---
    const fetchInsuranceProviders = async () => {
    if (!userRegistry){
        console.warn("UserRegistry contract not available.");
        return;
    }
    try {
        // const allUserAddresses = [];
        // let index = 0;
        // console.log("Fetching insurance providers from UserRegistry...");
        // // Loop indefinitely until the contract call fails
        // while (true) {
        //     try {
        //         // Fetch one address at a time by its index
        //         const address = await userRegistry.methods.userAddresses(index).call();
        //         allUserAddresses.push(address);
        //         index++;
        //     } catch (e) {
        //         // An error means the index is out of bounds; we're done.
        //         break;
        //     }
        // }
        // console.log("All user addresses:", allUserAddresses.length);
        // const fetchedProviders = [];
        // for (const address of allUserAddresses) {
        //     const user = await userRegistry.methods.users(address).call();
        //     // UserRole Enum in Solidity: Insurance is 5
        //     console.log("user:", user.role);
        //     if (Number(user.role) === 5) {
        //         fetchedProviders.push({ name: user.name, address: user.userAddress });
        //     }
        // }

        // setInsuranceProviders(fetchedProviders);
        // if (fetchedProviders.length > 0) {
        //     setSelectedProviderAddress(fetchedProviders[0].address);
        // }

        // 1. Get all insurer addresses in a single call.
        const providerAddresses = await userRegistry.methods.getInsuranceProviderAddresses().call();

        if (providerAddresses.length > 0) {
          // 2. Get details for ALL providers in a single second call using the existing batch function.
          const fetchedProvidersData = await userRegistry.methods
            .getUsersByAddresses(providerAddresses)
            .call();

          // Format the data as needed by the frontend
          const fetchedProviders = fetchedProvidersData.map((user) => ({
            name: user.name,
            address: user.userAddress,
          }));

          setInsuranceProviders(fetchedProviders);
          if (fetchedProviders.length > 0) {
            setSelectedProviderAddress(fetchedProviders[0].address);
          }
        } else {
          setInsuranceProviders([]);
        }
    } catch (err) {
        console.error("Error fetching insurance providers:", err);
        showNotification('Could not fetch list of insurers.', 'error');
    }
};

    useEffect(() => {
        // Fetch both products and insurance providers on component load
        fetchProducts();
        fetchInsuranceProviders();
    }, [productLedger, userRegistry, account, refreshTrigger]); // Add userRegistry to dependency array

    // --- Handler Functions ---
    const handleLogSownProduct = async (e) => {
        e.preventDefault();
        if (!productName || !location || !quantity || !unit) {
            showNotification('Please fill all fields.', 'error');
            return;
        }
        setFormLoading(true);
        try {
            await productLedger.methods.addSownProduct(
                productName, practice, location, quantity, unit
            ).send({ from: account });
            showNotification('Sown product logged successfully! 🌱', 'success');
            setProductName(''); setLocation(''); setQuantity('');
            fetchProducts();
        } catch (err) {
            console.error('Error logging sown product:', err);
            showNotification('Failed to log product.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleHarvest = async (productId) => {
        try {
            await productLedger.methods.updateToHarvested(productId).send({ from: account });
            showNotification(`Product #${productId} marked as Harvested! 🌾`, 'success');
            fetchProducts();
        } catch (err) {
            console.error("Error harvesting product:", err);
            showNotification('Failed to update stage to Harvested.', 'error');
        }
    };

    // 🆕 --- Open the modal to transfer ownership to a vendor ---
    const openTransferModal = (product) => {
        setProductToTransfer(product);
        setIsTransferModalOpen(true);
        setVendorAddress(''); // Reset input field
        setSalePrice(''); // 🆕 Reset price field
    };

    // 🆕 --- Handler to execute the transfer on the blockchain ---
    // const handleTransferToVendor = async () => {
    //     if (!productToTransfer || !vendorAddress) {
    //         showNotification('Please enter a valid vendor address.', 'error');
    //         return;
    //     }
    //     setTransferLoading(true);
    //     try {
    //         // Call the contract function with BOTH parameters
    //         await productLedger.methods.updateStageToVendor(
    //             productToTransfer.id,
    //             vendorAddress
    //         ).send({ from: account });

    //         showNotification(`Product #${productToTransfer.id} transferred successfully! 🚚`, 'success');
    //         setIsTransferModalOpen(false);
    //         setProductToTransfer(null);
    //         fetchProducts(); // Refresh the product list
    //     } catch (err) {
    //         console.error("Error transferring product:", err);
    //         showNotification('Failed to transfer product. Check the address and permissions.', 'error');
    //     } finally {
    //         setTransferLoading(false);
    //     }
    // };

    // const handleTransferToVendor = async () => {
    //     if (!productToTransfer || !vendorAddress) {
    //         showNotification('Please enter a valid vendor address.', 'error');
    //         return;
    //     }
    //     setTransferLoading(true);
    //     try {
    //         // ❗ Only this function call needs to be updated to the new name
    //         await productLedger.methods.transferProductToVendor(
    //             productToTransfer.id,
    //             vendorAddress
    //         ).send({ from: account });

    //         showNotification(`Transfer initiated for Product #${productToTransfer.id}! 🚚`, 'success');
    //         setIsTransferModalOpen(false);
    //         setProductToTransfer(null);
    //         fetchProducts(); // Refresh the product list
    //     } catch (err) {
    //         console.error("Error initiating transfer:", err);
    //         showNotification('Failed to initiate transfer. Check the address and permissions.', 'error');
    //     } finally {
    //         setTransferLoading(false);
    //     }
    // };

    // ❗ --- MODIFIED: Handler to execute the transfer on the blockchain ---
    const handleTransferToVendor = async () => {
        // 🆕 Add price validation
        if (!productToTransfer || !vendorAddress || !salePrice || Number(salePrice) <= 0) {
            showNotification('Please enter a valid vendor address and a sale price greater than zero.', 'error');
            return;
        }
        setTransferLoading(true);
        try {
            // ❗ Pass the new price argument
            await productLedger.methods.transferProductToVendor(
                productToTransfer.id,
                vendorAddress,
                salePrice // 🆕 Pass price
            ).send({ from: account });

            showNotification(`Transfer initiated for Product #${productToTransfer.id}! 🚚`, 'success');
            setIsTransferModalOpen(false);
            setProductToTransfer(null);
            fetchProducts(); // Refresh the product list
        } catch (err) {
            console.error("Error initiating transfer:", err);
            showNotification('Failed to initiate transfer. Check the address and permissions.', 'error');
        } finally {
            setTransferLoading(false);
        }
    };

    // 🆕 --- Step 1: Open the modal to select a provider ---
    const openProviderSelectionModal = (product) => {
        setSelectedProductForQuote(product);
        setIsProviderModalOpen(true);
    };

    // 🆕 --- Step 2: After provider is selected, get the quote from the AI backend ---
    const handleGetQuote = async () => {
        if (!selectedProductForQuote || !selectedProviderAddress) {
            showNotification('Please select a product and an insurance provider.', 'error');
            return;
        }
        setIsProviderModalOpen(false); // Close the selection modal
        setQuoteLoading(true);
        showNotification(`Getting insurance quote for Product #${selectedProductForQuote.id}...`, 'info');

        try {
            const url = "http://localhost:8000/api/insurance/score";
            const providerDetails = insuranceProviders.find(p => p.address === selectedProviderAddress);
            const payload = {
                cropType: selectedProductForQuote.name,
                areaHa: 50 / 1000,
                farmingMethod: Number(selectedProductForQuote.practice) === 1 ? "Organic" : "Inorganic",
                district: selectedProductForQuote.location,
                // farmerRating: 4,
                toolsOwned: 12,
                // insuranceStatus: 0
            };
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Network response was not ok");

            const quoteResult = await response.json();
            console.log("Received quote:", quoteResult);
            // Store the selected provider's details along with the quote
            quoteResult.providerName = providerDetails ? providerDetails.name : "Unknown Provider";
            quoteResult.providerAddress = selectedProviderAddress;

            setCurrentQuote(quoteResult);
            setIsQuoteModalOpen(true); // Open the quote display modal
        } catch (err) {
            console.error("Error getting insurance quote:", err);
            showNotification('Failed to get insurance quote from the server.', 'error');
        } finally {
            setQuoteLoading(false);
        }
    };

    // ❗ --- Step 3: Accept the quote, using the address selected in Step 1 ---
    const handleAcceptQuote = async () => {
        if (!cropInsurance || !currentQuote || !currentQuote.providerAddress || !selectedProductForQuote) {
            showNotification('Error: Missing required data to accept the quote.', 'error');
            return;
        }
        // The address is no longer hardcoded; it comes from the state saved earlier
        const insuranceProviderAddress = currentQuote.providerAddress;
        showNotification(`Submitting your policy request to the blockchain...`, 'info');
        try {
            await cropInsurance.methods.requestPolicy(
                selectedProductForQuote.id,
                0,
                currentQuote.premiumWei,
                insuranceProviderAddress
            ).send({ from: account });
            showNotification('Policy request submitted! Awaiting insurer approval.', 'success');
            setIsQuoteModalOpen(false);
            setCurrentQuote(null);
        } catch (err) {
            console.error("Error requesting policy:", err);
            showNotification('Failed to submit policy request.', 'error');
        }
    };

    return (
        <div className="space-y-8">
            {/* --- Form Section (No changes here) --- */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-4">Log New Sown Product</h3>
                <form onSubmit={handleLogSownProduct} className="space-y-4">
                    <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Crop Name (e.g., Ponni Rice)" className="border p-2 rounded w-full" />
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Farm Location (e.g., Katpadi, Vellore)" className="border p-2 rounded w-full" />
                    <div className="flex gap-4">
                        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Estimated Quantity" className="border p-2 rounded w-full" />
                        <select value={unit} onChange={(e) => setUnit(e.target.value)} className="border p-2 rounded bg-gray-50">
                            <option value="kg">kg</option>
                            <option value="tonnes">tonnes</option>
                        </select>
                    </div>
                    <select value={practice} onChange={(e) => setPractice(Number(e.target.value))} className="border p-2 rounded w-full bg-white">
                        <option value={0}>Inorganic</option>
                        <option value={1}>Organic</option>
                    </select>
                    <button type="submit" disabled={formLoading} className="w-full px-4 py-2 rounded bg-green-600 text-white disabled:bg-gray-400">
                        {formLoading ? "Processing..." : "Log Sown Product"}
                    </button>
                </form>
            </div>

            {/* --- Product List Section --- */}
            <div>
                <h3 className="text-2xl font-semibold mb-4">Your On-Chain Products</h3>
                {productsLoading ? <p>Loading products...</p> : (
                    products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.map((p) => (
                                <div key={p.id} className="bg-gray-50 p-4 rounded-lg shadow space-y-2">
                                    <p className="font-bold text-lg">{p.name} <span className="font-mono text-sm text-gray-500">(ID: {String(p.id)})</span></p>
                                    <p><strong>Stage:</strong> {stageToString(p.stage)}</p>
                                    <p><strong>Quantity:</strong> {String(p.quantity)} {p.unit}</p>
                                    {/* {Number(p.stage) === 0 && (
                                        <div className="pt-2 space-y-2">
                                            <button onClick={() => handleHarvest(p.id)} className="w-full px-4 py-2 rounded bg-yellow-500 text-white">Mark as Harvested</button> */}
                                            {/* ❗ MODIFIED BUTTON: This now opens the provider selection modal */}
                                            {/* <button
                                                onClick={() => openProviderSelectionModal(p)}
                                                className="w-full px-4 py-2 rounded bg-blue-500 text-white"
                                                disabled={quoteLoading && selectedProductForQuote?.id === p.id}
                                            >
                                                {quoteLoading && selectedProductForQuote?.id === p.id ? 'Loading...' : 'Get Insurance Quote'}
                                            </button>
                                        </div>
                                    )} */}

                                    {/* --- Actions for SOWN stage (Stage 0) --- */}
                                    {Number(p.stage) === 0 && (
                                        <div className="pt-2 space-y-2">
                                            <button onClick={() => handleHarvest(p.id)} className="w-full px-4 py-2 rounded bg-yellow-500 text-white">Mark as Harvested</button>
                                            <button onClick={() => openProviderSelectionModal(p)} className="w-full px-4 py-2 rounded bg-blue-500 text-white" disabled={quoteLoading && selectedProductForQuote?.id === p.id}>
                                                {quoteLoading && selectedProductForQuote?.id === p.id ? 'Loading...' : 'Get Insurance Quote'}
                                            </button>
                                        </div>
                                    )}

                                    {/* ❗ --- NEW ACTION for HARVESTED stage (Stage 1) --- */}
                                    {Number(p.stage) === 1 && (
                                        <div className="pt-2">
                                            <button onClick={() => openTransferModal(p)} className="w-full px-4 py-2 rounded bg-teal-500 text-white">
                                                Transfer to Vendor
                                            </button>
                                        </div>
                                    )}
                                    {/* 3. ADD THE NEW QR CODE BUTTON */}
                                        <button 
                                            onClick={() => setQrCodeProductId(p.id)}
                                            className="w-full px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800 transition"
                                        >
                                            Generate QR Code
                                        </button>
                                </div>
                            ))}
                        </div>
                    ) : ( <p className="text-gray-500">You haven't logged any products yet.</p> )
                )}
            </div>

            {/* 🆕 --- Transfer to Vendor Modal --- */}
            {isTransferModalOpen && (
                <div className="fixed inset-0 bg-opacity-80 flex justify-center items-center backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-2">Transfer Product to Vendor</h3>
                        <p className="mb-4 text-gray-600">Enter the vendor's Ethereum address to transfer ownership of <strong>{productToTransfer?.name}</strong> (ID: {String(productToTransfer?.id)}).</p>
                        <input
                            value={vendorAddress}
                            onChange={(e) => setVendorAddress(e.target.value)}
                            placeholder="0x..."
                            className="border p-2 rounded w-full font-mono"
                        />
                        {/* 🆕 ADD PRICE INPUT */}
                        <input
                            type="number"
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            placeholder="Sale Price (in INR)"
                            className="border p-2 rounded w-full"
                        />
                        <div className="mt-6 flex justify-end space-x-4">
                            <button onClick={() => setIsTransferModalOpen(false)} className="px-4 py-2 rounded text-gray-700 bg-gray-200">Cancel</button>
                            <button onClick={handleTransferToVendor} disabled={!vendorAddress || transferLoading} className="px-4 py-2 rounded text-white bg-teal-600 disabled:bg-gray-400">
                                {transferLoading ? 'Processing...' : 'Confirm Transfer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🆕 --- Insurance Provider Selection Modal --- */}
            {isProviderModalOpen && (
                <div className="fixed inset-0 bg-opacity-80 flex justify-center items-center backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-2">Select Insurance Provider</h3>
                        <p className="mb-4 text-gray-600">Choose a company to get a quote for your {selectedProductForQuote?.name}.</p>
                        <div className="space-y-4">
                            <select value={selectedProviderAddress} onChange={(e) => setSelectedProviderAddress(e.target.value)} className="border p-2 rounded w-full bg-white">
                                {insuranceProviders.length > 0 ? (
                                    insuranceProviders.map(provider => (
                                        <option key={provider.address} value={provider.address}>
                                            {provider.name}
                                        </option>
                                    ))
                                ) : ( <option disabled>No registered insurance providers found</option> )}
                            </select>
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button onClick={() => setIsProviderModalOpen(false)} className="px-4 py-2 rounded text-gray-700 bg-gray-200">Cancel</button>
                            <button onClick={handleGetQuote} disabled={!selectedProviderAddress || quoteLoading} className="px-4 py-2 rounded text-white bg-blue-600 disabled:bg-gray-400">
                                {quoteLoading ? 'Getting Quote...' : 'Get Quote'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Insurance Quote Display Modal (Original Modal) --- */}
            {isQuoteModalOpen && currentQuote && (
                <div className="fixed inset-0 bg-opacity-80 flex justify-center items-center backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-2">Insurance Quote Received</h3>
                        <p className="mb-4 text-gray-600">Review the offer for your {selectedProductForQuote?.name} (ID: {String(selectedProductForQuote?.id)}).</p>
                        <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                            <p><strong>Insurance Provider:</strong> {currentQuote.providerName}</p>
                            <p><strong>Annual Premium:</strong> <span className="font-semibold text-red-600">₹{currentQuote.premiumWei}</span></p>
                            <p><strong>Sum Insured (Coverage):</strong> <span className="font-semibold text-green-600">₹{currentQuote.sumInsured || 0}</span></p>
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button onClick={() => setIsQuoteModalOpen(false)} className="px-4 py-2 rounded text-gray-700 bg-gray-200">Decline</button>
                            <button onClick={handleAcceptQuote} className="px-4 py-2 rounded text-white bg-blue-600">Accept & Request Policy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. ADD THE NEW QR CODE MODAL */}
            {qrCodeProductId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                        <h3 className="text-xl font-bold mb-4">QR Code for Product #{qrCodeProductId}</h3>
                        <div className="p-4 border inline-block">
                           <QRCodeCanvas 
                                value={`${window.location.origin}/product/${qrCodeProductId}`} 
                                size={256} 
                           />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Scan this code to view public product details.</p>
                        <button 
                            onClick={() => setQrCodeProductId(null)} 
                            className="mt-4 px-6 py-2 rounded text-white bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerProducts;