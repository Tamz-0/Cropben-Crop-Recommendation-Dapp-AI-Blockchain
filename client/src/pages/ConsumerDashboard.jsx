import ProductList from "../components/ProductList";

const ConsumerDashboard = ({ productLedger }) => {
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-2xl font-semibold">Product Traceability</h3>
        <p className="text-gray-600 mt-2">
          Browse all products registered on the blockchain to verify their
          origin and journey.
        </p>
      </div>
      <ProductList productLedger={productLedger} />
    </div>
  );
};

export default ConsumerDashboard;
