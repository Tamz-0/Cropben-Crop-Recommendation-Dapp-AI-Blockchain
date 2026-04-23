import { useState } from "react"; 

const AdminPanel = ({
  web3,
  userRegistry,
  account,
  showNotification,
  triggerRefresh,
}) => {
  const [role, setRole] = useState("Bank"); 
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    if (!userRegistry || !account || !web3) {
      showNotification("Admin component not ready.", "error");
      return;
    }
    if (!web3.utils.isAddress(address)) {
      showNotification("Invalid Ethereum address provided.", "error");
      return;
    }
    if (!name || name.trim() === "") {
      showNotification("A name is required.", "error");
      return;
    }

    setIsLoading(true);
    showNotification(`Adding ${name} as a ${role}...`, "info");

    try {
      if (role === "Bank") {
        await userRegistry.methods
          .addBank(address, name)
          .send({ from: account });
      } else if (role === "Insurance") {
        await userRegistry.methods
          .addInsurance(address, name)
          .send({ from: account });
      } else if (role === "Verifier") {
        await userRegistry.methods
          .addVerifier(address, name)
          .send({ from: account });
      }
      
      showNotification(`${role} added successfully!`, "success");
      triggerRefresh(); 
      
      setAddress("");
      setName("");

    } catch (err) {
      console.error(`Failed to add ${role}:`, err);
      showNotification(`Error: Could not add ${role}.`, "error");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="mt-8 p-6 bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-yellow-800 text-center">
        Admin Panel
      </h2>
      <p className="mt-2 text-gray-700 text-center">
        You are the contract owner. Use this form to add official entities.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Select Role to Add
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Bank">Bank</option>
            <option value="Insurance">Insurance Co.</option>
            <option value="Verifier">Verifier</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Wallet Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Entity Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., 'National Bank'"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? `Adding ${role}...` : `Add New ${role}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPanel;