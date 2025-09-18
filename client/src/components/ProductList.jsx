// // src/components/ProductList.jsx

// import React, { useState, useEffect } from 'react';

// const ProductList = ({ productLedger }) => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       if (!productLedger) return;
//       try {
//         const productCounter = await productLedger.methods.productCounter().call();
//         const loadedProducts = [];
//         for (let i = 1; i <= productCounter; i++) {
//           const p = await productLedger.methods.getProductDetails(i).call();
//           loadedProducts.push({
//             id: p.id,
//             name: p.name,
//             farmer: p.farmer,
//             practice: Number(p.practice) === 1 ? 'Organic' : 'Conventional',
//             isVerified: p.isVerified,
//             stage: Number(p.stage), // 0:Harvested, 1:InTransit, 2:AtVendor, 3:Sold
//             currentOwner: p.currentOwner,
//           });
//         }
//         setProducts(loadedProducts.reverse()); // Show newest first
//       } catch (error) {
//         console.error("Failed to fetch products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [productLedger]);

//   const stageToString = (stage) => {
//     switch (stage) {
//       case 0: return "Harvested";
//       case 1: return "In Transit";
//       case 2: return "At Vendor";
//       case 3: return "Sold";
//       default: return "Unknown";
//     }
//   };

//   if (loading) return <p>Loading products...</p>;

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md mt-8">
//       <h3 className="text-2xl font-semibold mb-4">All Products on Ledger</h3>
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white">
//           <thead className="bg-gray-200">
//             <tr>
//               <th className="py-2 px-4">ID</th>
//               <th className="py-2 px-4">Name</th>
//               <th className="py-2 px-4">Practice</th>
//               <th className="py-2 px-4">Status</th>
//               <th className="py-2 px-4">Verified</th>
//               <th className="py-2 px-4">Current Owner</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map((p) => (
//               <tr key={p.id} className="border-b text-center hover:bg-gray-50">
//                 <td className="py-2 px-4 font-mono">{String(p.id)}</td>
//                 <td className="py-2 px-4">{p.name}</td>
//                 <td className="py-2 px-4">{p.practice}</td>
//                 <td className="py-2 px-4">{stageToString(p.stage)}</td>
//                 <td className="py-2 px-4">{p.isVerified ? '✅ Yes' : '❌ No'}</td>
//                 <td className="py-2 px-4 font-mono text-xs" title={p.currentOwner}>{`${p.currentOwner.substring(0, 8)}...`}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ProductList;


// import React, { useState, useEffect } from 'react';

// const ProductList = ({ productLedger }) => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedProduct, setSelectedProduct] = useState(null);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       if (!productLedger) return;
//       try {
//         const productCounter = await productLedger.methods.productCounter().call();
//         const loadedProducts = [];
//         for (let i = 1; i <= productCounter; i++) {
//           const p = await productLedger.methods.getProductDetails(i).call();
//           loadedProducts.push({
//             id: p.id,
//             name: p.name,
//             farmer: p.farmer,
//             practice: Number(p.practice) === 1 ? 'Organic' : 'Conventional',
//             isVerified: p.isVerified,
//             stage: Number(p.stage),
//             currentOwner: p.currentOwner,
//           });
//         }
//         const sortedProducts = loadedProducts.sort((a, b) => Number(a.id) - Number(b.id));
//         setProducts(sortedProducts);
//         setFilteredProducts(sortedProducts);
//       } catch (error) {
//         console.error("Failed to fetch products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [productLedger]);

//   useEffect(() => {
//     const filtered = products.filter(product => 
//       product.id.toString().includes(searchTerm) ||
//       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.practice.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stageToString(product.stage).toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredProducts(filtered);
//   }, [searchTerm, products]);

//   const stageToString = (stage) => {
//     switch (stage) {
//       case 0: return "Harvested";
//       case 1: return "In Transit";
//       case 2: return "At Vendor";
//       case 3: return "Sold";
//       default: return "Unknown";
//     }
//   };

// //   const practiceToString = (practice) => {
// //     return practice === 1 ? 'Organic' : 'Conventional';
// //   };

//   const handleProductClick = (product) => {
//     setSelectedProduct(product);
//   };

//   const closeModal = () => {
//     setSelectedProduct(null);
//   };

//   if (loading) return <p>Loading products...</p>;

//   return (
//     <>
//       <div className="bg-white p-6 rounded-lg shadow-md mt-8">
//         <h3 className="text-2xl font-semibold mb-4">All Products on Ledger</h3>
        
//         {/* Search Bar */}
//         <div className="mb-4">
//           <input
//             type="text"
//             placeholder="Search by ID, name, farmer, practice, or status..."
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white">
//             <thead className="bg-gray-200">
//               <tr>
//                 <th className="py-2 px-4">ID</th>
//                 <th className="py-2 px-4">Name</th>
//                 <th className="py-2 px-4">Practice</th>
//                 <th className="py-2 px-4">Status</th>
//                 <th className="py-2 px-4">Verified</th>
//                 <th className="py-2 px-4">Current Owner</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredProducts.map((p) => (
//                 <tr 
//                   key={p.id} 
//                   className="border-b text-center hover:bg-gray-50 cursor-pointer"
//                   onClick={() => handleProductClick(p)}
//                 >
//                   <td className="py-2 px-4 font-mono">{String(p.id)}</td>
//                   <td className="py-2 px-4">{p.name}</td>
//                   <td className="py-2 px-4">{p.practice}</td>
//                   <td className="py-2 px-4">{stageToString(p.stage)}</td>
//                   <td className="py-2 px-4">{p.isVerified ? '✅ Yes' : '❌ No'}</td>
//                   <td className="py-2 px-4 font-mono text-xs" title={p.currentOwner}>{`${p.currentOwner.substring(0, 8)}...`}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {filteredProducts.length === 0 && (
//           <p className="text-gray-500 text-center py-4">No products found matching your search.</p>
//         )}
//       </div>

//       {/* Product Details Modal */}
//       {selectedProduct && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-semibold">Product Details</h3>
//               <button 
//                 onClick={closeModal}
//                 className="text-gray-500 hover:text-gray-700 text-xl"
//               >
//                 ×
//               </button>
//             </div>
            
//             <div className="space-y-2">
//               <p><strong>ID:</strong> {selectedProduct.id}</p>
//               <p><strong>Name:</strong> {selectedProduct.name}</p>
//               <p><strong>Farmer:</strong> {selectedProduct.farmer}</p>
//               <p><strong>Practice:</strong> {selectedProduct.practice}</p>
//               <p><strong>Verified:</strong> {selectedProduct.isVerified ? 'Yes' : 'No'}</p>
//               <p><strong>Stage:</strong> {stageToString(selectedProduct.stage)}</p>
//               <p><strong>Current Owner:</strong> {selectedProduct.currentOwner}</p>
//             </div>
            
//             <div className="mt-6 text-center">
//               <button 
//                 onClick={closeModal}
//                 className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default ProductList;



// import React, { useState, useEffect } from 'react';

// const ProductList = ({ productLedger }) => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedProduct, setSelectedProduct] = useState(null);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       if (!productLedger) return;
//       try {
//         const productCounter = await productLedger.methods.productCounter().call();
//         const loadedProducts = [];
//         for (let i = 1; i <= productCounter; i++) {
//           const p = await productLedger.methods.getProductDetails(i).call();
//           const historyResult = await productLedger.methods.getProductHistory(i).call();

//           // Update this mapping logic
//           const formattedHistory = historyResult.timestamps.map((timestamp, index) => ({
//               timestamp: Number(timestamp),
//               stage: stageToString(Number(historyResult.stages[index])),
//               actor: historyResult.actors[index], // <-- ADD THIS LINE
//           })).reverse(); // Reverse to show the latest event first
//           loadedProducts.push({
//             id: p.id,
//             name: p.name,
//             farmer: p.farmer,
//             practice: Number(p.practice) === 1 ? 'Organic' : 'Inorganic',
//             isVerified: p.isVerified,
//             stage: Number(p.stage),
//             currentOwner: p.currentOwner,
//             history: formattedHistory
//           });
//         }
//         const sortedProducts = loadedProducts.sort((a, b) => Number(a.id) - Number(b.id));
//         setProducts(sortedProducts);
//         setFilteredProducts(sortedProducts);
//       } catch (error) {
//         console.error("Failed to fetch products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [productLedger]);

//   useEffect(() => {
//     const filtered = products.filter(product => 
//       product.id.toString().includes(searchTerm) ||
//       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.practice.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stageToString(product.stage).toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredProducts(filtered);
//   }, [searchTerm, products]);

//   const stageToString = (stage) => {
//     switch (stage) {
//       case 0: return "Harvested";
//       case 1: return "In Transit";
//       case 2: return "At Vendor";
//       case 3: return "Sold";
//       default: return "Unknown";
//     }
//   };

//   const handleProductClick = (product) => {
//     setSelectedProduct(product);
//   };

//   const closeModal = () => {
//     setSelectedProduct(null);
//   };

//   if (loading) return <p className="text-center text-gray-600 py-8">Loading products from the ledger...</p>;

//   return (
//     <div className="bg-gray-50 min-h-screen font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="text-center mb-8">
//           <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Product Traceability</h1>
//           <p className="text-gray-600 mt-2 text-lg">Browse products on the ledger to verify their origin and journey.</p>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-md">
//           <div className="mb-6">
//             <input
//               type="text"
//               placeholder="Search by Product ID or Name..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
//             />
//           </div>

//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">ID</th>
//                   <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Name</th>
//                   <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Practice</th>
//                   <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Status</th>
//                   <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 uppercase">Verified</th>
//                   <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Owner</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filteredProducts.length > 0 ? filteredProducts.map((p) => (
//                   <tr 
//                     key={p.id} 
//                     onClick={() => handleProductClick(p)} 
//                     className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
//                   >
//                     <td className="py-3 px-4 font-mono text-gray-700">{String(p.id)}</td>
//                     <td className="py-3 px-4 font-semibold">{p.name}</td>
//                     <td className="py-3 px-4">{p.practice}</td>
//                     <td className="py-3 px-4">{stageToString(p.stage)}</td>
//                     <td className="py-3 px-4 text-center">{p.isVerified ? '✅' : '❌'}</td>
//                     <td className="py-3 px-4 font-mono text-xs" title={p.currentOwner}>{`${p.currentOwner.substring(0, 8)}...`}</td>
//                   </tr>
//                 )) : (
//                   <tr>
//                     <td colSpan="6" className="text-center py-8 text-gray-500">No products found.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Product Details Modal */}
//       {selectedProduct && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
//           <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative transform scale-95 hover:scale-100 transition-transform duration-300">
//             <button 
//               onClick={closeModal} 
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
//             >
//               &times;
//             </button>
//             <h3 className="text-3xl font-bold text-gray-800 mb-4">{selectedProduct.name}</h3>
//             <div className="space-y-3 text-gray-700">
//               <p><strong>Product ID:</strong> <span className="font-mono bg-gray-100 p-1 rounded">{selectedProduct.id}</span></p>
//               <p><strong>Farming Practice:</strong> {selectedProduct.practice}</p>
//               <p><strong>Current Stage:</strong> <span className="font-semibold">{stageToString(selectedProduct.stage)}</span></p>
//               <p><strong>Verified:</strong> {selectedProduct.isVerified ? <span className="text-green-600 font-bold">Yes ✅</span> : <span className="text-red-600 font-bold">No ❌</span>}</p>
//               <p className="break-words"><strong>Farmer Address:</strong> <span className="font-mono text-sm">{selectedProduct.farmer}</span></p>
//               <p className="break-words"><strong>Current Owner:</strong> <span className="font-mono text-sm">{selectedProduct.currentOwner}</span></p>
//             </div>
//             <div className="mt-6">
//                 <h4 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Product Journey</h4>
//                 {selectedProduct.history && selectedProduct.history.length > 0 ? (
//                     <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
//                         {selectedProduct.history.map((event, index) => (
//                             <div key={index} className="flex items-start">
//                                 <div className="flex flex-col items-center mr-4">
//                                     <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
//                                     {index < selectedProduct.history.length - 1 && (
//                                         <div className="w-0.5 h-12 bg-gray-300"></div>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <p className="font-bold text-gray-900">{event.stage}</p>
//                                     <p className="text-xs text-gray-600 font-mono" title={event.actor} // Show full address on hover
//                                     >
//                                         By: {`${event.actor.substring(0, 6)}...${event.actor.substring(event.actor.length - 4)}`}
//                                     </p>
//                                     <p className="text-sm text-gray-500">
//                                         {new Date(event.timestamp * 1000).toLocaleString('en-IN', {
//                                             day: 'numeric',
//                                             month: 'long',
//                                             year: 'numeric',
//                                             hour: '2-digit',
//                                             minute: '2-digit'
//                                         })}
//                                     </p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <p className="text-gray-500">No history available for this product.</p>
//                 )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductList;



import React, { useState, useEffect } from 'react';

const ProductList = ({ productLedger }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- State for Modal ---
    // ❗ State to hold history for ONLY the selected product
    const [selectedProductHistory, setSelectedProductHistory] = useState([]);
    // ❗ State to show a loader while fetching history
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Function to convert stage enum to string
  // ❗ CHANGED: stageToString updated
    const stageToString = (stage) => {
        switch (Number(stage)) {
            case 0: return "Sown";
            case 1: return "Harvested";
            case 2: return "In Transit";
            case 3: return "At Vendor";
            case 4: return "Sold";
            default: return "Unknown";
        }
    };

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     if (!productLedger) return;
  //     try {
  //       const productCounter = await productLedger.methods.productCounter().call();
  //       const loadedProducts = [];
  //       for (let i = 1; i <= productCounter; i++) {
  //         const p = await productLedger.methods.getProductDetails(i).call();
  //         const historyResult = await productLedger.methods.getProductHistory(i).call();

  //         const formattedHistory = (historyResult || []).map(event => ({
  //             timestamp: Number(event.timestamp),
  //             stage: stageToString(Number(event.stage)),
  //             actor: event.actor,
  //         })).reverse();

  //         loadedProducts.push({
  //               id: p.id,
  //               name: p.name,
  //               farmer: p.farmer,
  //               practice: Number(p.practice) === 1 ? 'Organic' : 'Inorganic',
  //               isVerified: p.isVerified,
  //               stage: Number(p.stage),
  //               currentOwner: p.currentOwner,
  //               location: p.location,
  //               sowingDate: Number(p.sowingDate), // 🆕 ADDED
  //               harvestDate: Number(p.harvestDate),
  //               quantity: String(p.quantity), // 🆕 ADDED
  //               unit: p.unit, // 🆕 ADDED
  //               // 🆕 ADD NEW PRICE FIELDS TO THE FETCHED OBJECT
  //               farmerSalePrice: String(p.farmerSalePrice),
  //               vendorSalePrice: String(p.vendorSalePrice),
  //               history: formattedHistory
  //           });
  //       }
  //       const sortedProducts = loadedProducts.sort((a, b) => Number(a.id) - Number(b.id));
  //       setProducts(sortedProducts);
  //       setFilteredProducts(sortedProducts);
  //     } catch (error) {
  //       console.error("Failed to fetch products:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProducts();
  // }, [productLedger]);
  

  // ❗ OPTIMIZED: useEffect to fetch all products at once
    // useEffect(() => {
    //     const fetchProducts = async () => {
    //         if (!productLedger) return;
    //         try {
    //             // ❗ SINGLE CALL: Use the new getAllProducts function
    //             const allProducts = await productLedger.methods.getAllProducts().call();

    //             // ❗ Map over the results in the frontend (no more loop with awaits)
    //             const loadedProducts = allProducts.map(p => ({
    //                 // Note: BigInts from web3.js are converted to standard types
    //                 id: Number(p.id),
    //                 name: p.name,
    //                 farmer: p.farmer,
    //                 practice: Number(p.practice) === 1 ? 'Organic' : 'Inorganic',
    //                 isVerified: p.isVerified,
    //                 stage: Number(p.stage),
    //                 currentOwner: p.currentOwner,
    //                 location: p.location,
    //                 sowingDate: Number(p.sowingDate),
    //                 harvestDate: Number(p.harvestDate),
    //                 quantity: String(p.quantity),
    //                 unit: p.unit,
    //                 farmerSalePrice: String(p.farmerSalePrice),
    //                 vendorSalePrice: String(p.vendorSalePrice),
    //                 // ❗ History is NOT fetched here anymore to speed up initial load
    //                 history: []
    //             }));
                
    //             const sortedProducts = loadedProducts.sort((a, b) => a.id - b.id);
    //             setProducts(sortedProducts);
    //             setFilteredProducts(sortedProducts);
    //         } catch (error) {
    //             console.error("Failed to fetch products:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchProducts();
    // }, [productLedger]);

    // ❗ OPTIMIZED: useEffect to fetch all products at once
    // useEffect(() => {
    //     const fetchProducts = async () => {
    //         if (!productLedger) return;
    //         try {
    //             // ❗ SINGLE CALL: Use the new getAllProducts function
    //             const [cores, metadata] = await productLedger.methods.getAllProducts().call();

    //             // ❗ Map over the results in the frontend (no more loop with awaits)
    //             const loadedProducts = cores.map((core, index) => ({
    //                 // Combine data from both structs
    //                 ...core,
    //                 ...metadata[index],
    //                 id: Number(core.id), // Ensure IDs are numbers for sorting/keys
    //                 stage: Number(core.stage),
    //                 practice: Number(core.practice) === 1 ? 'Organic' : 'Inorganic',
    //                 // ❗ History is NOT fetched here anymore to speed up initial load
    //                 history: [] 
    //             }));
                
    //             const sortedProducts = loadedProducts.sort((a, b) => b.id - a.id); // Show newest first
    //             setProducts(sortedProducts);
    //             setFilteredProducts(sortedProducts);
    //         } catch (error) {
    //             console.error("Failed to fetch products:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchProducts();
    // }, [productLedger]);

    useEffect(() => {
    const fetchProducts = async () => {
        if (!productLedger) return;
        try {
            // ❗ FIX: Store the result object first
            const productData = await productLedger.methods.getAllProducts().call();

            // ❗ Then, access the arrays by their numeric keys
            const cores = productData[0];
            const metadata = productData[1];

            // The rest of your logic remains the same
            const loadedProducts = cores.map((core, index) => ({
                ...core,
                ...metadata[index],
                id: Number(core.id),
                stage: Number(core.stage),
                practice: Number(core.practice) === 1 ? 'Organic' : 'Inorganic',
                history: [] 
            }));
            
            const sortedProducts = loadedProducts.sort((a, b) => b.id - a.id);
            setProducts(sortedProducts);
            setFilteredProducts(sortedProducts);
            console.log("Products loaded into state:", sortedProducts);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchProducts();
}, [productLedger]);


  useEffect(() => {
    const filtered = products.filter(product => 
      product.id.toString().includes(searchTerm) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.practice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stageToString(product.stage).toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);


  // const handleProductClick = (product) => {
  //   setSelectedProduct(product);
  // };

    
  
  // const handleProductClick = async (product) => {
  //       setSelectedProduct(product); // Show modal immediately
  //       setIsHistoryLoading(true); // Show history loader
  //       try {
  //           const historyResult = await productLedger.methods.getProductHistory(product.id).call();
  //           const formattedHistory = (historyResult || []).map(event => ({
  //               timestamp: Number(event.timestamp),
  //               stage: stageToString(Number(event.stage)),
  //               actor: event.actor,
  //           })).reverse();
  //           setSelectedProductHistory(formattedHistory);
  //       } catch (error) {
  //           console.error("Failed to fetch product history:", error);
  //           setSelectedProductHistory([]); // Clear history on error
  //       } finally {
  //           setIsHistoryLoading(false); // Hide history loader
  //       }
  //   };

  // ❗ OPTIMIZED: handleProductClick now fetches history on-demand
    const handleProductClick = async (product) => {
        setSelectedProduct(product); // Show modal immediately
        setIsHistoryLoading(true);    // Show history loader
        try {
            const historyResult = await productLedger.methods.getProductHistory(product.id).call();
            const formattedHistory = (historyResult || []).map(event => ({
                timestamp: Number(event.timestamp),
                stage: stageToString(Number(event.stage)),
                actor: event.actor,
            })).reverse(); // Show most recent first
            setSelectedProductHistory(formattedHistory);
        } catch (error) {
            console.error("Failed to fetch product history:", error);
            setSelectedProductHistory([]); // Clear history on error
        } finally {
            setIsHistoryLoading(false); // Hide history loader
        }
    };

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedProductHistory([]); // Clear history when closing modal
  };

  if (loading) return <p className="text-center text-gray-600 py-8">Loading products from the ledger...</p>;

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Product Traceability</h1>
          <p className="text-gray-600 mt-2 text-lg">Browse products on the ledger to verify their origin and journey.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by Product ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Practice</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Status</th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 uppercase">Verified</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length > 0 ? filteredProducts.map((p) => (
                  <tr 
                    key={p.id} 
                    onClick={() => handleProductClick(p)} 
                    className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                  >
                    <td className="py-3 px-4 font-mono text-gray-700">{String(p.id)}</td>
                    <td className="py-3 px-4 font-semibold">{p.name}</td>
                    <td className="py-3 px-4">{p.practice}</td>
                    <td className="py-3 px-4">{stageToString(p.stage)}</td>
                    <td className="py-3 px-4 text-center">{p.isVerified ? '✅' : '❌'}</td>
                    <td className="py-3 px-4 font-mono text-xs" title={p.currentOwner}>{`${p.currentOwner.substring(0, 8)}...`}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative transform scale-95 hover:scale-100 transition-transform duration-300">
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">{selectedProduct.name}</h3>
            <div className="space-y-3 text-gray-700">
              <p><strong>Product ID:</strong> <span className="font-mono bg-gray-100 p-1 rounded">{String(selectedProduct.id)}</span></p>
              <p><strong>Harvest Location:</strong> {selectedProduct.location}</p>
              <p><strong>Harvest Date:</strong> {new Date(Number(selectedProduct.harvestDate) * 1000).toLocaleDateString('en-IN')}</p>
              <p><strong>Farming Practice:</strong> {selectedProduct.practice}</p>
              <p><strong>Current Stage:</strong> <span className="font-semibold">{stageToString(selectedProduct.stage)}</span></p>
               {/* 🆕 --- PRICE INFORMATION DISPLAY ---
              {Number(selectedProduct.farmerSalePrice) > 0 && (
                  <p><strong>Price from Farmer:</strong> 
                      <span className="font-semibold text-green-700"> ₹{Number(selectedProduct.farmerSalePrice)}</span>
                  </p>
              )}
              {Number(selectedProduct.vendorSalePrice) > 0 && (
                  <p><strong>Final Consumer Price:</strong> 
                      <span className="font-semibold text-blue-700"> ₹{Number(selectedProduct.vendorSalePrice)}</span>
                  </p>
              )}
               {Number(selectedProduct.vendorSalePrice) > 0 && (
                  <p><strong>Vendor Margin:</strong> 
                      <span className="font-semibold text-purple-700"> ₹{Number(selectedProduct.vendorSalePrice) - Number(selectedProduct.farmerSalePrice)}</span>
                  </p>
              )} */}
               <p><strong>Quantity:</strong> {selectedProduct.quantity} {selectedProduct.unit}</p>
                            <p><strong>Sowing Date:</strong> {new Date(Number(selectedProduct.harvestDate) * 1000).toLocaleDateString('en-IN')}</p>
                            {Number(selectedProduct.harvestDate) > 0 ? (
                                <p><strong>Harvest Date:</strong> {new Date(Number(selectedProduct.harvestDate) * 1000).toLocaleDateString('en-IN')}</p>
                            ) : (
                                <p><strong>Harvest Date:</strong> Not Harvested Yet</p>
                            )}
              <p><strong>Verified:</strong> {selectedProduct.isVerified ? <span className="text-green-600 font-bold">Yes ✅</span> : <span className="text-red-600 font-bold">No ❌</span>}</p>
              <p className="break-words"><strong>Farmer Address:</strong> <span className="font-mono text-sm">{selectedProduct.farmer}</span></p>
              <p className="break-words"><strong>Current Owner:</strong> <span className="font-mono text-sm">{selectedProduct.currentOwner}</span></p>
            </div>
            <div className="mt-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Product Journey</h4>
              {isHistoryLoading ? (
                                <p className="text-gray-500">Loading history...</p>
                            ):selectedProductHistory.length > 0 ? (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {selectedProductHistory.map((event, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        {index < selectedProduct.history.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-300"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{event.stage}</p>
                        {/* NEW: Display price if available for the event */}
                                            {Number(event.price) > 0 && (
                                                <p className="font-semibold text-green-700">
                                                    Price: ₹{event.price}
                                                </p>
                                            )}
                        <p className="text-xs text-gray-600 font-mono" title={event.actor}>
                          By: {`${event.actor.substring(0, 6)}...${event.actor.substring(event.actor.length - 4)}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(event.timestamp * 1000).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No history available for this product.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
 );
};

export default ProductList;