import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import ProductLedger from "../../../build/contracts/ProductLedger.json";
import UserRegistry from "../../../build/contracts/UserRegistry.json";
import { PRODUCT_LEDGER_ADDRESS, USER_REGISTRY_ADDRESS } from "../config.js";

const PUBLIC_RPC_URL = "http://127.0.0.1:7545";

const stageToString = (stage) => {
  const stages = ["Sown", "Harvested", "In Transit", "At Vendor", "Sold"];
  return stages[Number(stage)] || "Unknown";
};

const ProductPublicView = () => {
  const { productId } = useParams();
  const [productCore, setProductCore] = useState(null);
  const [productMeta, setProductMeta] = useState(null);
  const [history, setHistory] = useState([]);
  const [actorNames, setActorNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;
      try {
        const web3 = new Web3(new Web3.providers.HttpProvider(PUBLIC_RPC_URL));
        const productLedger = new web3.eth.Contract(
          ProductLedger.abi,
          PRODUCT_LEDGER_ADDRESS
        );
        const userRegistry = new web3.eth.Contract(
          UserRegistry.abi,
          USER_REGISTRY_ADDRESS
        );

        const [details, historyEvents] = await Promise.all([
          productLedger.methods.getProductDetails(productId).call(),
          productLedger.methods.getProductHistory(productId).call(),
        ]);

        const core = details[0];
        const meta = details[1];

        if (Number(core.id) === 0) {
          throw new Error("Product not found.");
        }
        setProductCore(core);
        setProductMeta(meta);
        const reversedHistory = [...historyEvents].reverse();
        setHistory(reversedHistory);

        const addressesToFetch = new Set([
          core.farmer,
          core.currentOwner,
          ...reversedHistory.map((event) => event.actor),
        ]);
        const uniqueAddresses = Array.from(addressesToFetch);

        const namePromises = uniqueAddresses.map((address) =>
          userRegistry.methods.getUser(address).call()
        );
        const userResults = await Promise.all(namePromises);

        const namesMap = userResults.reduce((acc, user) => {
          if (user && user.isRegistered) {
            acc[user.userAddress] = user.name;
          }
          return acc;
        }, {});

        setActorNames(namesMap);
      } catch (err) {
        console.error("Failed to fetch product data:", err);
        setError(
          "Could not find or load data for this product. Please check the Product ID."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  if (loading)
    return (
      <div className="text-center p-10">
        Loading product data from the blockchain...
      </div>
    );
  if (error)
    return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!productCore || !productMeta) return null;

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {productMeta.name}
        </h1>
        <p className="text-gray-600 mb-6">
          Product ID:
          <span className="font-mono bg-gray-200 px-2 py-1 rounded">
            {String(productCore.id)}
          </span>
        </p>
        <div className="space-y-4 text-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <p>
              <strong>Current Status:</strong>
              <span className="font-semibold text-blue-600">
                {stageToString(productCore.stage)}
              </span>
            </p>
            <p>
              <strong>Farming Practice:</strong>
              {Number(productCore.practice) === 1 ? "Organic" : "Inorganic"}
            </p>
            <p>
              <strong>Harvest Location:</strong> {productMeta.location}
            </p>
            <p>
              <strong>Quantity:</strong> {String(productCore.quantity)}
              {productMeta.unit}
            </p>
            <p>
              <strong>Sowing Date:</strong>
              {new Date(
                Number(productCore.sowingDate) * 1000
              ).toLocaleDateString("en-IN")}
            </p>
            {Number(productCore.harvestDate) > 0 ? (
              <p>
                <strong>Harvest Date:</strong>
                {new Date(
                  Number(productCore.harvestDate) * 1000
                ).toLocaleDateString("en-IN")}
              </p>
            ) : (
              <p>
                <strong>Harvest Date:</strong> Not Harvested Yet
              </p>
            )}
            <p>
              <strong>Verified:</strong>
              {productCore.isVerified ? (
                <span className="text-green-600 font-bold">Yes ✅</span>
              ) : (
                <span className="text-red-600 font-bold">No ❌</span>
              )}
            </p>
          </div>
          <div className="border-t pt-4 mt-4 space-y-2">
            <p className="break-words">
              <strong>Farmer:</strong>
              <span
                className="font-mono text-sm ml-2"
                title={productCore.farmer}
              >
                {actorNames[productCore.farmer] || productCore.farmer}
              </span>
            </p>
            <p className="break-words">
              <strong>Current Owner:</strong>
              <span
                className="font-mono text-sm ml-2"
                title={productCore.currentOwner}
              >
                {actorNames[productCore.currentOwner] ||
                  productCore.currentOwner}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Product Journey
          </h2>
          {history.length > 0 ? (
            <div className="space-y-6">
              {history.map((event, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        index === 0
                          ? "bg-blue-500 animate-pulse"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    {index < history.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-300"></div>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md flex-1">
                    <p className="font-bold text-gray-900">
                      {stageToString(event.stage)}
                    </p>
                    {Number(event.price) > 0 && (
                      <p className="font-semibold text-green-700 text-lg">
                        Sale Price: ₹{String(event.price)}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {new Date(Number(event.timestamp) * 1000).toLocaleString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                    <p
                      className="text-xs text-gray-500 font-mono break-words"
                      title={event.actor}
                    >
                      By:
                      {actorNames[event.actor] || event.actor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No history available for this product.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPublicView;
