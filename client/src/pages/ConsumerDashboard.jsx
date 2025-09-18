// import React, { useState } from 'react';

// const ConsumerDashboard = ({ productLedger, showNotification }) => {
//   const [productId, setProductId] = useState(0);
//   const [productDetails, setProductDetails] = useState(null);
//   const [productHistory, setProductHistory] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const practiceToString = (p) => (Number(p) === 0 ? 'Conventional' : 'Organic');
//   const stageToString = (s) => ['Harvested', 'InTransit', 'AtVendor', 'Sold'][Number(s)] || 'Unknown';

//   const handleFetchProduct = async () => {
//     if (!productId) {
//       showNotification('Please enter a Product ID.', 'error');
//       return;
//     }
//     setLoading(true);
//     try {
//       if (productLedger && productLedger.methods) {
//         // Fetch product details
//         const details = await productLedger.methods.getProductDetails(productId).call();
//         setProductDetails(details);

//         // Fetch product history
//         const history = await productLedger.methods.getProductHistory(productId).call();
//         setProductHistory(history);

//         showNotification('Product fetched from chain.', 'success');
//       } else {
//         // Simulation mode
//         const simulated = {
//           id: productId,
//           name: 'Sample Crop',
//           farmer: '0x000...000',
//           harvestDate: Date.now(),
//           practice: 1,
//           isVerified: true,
//           stage: 0,
//           currentOwner: '0x000...000',
//         };
//         setProductDetails(simulated);
//         setProductHistory([
//           { stage: 0, actor: simulated.farmer, timestamp: Date.now() },
//         ]);
//         showNotification('Simulated product returned (no contract connected).', 'success');
//       }
//     } catch (err) {
//       console.error('Error fetching product:', err);
//       showNotification('Could not fetch product details.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-semibold mb-4">Consumer Dashboard</h2>
//       <div className="mb-4">
//         <input
//           type="number"
//           placeholder="Enter Product ID"
//           value={productId}
//           onChange={(e) => setProductId(e.target.value)}
//           className="border p-2 rounded w-64"
//         />
//         <button
//           onClick={handleFetchProduct}
//           className="ml-3 px-4 py-2 rounded bg-blue-600 text-white"
//         >
//           {loading ? 'Loading...' : 'Fetch Product'}
//         </button>
//       </div>

//       {productDetails && (
//         <div className="border p-4 rounded bg-white shadow space-y-2">
//           <p><strong>ID:</strong> {productDetails.id}</p>
//           <p><strong>Name:</strong> {productDetails.name}</p>
//           <p><strong>Farmer:</strong> {productDetails.farmer}</p>
//           {/* <p><strong>Harvest Date:</strong> {new Date(productDetails.harvestDate * 1000).toLocaleString()}</p> */}
//           <p><strong>Practice:</strong> {practiceToString(productDetails.practice)}</p>
//           <p><strong>Verified:</strong> {productDetails.isVerified ? 'Yes' : 'No'}</p>
//           <p><strong>Stage:</strong> {stageToString(productDetails.stage)}</p>
//           <p><strong>Current Owner:</strong> {productDetails.currentOwner}</p>
//         </div>
//       )}

//       {productHistory.length > 0 && (
//         <div className="mt-6 border p-4 rounded bg-white shadow">
//           <h3 className="font-semibold mb-2">Product History</h3>
//           <ul className="list-disc list-inside space-y-1">
//             {productHistory.map((event, idx) => (
//               <li key={idx}>
//                 <span className="font-medium">{stageToString(event.stage)}</span> by{' '}
//                 {event.actor} at 
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ConsumerDashboard;


// src/components/ConsumerDashboard.jsx

// import React from 'react';
// import ProductList from '../components/ProductList';

// const ConsumerDashboard = ({ productLedger }) => {
//   return (
//     <div>
//       <div className="bg-white p-6 rounded-lg shadow-md text-center">
//         <h3 className="text-2xl font-semibold">Product Traceability</h3>
//         <p className="text-gray-600 mt-2">Browse all products registered on the blockchain to verify their origin and journey.</p>
//       </div>
//       <ProductList productLedger={productLedger} />
//     </div>
//   );
// };

// export default ConsumerDashboard;


import React from 'react';
import ProductList from '../components/ProductList';

const ConsumerDashboard = ({ productLedger }) => {
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-2xl font-semibold">Product Traceability</h3>
        <p className="text-gray-600 mt-2">Browse all products registered on the blockchain to verify their origin and journey.</p>
      </div>
      <ProductList productLedger={productLedger} />
    </div>
  );
};

export default ConsumerDashboard;