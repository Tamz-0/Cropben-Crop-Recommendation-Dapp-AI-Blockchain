import { useState, useEffect } from "react";

const stageToString = (stage) => {
  switch (Number(stage)) {
    case 0:
      return "Sown";
    case 1:
      return "Harvested";
    case 2:
      return "In Transit";
    case 3:
      return "At Vendor";
    case 4:
      return "Sold";
    default:
      return "Unknown";
  }
};

const VerifierDashboard = ({ productLedger, account, showNotification }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchAllProducts = async () => {
    if (!productLedger) return;
    setLoading(true);
    try {
      const result = await productLedger.methods
        .getAllProductsForVerifier()
        .call({ from: account });

      const cores = result[0];
      const metadata = result[1];
      const verificationCounts = result[2];
      const userHasVerifiedFlags = result[3];
      const requiredCount = await productLedger.methods
        .requiredVerifications()
        .call();

      const productsList = cores.map((core, index) => ({
        ...core,
        ...metadata[index],
        id: Number(core.id),
        stage: stageToString(Number(core.stage)),
        practice: Number(core.practice) === 1 ? "Organic" : "Inorganic",
        verificationProgress: `${verificationCounts[index]} / ${requiredCount}`,
        currentUserHasVerified: userHasVerifiedFlags[index],
      }));

      const sortedProducts = productsList.sort(
        (a, b) => Number(b.id) - Number(a.id)
      );
      setAllProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
    } catch (error) {
      console.error("Failed to fetch products for verifier:", error);
      showNotification("Could not fetch products from the ledger.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account && productLedger) {
      fetchAllProducts();
    }
  }, [productLedger, account]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = allProducts.filter(
      (item) =>
        item.name.toLowerCase().includes(lowercasedFilter) ||
        String(item.id).includes(lowercasedFilter) ||
        item.farmer.toLowerCase().includes(lowercasedFilter) ||
        item.practice.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredProducts(filteredData);
  }, [searchTerm, allProducts]);

  const handleVerify = async (productId) => {
    if (!productId) {
      showNotification("Product ID is missing.", "error");
      return;
    }
    setVerifyingId(productId);
    try {
      await productLedger.methods
        .verifyProduct(productId)
        .send({ from: account });
      showNotification(
        `Your verification for Product #${productId} has been submitted.`,
        "success"
      );
      fetchAllProducts();
    } catch (err) {
      console.error("Verification error:", err);
      const errorMessage = err.message.includes("You have already verified")
        ? "You have already cast your vote for this product."
        : "Failed to submit verification.";
      showNotification(errorMessage, "error");
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-600 py-8">
        Loading products from the ledger...
      </p>
    );

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Verifier Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Review and verify products on the ledger.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by Product ID, Name, Farmer, or Practice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">
                    ID
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">
                    Practice
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">
                    Stage
                  </th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 uppercase">
                    Verification Status
                  </th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="py-3 px-4 font-mono text-gray-700">
                        {String(p.id)}
                      </td>
                      <td className="py-3 px-4 font-semibold">{p.name}</td>
                      <td className="py-3 px-4">{p.practice}</td>
                      <td className="py-3 px-4">{stageToString(p.stage)}</td>

                      <td className="py-3 px-4 text-center">
                        {p.isVerified ? (
                          <span className="font-semibold text-green-600">
                            ✅ Verified
                          </span>
                        ) : (
                          <span className="font-mono text-gray-700">
                            {p.verificationProgress}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {p.isVerified ? (
                          <span className="text-green-600 font-semibold">
                            Complete
                          </span>
                        ) : p.currentUserHasVerified ? (
                          <span className="text-gray-500 font-semibold">
                            Voted
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerify(p.id)}
                            disabled={verifyingId === p.id}
                            className="px-3 py-1 text-sm rounded bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-gray-400"
                          >
                            {verifyingId === p.id ? "Submitting..." : "Verify"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifierDashboard;
