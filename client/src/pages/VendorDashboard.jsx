// src/components/VendorDashboard.jsx

// import React, { useState } from 'react';
// import ProductList from '../components/ProductList';

// const VendorDashboard = ({ productLedger, account, showNotification }) => {
//   const [productId, setProductId] = useState('');
//   const [loadingAction, setLoadingAction] = useState(null);

//   const handleAction = async (action) => {
//     if (!productId) {
//       showNotification('Please enter a Product ID.', 'error');
//       return;
//     }
//     setLoadingAction(action);
//     try {
//       if (action === 'receive') {
//         await productLedger.methods.updateStageToVendor(productId).send({ from: account });
//         showNotification(`Product #${productId} received.`, 'success');
//       } else if (action === 'sell') {
//         await productLedger.methods.updateStageToSold(productId).send({ from: account });
//         showNotification(`Product #${productId} marked as sold.`, 'success');
//       }
//       setProductId('');
//     } catch (err) {
//       console.error(`Error performing action ${action}:`, err);
//       showNotification('Action failed. Check product ownership and stage.', 'error');
//     } finally {
//       setLoadingAction(null);
//     }
//   };

//   return (
//     <div>
//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <h3 className="text-2xl font-semibold mb-4">Vendor Actions</h3>
//         <div className="flex items-center space-x-4">
//           <input
//             value={productId}
//             onChange={e => setProductId(e.target.value)}
//             placeholder="Enter Product ID"
//             className="border p-2 rounded w-1/2"
//             type="number"
//           />
//           <button
//             onClick={() => handleAction('receive')}
//             className="px-4 py-2 rounded bg-blue-600 text-white flex-1"
//             disabled={loadingAction}
//           >
//             {loadingAction === 'receive' ? 'Processing...' : 'Receive Product'}
//           </button>
//           <button
//             onClick={() => handleAction('sell')}
//             className="px-4 py-2 rounded bg-purple-600 text-white flex-1"
//             disabled={loadingAction}
//           >
//             {loadingAction === 'sell' ? 'Processing...' : 'Mark as Sold'}
//           </button>
//         </div>
//       </div>

//       <ProductList productLedger={productLedger} />
//     </div>
//   );
// };

// export default VendorDashboard;



// import React, { useState } from 'react';
// import ProductList from '../components/ProductList';

// const VendorDashboard = ({ productLedger, account, showNotification }) => {
//   const [productId, setProductId] = useState('');
//   const [loadingAction, setLoadingAction] = useState(null);
//   // State to hold the changing key
//   const [listKey, setListKey] = useState(Date.now());

//   const handleAction = async (action) => {
//     if (!productId) {
//       showNotification('Please enter a Product ID.', 'error');
//       return;
//     }
//     setLoadingAction(action);
//     try {
//       if (action === 'receive') {
//         await productLedger.methods.updateStageToVendor(productId).send({ from: account });
//         showNotification(`Product #${productId} received.`, 'success');
//       } else if (action === 'sell') {
//         await productLedger.methods.updateStageToSold(productId).send({ from: account });
//         showNotification(`Product #${productId} marked as sold.`, 'success');
//       }
//       setProductId('');
//       // After a successful action, update the key to trigger a refresh
//       setListKey(Date.now());
//     } catch (err) {
//       console.error(`Error performing action ${action}:`, err);
//       showNotification('Action failed. Check product ownership and stage.', 'error');
//     } finally {
//       setLoadingAction(null);
//     }
//   };

//   return (
//     <div>
//       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//         <h3 className="text-2xl font-semibold mb-4">Vendor Actions</h3>
//         <div className="flex items-center space-x-4">
//           <input
//             value={productId}
//             onChange={e => setProductId(e.target.value)}
//             placeholder="Enter Product ID"
//             className="border p-2 rounded w-1/2"
//             type="number"
//           />
//           <button
//             onClick={() => handleAction('receive')}
//             className="px-4 py-2 rounded bg-blue-600 text-white flex-1"
//             disabled={loadingAction}
//           >
//             {loadingAction === 'receive' ? 'Processing...' : 'Receive Product'}
//           </button>
//           <button
//             onClick={() => handleAction('sell')}
//             className="px-4 py-2 rounded bg-purple-600 text-white flex-1"
//             disabled={loadingAction}
//           >
//             {loadingAction === 'sell' ? 'Processing...' : 'Mark as Sold'}
//           </button>
//         </div>
//       </div>

//       {/* Add the key prop here to control this specific instance */}
//       <ProductList key={listKey} productLedger={productLedger} />
//     </div>
//   );
// };

// export default VendorDashboard;



// In src/pages/VendorDashboard.js

import React, { useState } from 'react';
import ProductList from '../components/ProductList';

const VendorDashboard = ({ productLedger, account, showNotification }) => {
  const [confirmProductId, setConfirmProductId] = useState('');
  const [sellProductId, setSellProductId] = useState('');
  const [loadingAction, setLoadingAction] = useState(null); // 'confirm' or 'sell'
  const [listKey, setListKey] = useState(Date.now());
  const [finalSalePrice, setFinalSalePrice] = useState(''); // 🆕 ADD STATE FOR FINAL PRICE

  // --- NEW: State for multi-vendor transfer ---
    const [transferProductId, setTransferProductId] = useState('');
    const [nextVendorAddress, setNextVendorAddress] = useState('');
    const [nextSalePrice, setNextSalePrice] = useState('');

  const handleConfirmReceipt = async () => {
    if (!confirmProductId) {
      showNotification('Please enter a Product ID to confirm.', 'error');
      return;
    }
    setLoadingAction('confirm');
    try {
      await productLedger.methods.confirmReceipt(confirmProductId).send({ from: account });
      showNotification(`Receipt confirmed for Product #${confirmProductId}!`, 'success');
      setConfirmProductId('');
      setListKey(Date.now()); // Refresh list
    } catch (err) {
      console.error('Error confirming receipt:', err);
      showNotification('Confirmation failed. Ensure the product is in transit to you.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // const handleMarkAsSold = async () => {
  //   if (!sellProductId) {
  //     showNotification('Please enter a Product ID to sell.', 'error');
  //     return;
  //   }
  //   setLoadingAction('sell');
  //   try {
  //     await productLedger.methods.updateStageToSold(sellProductId).send({ from: account });
  //     showNotification(`Product #${sellProductId} marked as sold.`, 'success');
  //     setSellProductId('');
  //     setListKey(Date.now()); // Refresh list
  //   } catch (err) {
  //     console.error('Error marking as sold:', err);
  //     showNotification('Action failed. Ensure you are the current owner.', 'error');
  //   } finally {
  //     setLoadingAction(null);
  //   }
  // };

  const handleMarkAsSold = async () => {
        // 🆕 Add price validation
        if (!sellProductId || !finalSalePrice || Number(finalSalePrice) <= 0) {
            showNotification('Please enter a Product ID and a final sale price.', 'error');
            return;
        }
        setLoadingAction('sell');
        try {
            // ❗ Pass the new price argument
            await productLedger.methods.updateStageToSold(sellProductId, finalSalePrice).send({ from: account });
            showNotification(`Product #${sellProductId} marked as sold.`, 'success');
            setSellProductId('');
            setFinalSalePrice(''); // 🆕 Reset price field
            setListKey(Date.now());
        } catch (err) {
            console.error('Error marking as sold:', err);
            showNotification('Action failed. Ensure you are the owner and the price is valid.', 'error');
        } finally {
            setLoadingAction(null);
        }
    };

    // --- NEW: Function to handle vendor-to-vendor transfer ---
    const handleTransferToNextVendor = async () => {
        if (!transferProductId || !nextVendorAddress || !nextSalePrice || Number(nextSalePrice) <= 0) {
            showNotification('Please provide a Product ID, a valid vendor address, and a price.', 'error');
            return;
        }
        setLoadingAction('transfer');
        try {
            // Use the same 'transferProductToVendor' function. The contract now allows it.
            await productLedger.methods.transferProductToVendor(
                transferProductId,
                nextVendorAddress,
                nextSalePrice
            ).send({ from: account });
            
            showNotification(`Transfer initiated for Product #${transferProductId}!`, 'success');
            setTransferProductId('');
            setNextVendorAddress('');
            setNextSalePrice('');
            setListKey(Date.now()); // Refresh list
        } catch (err) {
            console.error('Error transferring to next vendor:', err);
            showNotification('Transfer failed. Ensure you are the current owner and the address is a registered vendor.', 'error');
        } finally {
            setLoadingAction(null);
        }
    };


  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* --- Card 1: Confirm Receipt --- */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-2">1. Confirm Product Receipt</h3>
          <p className="text-gray-600 mb-4">
            Enter the ID of a product that has been sent to you to confirm its receipt and take ownership.
          </p>
          <div className="flex items-center space-x-4">
            <input
              value={confirmProductId}
              onChange={e => setConfirmProductId(e.target.value)}
              placeholder="Enter Product ID"
              className="border p-2 rounded w-full"
              type="number"
            />
            <button
              onClick={handleConfirmReceipt}
              className="px-4 py-2 rounded bg-blue-600 text-white flex-shrink-0"
              disabled={loadingAction}
            >
              {loadingAction === 'confirm' ? 'Processing...' : 'Confirm Receipt'}
            </button>
          </div>
        </div>

        {/* --- NEW: Card 2: Transfer to Next Vendor --- */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-2xl font-semibold mb-2">2. Transfer to Next Vendor</h3>
                    <p className="text-gray-600 mb-4">
                        Transfer a product you own to the next vendor in the supply chain.
                    </p>
                    <div className="space-y-4">
                        <input
                            value={transferProductId}
                            onChange={e => setTransferProductId(e.target.value)}
                            placeholder="Enter Product ID"
                            className="border p-2 rounded w-full"
                            type="number"
                        />
                        <input
                            value={nextVendorAddress}
                            onChange={e => setNextVendorAddress(e.target.value)}
                            placeholder="Next Vendor's Address (0x...)"
                            className="border p-2 rounded w-full font-mono"
                            type="text"
                        />
                        <input
                            value={nextSalePrice}
                            onChange={e => setNextSalePrice(e.target.value)}
                            placeholder="Sale Price (in INR)"
                            className="border p-2 rounded w-full"
                            type="number"
                        />
                        <button
                            onClick={handleTransferToNextVendor}
                            className="w-full px-4 py-2 rounded bg-teal-600 text-white"
                            disabled={loadingAction === 'transfer'}
                        >
                            {loadingAction === 'transfer' ? 'Processing...' : 'Initiate Transfer'}
                        </button>
                    </div>
                </div>

        {/* --- Card 3: Mark as Sold --- */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-2">2. Mark Product as Sold</h3>
          <p className="text-gray-600 mb-4">
            After you've received a product, enter its ID here once it has been sold to a customer.
          </p>
          <div className="flex items-center space-x-4">
            <input
              value={sellProductId}
              onChange={e => setSellProductId(e.target.value)}
              placeholder="Enter Product ID"
              className="border p-2 rounded w-full"
              type="number"
            />
            {/* 🆕 ADD FINAL PRICE INPUT */}
                    <input
                        value={finalSalePrice}
                        onChange={e => setFinalSalePrice(e.target.value)}
                        placeholder="Final Sale Price (in INR)"
                        className="border p-2 rounded w-full"
                        type="number"
                    />
            <button
              onClick={handleMarkAsSold}
              className="px-4 py-2 rounded bg-purple-600 text-white flex-shrink-0"
              disabled={loadingAction}
            >
              {loadingAction === 'sell' ? 'Processing...' : 'Mark as Sold'}
            </button>
          </div>
        </div>
      </div>

      <ProductList key={listKey} productLedger={productLedger} />
    </div>
  );
};

export default VendorDashboard;