const AdminPanel = ({
  web3,
  userRegistry,
  account,
  showNotification,
  triggerRefresh,
}) => {
  const addAdminRole = async (role) => {
    if (!userRegistry || !account) {
      showNotification("Admin component not ready.", "error");
      return;
    }

    const address = prompt(`Enter the wallet address for the new ${role}:`);
    // Use web3.utils to check for a valid address
    if (!web3 || !web3.utils.isAddress(address)) {
      showNotification("Invalid Ethereum address provided.", "error");
      return;
    }

    const name = prompt(`Enter the name for the new ${role}:`);
    if (!name || name.trim() === "") {
      showNotification("A name is required.", "error");
      return;
    }

    try {
      showNotification(`Adding ${name} as a ${role}...`, "info");
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
      triggerRefresh(); // Trigger a refresh in parent component
    } catch (err) {
      console.error(`Failed to add ${role}:`, err);
      showNotification(`Error: Could not add ${role}.`, "error");
    }
  };

  return (
    <div className="mt-8 p-6 bg-yellow-100 border-2 border-yellow-400 rounded shadow text-center">
      <h2 className="text-2xl font-semibold text-yellow-800">Admin Panel</h2>
      <p className="mt-2 text-gray-700">
        You are the contract owner. Use these functions to add official
        entities.
      </p>
      <div className="mt-4 flex justify-center flex-wrap gap-4">
        <button
          onClick={() => addAdminRole("Bank")}
          className="px-4 py-2 rounded bg-red-600 text-white"
        >
          Add Bank
        </button>
        <button
          onClick={() => addAdminRole("Insurance")}
          className="px-4 py-2 rounded bg-indigo-600 text-white"
        >
          Add Insurance Co.
        </button>
        <button
          onClick={() => addAdminRole("Verifier")}
          className="px-4 py-2 rounded bg-gray-700 text-white"
        >
          Add Verifier
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
