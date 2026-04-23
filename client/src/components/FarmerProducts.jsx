import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

const stageToString = (stage) => {
  const stages = ["Sown", "Harvested", "In Transit", "At Vendor", "Sold"];
  return stages[Number(stage)] || "Unknown";
};

const FarmerProducts = ({
  productLedger,
  cropInsurance,
  account,
  userRegistry,
  showNotification,
  refreshTrigger,
  allAccounts,
}) => {
  // Form State
  const [productName, setProductName] = useState("");
  const [practice, setPractice] = useState(0);
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [formLoading, setFormLoading] = useState(false);

  // Product List State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // State for Insurance Quote Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState(null);

  // State for Insurance Provider Selection
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [insuranceProviders, setInsuranceProviders] = useState([]);
  const [selectedProviderAddress, setSelectedProviderAddress] = useState("");

  // State for Transfer to Vendor Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [productToTransfer, setProductToTransfer] = useState(null);
  const [vendorAddress, setVendorAddress] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [salePrice, setSalePrice] = useState("");

  // State to manage the QR code modal
  const [qrCodeProductId, setQrCodeProductId] = useState(null);

  const [farmerLandSize, setFarmerLandSize] = useState(0);
  const [irrigationUsed, setIrrigationUsed] = useState(true); 

  const fetchProducts = async () => {
    if (!productLedger || !account) return;
    setProductsLoading(true);
    try {
      const productIds = await productLedger.methods
        .getProductIdsByFarmer(account)
        .call();

      if (productIds && productIds.length > 0) {
        const productData = await productLedger.methods
          .getProductsByIds(productIds)
          .call();
        const cores = productData[0];
        const metadata = productData[1];

        const fetchedProducts = cores.map((core, index) => ({
          ...core,
          ...metadata[index],
        }));

        setProducts(fetchedProducts.reverse());
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching farmer products:", err);
      showNotification("Could not fetch your product list.", "error");
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchInsuranceProviders = async () => {
    if (!userRegistry) {
      console.warn("UserRegistry contract not available.");
      return;
    }
    try {
      const providerAddresses = await userRegistry.methods
        .getInsuranceProviderAddresses()
        .call();

      if (providerAddresses.length > 0) {
        const fetchedProvidersData = await userRegistry.methods
          .getUsersByAddresses(providerAddresses)
          .call();

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
      showNotification("Could not fetch list of insurers.", "error");
    }
  };

  useEffect(() => {
    const fetchFarmerDetails = async () => {
      if (!userRegistry || !account) return;
      try {
        const userDetails = await userRegistry.methods.getUser(account).call();
        setFarmerLandSize(Number(userDetails.landholdingSize));
      } catch (err) {
        console.error("Error fetching farmer details:", err);
        showNotification("Could not fetch farmer profile data.", "error");
      }
    };

    fetchProducts();
    fetchInsuranceProviders();
    fetchFarmerDetails(); 
  }, [productLedger, userRegistry, account, refreshTrigger]);

  const handleLogSownProduct = async (e) => {
    e.preventDefault();
    if (!productName || !location || !quantity || !unit) {
      showNotification("Please fill all fields.", "error");
      return;
    }
    setFormLoading(true);
    try {
      await productLedger.methods
        .addSownProduct(productName, practice, location, quantity, unit)
        .send({ from: account });
      showNotification("Sown product logged successfully! 🌱", "success");
      setProductName("");
      setLocation("");
      setQuantity("");
      fetchProducts();
    } catch (err) {
      console.error("Error logging sown product:", err);
      showNotification("Failed to log product.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleHarvest = async (productId) => {
    try {
      await productLedger.methods
        .updateToHarvested(productId)
        .send({ from: account });
      showNotification(
        `Product #${productId} marked as Harvested! 🌾`,
        "success"
      );
      fetchProducts();
    } catch (err) {
      console.error("Error harvesting product:", err);
      showNotification("Failed to update stage to Harvested.", "error");
    }
  };

  const openTransferModal = (product) => {
    setProductToTransfer(product);
    setIsTransferModalOpen(true);
    setVendorAddress("");
    setSalePrice("");
  };

  const handleTransferToVendor = async () => {
    if (
      !productToTransfer ||
      !vendorAddress ||
      !salePrice ||
      Number(salePrice) <= 0
    ) {
      showNotification(
        "Please enter a valid vendor address and a sale price greater than zero.",
        "error"
      );
      return;
    }
    setTransferLoading(true);
    try {
      await productLedger.methods
        .transferProductToVendor(productToTransfer.id, vendorAddress, salePrice)
        .send({ from: account });

      showNotification(
        `Transfer initiated for Product #${productToTransfer.id}! 🚚`,
        "success"
      );
      setIsTransferModalOpen(false);
      setProductToTransfer(null);
      fetchProducts();
    } catch (err) {
      console.error("Error initiating transfer:", err);
      showNotification(
        "Failed to initiate transfer. Check the address and permissions.",
        "error"
      );
    } finally {
      setTransferLoading(false);
    }
  };

  const openProviderSelectionModal = (product) => {
    setSelectedProductForQuote(product);
    setIsProviderModalOpen(true);
  };

  const handleGetQuote = async () => {
    if (!selectedProductForQuote || !selectedProviderAddress) {
      showNotification(
        "Please select a product and an insurance provider.",
        "error"
      );
      return;
    }

    if (farmerLandSize <= 0) {
      showNotification(
        "Farmer land size is missing or invalid (must be > 0). Cannot get quote. Please check your user profile.",
        "error"
      );
      console.error("Farmer land size is 0 or not loaded.", farmerLandSize);
      return;
    }

    setIsProviderModalOpen(false);
    setQuoteLoading(true);
    showNotification(
      `Getting insurance quote for Product #${selectedProductForQuote.id}...`,
      "info"
    );

    try {
      const url = "http://localhost:5000/insurance/estimate";
      const providerDetails = insuranceProviders.find(
        (p) => p.address === selectedProviderAddress
      );

      const sowingTimestamp = Number(selectedProductForQuote.sowingDate) * 1000;
      const sowingMonth = new Date(sowingTimestamp).getMonth() + 1;

      const payload = {
        cropType: selectedProductForQuote.name,
        areaHa: farmerLandSize, 
        farmingMethod:
          Number(selectedProductForQuote.practice) === 1
            ? "Organic"
            : "Conventional",
        district: selectedProductForQuote.location,
        sowing_month: sowingMonth,
        irrigatonUsed: irrigationUsed, 
      };

      console.log("Sending payload to insurance API:", payload);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error("API Error Response:", errText);
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const quoteResult = await response.json();
      console.log("Received quote:", quoteResult);
      quoteResult.providerName = providerDetails
        ? providerDetails.name
        : "Unknown Provider";
      quoteResult.providerAddress = selectedProviderAddress;

      setCurrentQuote(quoteResult);
      setIsQuoteModalOpen(true);
    } catch (err) {
      console.error("Error getting insurance quote:", err);
      showNotification(
        "Failed to get insurance quote from the server.",
        "error"
      );
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleAcceptQuote = async () => {
    if (
      !cropInsurance ||
      !currentQuote ||
      !currentQuote.prediction ||
      !currentQuote.providerAddress ||
      !selectedProductForQuote
    ) {
      showNotification(
        "Error: Missing required quote data to accept.",
        "error"
      );
      return;
    }
    const insuranceProviderAddress = currentQuote.providerAddress;

    const {
      sum_insured, // INR
      farmer_pays_wei,
      govt_subsidy_wei,
      total_actuarial_premium_wei,
      risk_score,
      season,
      conversion_rate_eth_inr,
    } = currentQuote.prediction;

    // Calculate sumInsuredWei
    const sumInsuredWei =
      (BigInt(Math.round(sum_insured * 100)) * 10n ** 18n) /
      BigInt(Math.round(conversion_rate_eth_inr * 100));

    showNotification(
      `Submitting your policy request to the blockchain...`,
      "info"
    );
    try {
      await cropInsurance.methods
        .requestPolicy(
          selectedProductForQuote.id,
          sumInsuredWei.toString(), // _sumInsuredWei
          Math.round(sum_insured), // _sumInsuredInr
          farmer_pays_wei.toString(), // _premiumWei
          insuranceProviderAddress,
          govt_subsidy_wei.toString(),
          total_actuarial_premium_wei.toString(),
          risk_score,
          season
        )
        .send({ from: account });

      showNotification(
        "Policy request submitted! Awaiting insurer approval.",
        "success"
      );
      setIsQuoteModalOpen(false);
      setCurrentQuote(null);
    } catch (err) {
      console.error("Error requesting policy:", err);
      showNotification("Failed to submit policy request.", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4">Log New Sown Product</h3>
        <form onSubmit={handleLogSownProduct} className="space-y-4">
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Crop Name (e.g., Ponni Rice)"
            className="border p-2 rounded w-full"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Farm Location (e.g., Katpadi, Vellore)"
            className="border p-2 rounded w-full"
          />
          <div className="flex gap-4">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Estimated Quantity"
              className="border p-2 rounded w-full"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="border p-2 rounded bg-gray-50"
            >
              <option value="kg">kg</option>
              <option value="tonnes">tonnes</option>
            </select>
          </div>
          <select
            value={practice}
            onChange={(e) => setPractice(Number(e.target.value))}
            className="border p-2 rounded w-full bg-white"
          >
            <option value={0}>Inorganic</option>
            <option value={1}>Organic</option>
          </select>
          <button
            type="submit"
            disabled={formLoading}
            className="w-full px-4 py-2 rounded bg-green-600 text-white disabled:bg-gray-400"
          >
            {formLoading ? "Processing..." : "Log Sown Product"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-2xl font-semibold mb-4">Your On-Chain Products</h3>
        {productsLoading ? (
          <p>Loading products...</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-gray-50 p-4 rounded-lg shadow space-y-2"
              >
                <p className="font-bold text-lg">
                  {p.name}
                  <span className="font-mono text-sm text-gray-500">
                    (ID: {String(p.id)})
                  </span>
                </p>
                <p>
                  <strong>Stage:</strong> {stageToString(p.stage)}
                </p>
                <p>
                  <strong>Quantity:</strong> {String(p.quantity)} {p.unit}
                </p>

                {Number(p.stage) === 0 && (
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => handleHarvest(p.id)}
                      className="w-full px-4 py-2 rounded bg-yellow-500 text-white"
                    >
                      Mark as Harvested
                    </button>
                    <button
                      onClick={() => openProviderSelectionModal(p)}
                      className="w-full px-4 py-2 rounded bg-blue-500 text-white"
                      disabled={
                        quoteLoading && selectedProductForQuote?.id === p.id
                      }
                    >
                      {quoteLoading && selectedProductForQuote?.id === p.id
                        ? "Loading..."
                        : "Get Insurance Quote"}
                    </button>
                  </div>
                )}

                {Number(p.stage) === 1 && (
                  <div className="pt-2">
                    <button
                      onClick={() => openTransferModal(p)}
                      className="w-full px-4 py-2 rounded bg-teal-500 text-white"
                    >
                      Transfer to Vendor
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setQrCodeProductId(p.id)}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800 transition"
                >
                  Generate QR Code
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't logged any products yet.</p>
        )}
      </div>

      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-opacity-80 flex justify-center items-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-2xl font-bold mb-2">
              Transfer Product to Vendor
            </h3>
            <p className="mb-4 text-gray-600">
              Select a vendor from the list or enter their address manually to
              transfer <strong>{productToTransfer?.name}</strong> (ID:
              {String(productToTransfer?.id)}).
            </p>

            <div className="space-y-4">
              <select
                value={vendorAddress}
                onChange={(e) => setVendorAddress(e.target.value)}
                className="border p-2 rounded w-full font-mono"
              >
                <option value="">Select Vendor Address from List</option>
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
                value={vendorAddress}
                onChange={(e) => setVendorAddress(e.target.value)}
                placeholder="Or enter vendor address manually"
                className="border p-2 rounded w-full font-mono"
              />

              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="Sale Price (in INR)"
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 rounded text-gray-700 bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferToVendor}
                disabled={!vendorAddress || !salePrice || transferLoading}
                className="px-4 py-2 rounded text-white bg-teal-600 disabled:bg-gray-400"
                s
              >
                {transferLoading ? "Processing..." : "Confirm Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isProviderModalOpen && (
        <div className="fixed inset-0 bg-opacity-80 flex justify-center items-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-2xl font-bold mb-2">
              Select Insurance Provider
            </h3>
            <p className="mb-4 text-gray-600">
              Choose a company and settings for your quote on
              <strong>{selectedProductForQuote?.name}</strong>.
            </p>
            <div className="space-y-4">
              <select
                value={selectedProviderAddress}
                onChange={(e) => setSelectedProviderAddress(e.target.value)}
                className="border p-2 rounded w-full bg-white"
              >
                {insuranceProviders.length > 0 ? (
                  insuranceProviders.map((provider) => (
                    <option key={provider.address} value={provider.address}>
                      {provider.name}
                    </option>
                  ))
                ) : (
                  <option disabled>
                    No registered insurance providers found
                  </option>
                )}
              </select>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Is irrigation used for this crop?
                </label>
                <select
                  value={String(irrigationUsed)}
                  onChange={(e) => setIrrigationUsed(e.target.value === "true")}
                  className="border p-2 rounded w-full bg-white"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsProviderModalOpen(false)}
                className="px-4 py-2 rounded text-gray-700 bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleGetQuote}
                disabled={!selectedProviderAddress || quoteLoading}
                className="px-4 py-2 rounded text-white bg-blue-600 disabled:bg-gray-400"
              >
                {quoteLoading ? "Getting Quote..." : "Get Quote"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isQuoteModalOpen && currentQuote && currentQuote.prediction && (
        <div className="fixed inset-0 bg-opacity-80 flex justify-center items-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-2xl font-bold mb-2">
              Insurance Quote Received
            </h3>
            <p className="mb-4 text-gray-600">
              Review the offer for your {selectedProductForQuote?.name} (ID:
              {String(selectedProductForQuote?.id)}).
            </p>
            <div className="space-y-3 bg-gray-50 p-4 rounded-md">
              <p>
                <strong>Insurance Provider:</strong> {currentQuote.providerName}
              </p>
              <p>
                <strong>Sum Insured (Coverage):</strong>
                <span className="font-semibold text-green-600">
                  ₹{currentQuote.prediction.sum_insured.toLocaleString()}
                </span>
              </p>
              <hr />
              <p>
                <strong>Total Actuarial Premium:</strong>
                <span className="font-medium text-gray-700">
                  ₹
                  {currentQuote.prediction.total_actuarial_premium_inr.toLocaleString()}
                </span>
              </p>
              <p>
                <strong>Government Subsidy:</strong>
                <span className="font-medium text-blue-600">
                  ₹{currentQuote.prediction.govt_subsidy_inr.toLocaleString()}
                </span>
              </p>
              <p>
                <strong>Your Premium (Farmer Pays):</strong>
                <span className="font-semibold text-red-600 text-lg">
                  ₹{currentQuote.prediction.farmer_pays_inr.toLocaleString()}
                </span>
              </p>
              <hr />
              <p>
                <strong>Risk Score:</strong>
                <span className="font-semibold capitalize">
                  {currentQuote.prediction.risk_score}
                </span>
              </p>
              <p>
                <strong>Sowing Season:</strong>
                <span className="font-semibold capitalize">
                  {currentQuote.prediction.season}
                </span>
              </p>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="px-4 py-2 rounded text-gray-700 bg-gray-200"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptQuote}
                className="px-4 py-2 rounded text-white bg-blue-600"
              >
                Accept & Request Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {qrCodeProductId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-xl font-bold mb-4">
              QR Code for Product #{qrCodeProductId}
            </h3>
            <div className="p-4 border inline-block">
              <QRCodeCanvas
                value={`${window.location.origin}/product/${qrCodeProductId}`}
                size={256}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Scan this code to view public product details.
            </p>
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
