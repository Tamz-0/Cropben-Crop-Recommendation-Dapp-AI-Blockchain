// import React, { useState } from 'react';

// const FarmerDashboard = ({ productLedger, account, showNotification }) => {
//   const [productName, setProductName] = useState('');
//   const [farmingPractice, setFarmingPractice] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleRegisterProduct = async () => {
//     if (!productName) {
//       showNotification('Enter product name.', 'error');
//       return;
//     }
//     setLoading(true);
//     try {
//       if (productLedger && productLedger.methods) {
//         // await productLedger.methods.registerProduct(productName, farmingPractice).send({ from: account });
//         await productLedger.methods.addProduct(
//           productName,
//           farmingPractice === "Organic" ? 1 : 0 // enum: 0=Conventional, 1=Organic
//         ).send({ from: account });

//         showNotification('Product registered on-chain.', 'success');
//       } else {
//         console.log(`Simulated register: ${productName}, ${farmingPractice}`);
//         showNotification('Product simulated as registered (no contract).', 'success');
//       }
//       setProductName('');
//       setFarmingPractice('');
//     } catch (err) {
//       console.error('Error registering product:', err);
//       showNotification('Failed to register product.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-semibold mb-4">Farmer Dashboard</h2>
//       <div className="mb-4">
//         <input
//           value={productName}
//           onChange={e => setProductName(e.target.value)}
//           placeholder="Product name"
//           className="border p-2 rounded w-64"
//         />
//       </div>
//       <div className="mb-4">
//         <input
//           value={farmingPractice}
//           onChange={e => setFarmingPractice(e.target.value)}
//           placeholder="Farming practice (e.g. Organic)"
//           className="border p-2 rounded w-64"
//         />
//       </div>
//       <button onClick={handleRegisterProduct} className="px-4 py-2 rounded bg-green-600 text-white">
//         {loading ? 'Registering...' : 'Register Product'}
//       </button>
//     </div>
//   );
// };

// export default FarmerDashboard;


// src/components/FarmerDashboard.jsx

// import React, { useState } from 'react';
// import FarmerProducts from '../components/FarmerProducts';


// const FarmerDashboard = ({ productLedger, account, showNotification }) => {
//   const [productName, setProductName] = useState('');
//   const [practice, setPractice] = useState(0); // 0 for Conventional, 1 for Organic
//   const [loading, setLoading] = useState(false);
//   const [location, setLocation] = useState('');

//   const handleFetchLocation = () => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition((position) => {
//                 const { latitude, longitude } = position.coords;
//                 setLocation(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
//                 showNotification('Location fetched!', 'success');
//             }, () => {
//                 showNotification('Could not get location. Please enter it manually.', 'error');
//             });
//         } else {
//             showNotification('Geolocation is not supported by this browser.', 'error');
//         }
//     };

//   const handleAddProduct = async (e) => {
//     e.preventDefault();
//     if (!productName || !location) {
//       showNotification('Please enter a product name.', 'error');
//       return;
//     }
//     setLoading(true);
//     try {
//       await productLedger.methods.addProduct(productName, practice,location).send({ from: account });
//       showNotification('Product added successfully!', 'success');
//       setProductName(''); // Reset form
//       // The product list will update automatically
//     } catch (err) {
//       console.error('Error adding product:', err);
//       showNotification('Failed to add product.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <h3 className="text-2xl font-semibold mb-4">Register New Product</h3>
//         <form onSubmit={handleAddProduct}>
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2">Product Name</label>
//             <input
//               value={productName}
//               onChange={(e) => setProductName(e.target.value)}
//               placeholder="e.g., Organic Tomatoes"
//               className="border p-2 rounded w-full"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2">Farm Location</label>
//             <div className="flex">
//               <input
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//                 placeholder="e.g., Vellore, Tamil Nadu"
//                 className="border p-2 rounded-l w-full"
//               />
//               <button
//                 type="button"
//                 onClick={handleFetchLocation}
//                 className="px-3 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
//               >
//                 📍 Get
//               </button>
//             </div>
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2">Farming Practice</label>
//             <select
//               value={practice}
//               onChange={(e) => setPractice(Number(e.target.value))}
//               className="border p-2 rounded w-full"
//             >
//               <option value={0}>Inorganic</option>
//               <option value={1}>Organic</option>
//             </select>
//           </div>
//           <button
//             type="submit"
//             className="px-4 py-2 rounded bg-green-600 text-white w-full"
//             disabled={loading}
//           >
//             {loading ? "Processing..." : "Add Product to Ledger"}
//           </button>
//         </form>
//       </div>

//       {/* The Farmer can now see all products */}
//       <FarmerProducts 
//         productLedger={productLedger} 
//         account={account}
//         showNotification={showNotification} 
//       />
//     </div>
//   );
// };

// export default FarmerDashboard;



// src/pages/FarmerDashboard.jsx

// import React, { useState, useEffect } from 'react'; // ✅ Add useEffect
// import FarmerProducts from '../components/FarmerProducts';

// const FarmerDashboard = ({ productLedger, account, showNotification }) => {
//     // --- Form State ---
//     const [productName, setProductName] = useState('');
//     const [practice, setPractice] = useState(0);
//     const [formLoading, setFormLoading] = useState(false); // ✅ Renamed for clarity
//     const [location, setLocation] = useState('');

//     // --- Product List State (Lifted from child) ---
//     const [products, setProducts] = useState([]); // ✅ ADD state for the product list
//     const [productsLoading, setProductsLoading] = useState(false); // ✅ ADD loading state for the list

//     // ✅ ADD the function to fetch products here in the parent
//     const fetchProducts = async () => {
//         if (!productLedger) return;
//         setProductsLoading(true);
//         try {
//             const productCounter = await productLedger.methods.productCounter().call();
//             const fetchedProducts = [];
//             // Loop from the latest product to the first for a more natural display order
//             for (let i = productCounter; i >= 1; i--) {
//                 const p = await productLedger.methods.getProductDetails(i).call();
//                 fetchedProducts.push(p);
//             }
//             setProducts(fetchedProducts);
//         } catch (err) {
//             console.error("Error fetching products:", err);
//             showNotification('Could not fetch product list.', 'error');
//         } finally {
//             setProductsLoading(false);
//         }
//     };

//     // ✅ ADD useEffect to fetch products when the component loads
//     useEffect(() => {
//         if (productLedger) {
//             fetchProducts();
//         }
//     }, [productLedger]); // Runs when productLedger is available

//     const handleFetchLocation = () => {
//         // ... (your existing location logic, no changes needed)
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition((position) => {
//                 const { latitude, longitude } = position.coords;
//                 setLocation(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
//                 showNotification('Location fetched!', 'success');
//             }, () => {
//                 showNotification('Could not get location. Please enter it manually.', 'error');
//             });
//         } else {
//             showNotification('Geolocation is not supported by this browser.', 'error');
//         }
//     };

//     const handleAddProduct = async (e) => {
//         e.preventDefault();
//         if (!productName || !location) {
//             showNotification('Please fill all fields.', 'error');
//             return;
//         }
//         setFormLoading(true);
//         try {
//             await productLedger.methods.addProduct(productName, practice, location).send({ from: account });
//             showNotification('Product added successfully!', 'success');
//             setProductName(''); // Reset form
//             setLocation('');
//             fetchProducts(); // ✅ RE-FETCH the list after adding a new product
//         } catch (err) {
//             console.error('Error adding product:', err);
//             showNotification('Failed to add product.', 'error');
//         } finally {
//             setFormLoading(false);
//         }
//     };

//     return (
//         <div>
//             <div className="bg-white p-6 rounded-lg shadow-md">
//                 <h3 className="text-2xl font-semibold mb-4">Register New Product</h3>
//                 {/* --- Form Section --- */}
//                 <form onSubmit={handleAddProduct}>
//                     {/* Input for Product Name */}
//                     <div className="mb-4">
//                         <label className="block text-gray-700 mb-2">Product Name</label>
//                         <input
//                             value={productName}
//                             onChange={(e) => setProductName(e.target.value)}
//                             placeholder="e.g., Organic Tomatoes from Vellore"
//                             className="border p-2 rounded w-full"
//                         />
//                     </div>
//                     {/* Input for Location */}
//                     <div className="mb-4">
//                         <label className="block text-gray-700 mb-2">Farm Location</label>
//                         <div className="flex">
//                             <input
//                                 value={location}
//                                 onChange={(e) => setLocation(e.target.value)}
//                                 placeholder="e.g., Vellore, Tamil Nadu"
//                                 className="border p-2 rounded-l w-full"
//                             />
//                             <button
//                                 type="button"
//                                 onClick={handleFetchLocation}
//                                 className="px-3 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
//                             >
//                                 📍 Get
//                             </button>
//                         </div>
//                     </div>
//                     {/* Select for Farming Practice */}
//                     <div className="mb-4">
//                         <label className="block text-gray-700 mb-2">Farming Practice</label>
//                         <select
//                             value={practice}
//                             onChange={(e) => setPractice(Number(e.target.value))}
//                             className="border p-2 rounded w-full"
//                         >
//                             <option value={0}>Inorganic</option>
//                             <option value={1}>Organic</option>
//                         </select>
//                     </div>
//                     <button
//                         type="submit"
//                         className="px-4 py-2 rounded bg-green-600 text-white w-full"
//                         disabled={formLoading}
//                     >
//                         {formLoading ? "Processing..." : "Add Product to Ledger"}
//                     </button>
//                 </form>
//             </div>

//             {/* ✅ PASS the state and functions down to the child component */}
//             <FarmerProducts
//                 products={products}
//                 loading={productsLoading}
//                 account={account}
//                 productLedger={productLedger}
//                 onProductUpdate={fetchProducts}
//                 showNotification={showNotification}
//             />
//         </div>
//     );
// };

// export default FarmerDashboard;



import {  useState } from 'react';

// 1. Import the child components we will be using in the tabs.
// (Assuming they are in a sibling 'components' folder)
import FarmerProducts from '../components/FarmerProducts';
import FarmerInsurance from '../components/FarmerInsurance';
import FarmerLoans from '../components/FarmerLoans';

const FarmerDashboard = ({ account, userRegistry, productLedger, cropInsurance, loanMatching, showNotification, refreshTrigger }) => {
    const [activeTab, setActiveTab] = useState('products');

    return (
        <div>
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('products')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'products' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
                        My Products
                    </button>
                    <button onClick={() => setActiveTab('insurance')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'insurance' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}>
                        My Insurance
                    </button>
                    <button onClick={() => setActiveTab('loans')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'loans' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}>
                        My Loans
                    </button>
                </nav>
            </div>
            
            {/* 2. Render the correct component based on the active tab and pass all necessary props down. */}
            <div>
                {activeTab === 'products' && (
                    <FarmerProducts 
                        productLedger={productLedger}
                        cropInsurance={cropInsurance}
                        account={account}
                        userRegistry={userRegistry}
                        showNotification={showNotification}
                        refreshTrigger={refreshTrigger}
                    />
                )}
                {activeTab === 'insurance' && (
                    <FarmerInsurance 
                        cropInsurance={cropInsurance}
                        account={account}
                        showNotification={showNotification}
                    />
                )}
                {activeTab === 'loans' && (
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
// NOTE: You will need to create the child components (FarmerProducts, FarmerInsurance, FarmerLoans)
// The logic from your old FarmerDashboard (form to add product, product list) would move into `FarmerProducts.js`
// and be updated to use `addSownProduct` and include buttons for "Harvest" and "Get Insurance Quote".