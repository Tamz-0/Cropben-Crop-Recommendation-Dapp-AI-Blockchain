import { useState, useEffect } from "react";
import ProductList from "../components/ProductList";

const VendorDashboard = ({
  productLedger,
  account,
  showNotification,
  allAccounts,
}) => {
  const [pendingReceipts, setPendingReceipts] = useState([]);
  const [loadingReceipts, setLoadingReceipts] = useState(true);
  const [sellProductId, setSellProductId] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);
  const [listKey, setListKey] = useState(Date.now());
  const [finalSalePrice, setFinalSalePrice] = useState("");

  const [transferProductId, setTransferProductId] = useState("");
  const [nextVendorAddress, setNextVendorAddress] = useState("");
  const [nextSalePrice, setNextSalePrice] = useState("");

  const fetchPendingReceipts = async () => {
    if (!productLedger) return;
    setLoadingReceipts(true);
    try {
      const productData = await productLedger.methods.getAllProducts().call();

      const cores = productData[0];
      const metadata = productData[1];

      console.log("Fetched products:", cores, metadata);

      const products = cores.map((core, index) => ({
        ...core,
        ...metadata[index],
        id: Number(core.id),
        stage: Number(core.stage),
      }));

      const pending = products.filter(
        (p) =>
          p.stage === 2 &&
          p.designatedVendor.toLowerCase() === account.toLowerCase()
      );

      setPendingReceipts(pending);
    } catch (err) {
      console.error("Error fetching pending receipts:", err);
      showNotification("Could not fetch products to be confirmed.", "error");
    } finally {
      setLoadingReceipts(false);
    }
  };

  useEffect(() => {
    fetchPendingReceipts();
  }, [productLedger, account, listKey]);

  const handleConfirmReceipt = async (productId) => {
    if (!productId) {
      showNotification("Please select a product to confirm.", "error");
      return;
    }
    setLoadingAction(`confirm-${productId}`);
    try {
      await productLedger.methods
        .confirmReceipt(productId)
        .send({ from: account });
      showNotification(
        `Receipt confirmed for Product #${productId}!`,
        "success"
      );
      setListKey(Date.now());
    } catch (err) {
      console.error("Error confirming receipt:", err);
      showNotification(
        "Confirmation failed. Ensure the product is in transit to you.",
        "error"
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMarkAsSold = async () => {
    if (!sellProductId || !finalSalePrice || Number(finalSalePrice) <= 0) {
      showNotification(
        "Please enter a Product ID and a final sale price.",
        "error"
      );
      return;
    }
    setLoadingAction("sell");
    try {
      await productLedger.methods
        .updateStageToSold(sellProductId, finalSalePrice)
        .send({ from: account });
      showNotification(`Product #${sellProductId} marked as sold.`, "success");
      setSellProductId("");
      setFinalSalePrice("");
      setListKey(Date.now());
    } catch (err) {
      console.error("Error marking as sold:", err);
      showNotification(
        "Action failed. Ensure you are the owner and the price is valid.",
        "error"
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleTransferToNextVendor = async () => {
    if (
      !transferProductId ||
      !nextVendorAddress ||
      !nextSalePrice ||
      Number(nextSalePrice) <= 0
    ) {
      showNotification(
        "Please provide a Product ID, a valid vendor address, and a price.",
        "error"
      );
      return;
    }
    setLoadingAction("transfer");
    try {
      await productLedger.methods
        .transferProductToVendor(
          transferProductId,
          nextVendorAddress,
          nextSalePrice
        )
        .send({ from: account });

      showNotification(
        `Transfer initiated for Product #${transferProductId}!`,
        "success"
      );
      setTransferProductId("");
      setNextVendorAddress("");
      setNextSalePrice("");
      setListKey(Date.now());
    } catch (err) {
      console.error("Error transferring to next vendor:", err);
      showNotification(
        "Transfer failed. Ensure you are the current owner and the address is a registered vendor.",
        "error"
      );
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-2">
            1. Confirm Product Receipt
          </h3>
          <p className="text-gray-600 mb-4">
            Products currently in-transit to you are listed below.
          </p>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {loadingReceipts ? (
              <p>Loading pending receipts...</p>
            ) : pendingReceipts.length > 0 ? (
              pendingReceipts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 border rounded-md flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold">ID: {String(product.id)}</span>
                    <span className="ml-4 text-gray-700">{product.name}</span>
                  </div>
                  <button
                    onClick={() => handleConfirmReceipt(product.id)}
                    className="px-3 py-1 rounded bg-blue-600 text-white flex-shrink-0"
                    disabled={loadingAction === `confirm-${product.id}`}
                  >
                    {loadingAction === `confirm-${product.id}`
                      ? "..."
                      : "Confirm"}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No products are pending receipt.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-2">
            2. Transfer to Next Vendor
          </h3>
          <p className="text-gray-600 mb-4">
            Transfer a product you own to the next vendor in the supply chain.
          </p>
          <div className="space-y-4">
            <input
              value={transferProductId}
              onChange={(e) => setTransferProductId(e.target.value)}
              placeholder="Enter Product ID"
              className="border p-2 rounded w-full"
              type="number"
            />
            <select
              value={nextVendorAddress}
              onChange={(e) => setNextVendorAddress(e.target.value)}
              className="border p-2 rounded w-full font-mono"
            >
              <option value="">Select Vendor Address</option>
              {allAccounts
                .filter((acc) => acc.toLowerCase() !== account.toLowerCase())
                .map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
            </select>

            <input
              type="text"
              value={nextVendorAddress}
              onChange={(e) => setNextVendorAddress(e.target.value)}
              placeholder="Or enter vendor address manually"
              className="border p-2 rounded w-full font-mono"
            />

            <input
              value={nextSalePrice}
              onChange={(e) => setNextSalePrice(e.target.value)}
              placeholder="Sale Price (in INR)"
              className="border p-2 rounded w-full"
              type="number"
            />
            <button
              onClick={handleTransferToNextVendor}
              className="w-full px-4 py-2 rounded bg-teal-600 text-white"
              disabled={loadingAction === "transfer"}
            >
              {loadingAction === "transfer"
                ? "Processing..."
                : "Initiate Transfer"}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-2">
            2. Mark Product as Sold
          </h3>
          <p className="text-gray-600 mb-4">
            After you've received a product, enter its ID here once it has been
            sold to a customer.
          </p>
          <div className="flex items-center space-x-4">
            <input
              value={sellProductId}
              onChange={(e) => setSellProductId(e.target.value)}
              placeholder="Enter Product ID"
              className="border p-2 rounded w-full"
              type="number"
            />
            <input
              value={finalSalePrice}
              onChange={(e) => setFinalSalePrice(e.target.value)}
              placeholder="Final Sale Price (in INR)"
              className="border p-2 rounded w-full"
              type="number"
            />
            <button
              onClick={handleMarkAsSold}
              className="px-4 py-2 rounded bg-purple-600 text-white flex-shrink-0"
              disabled={loadingAction}
            >
              {loadingAction === "sell" ? "Processing..." : "Mark as Sold"}
            </button>
          </div>
        </div>
      </div>

      <ProductList key={listKey} productLedger={productLedger} />
    </div>
  );
};

export default VendorDashboard;
