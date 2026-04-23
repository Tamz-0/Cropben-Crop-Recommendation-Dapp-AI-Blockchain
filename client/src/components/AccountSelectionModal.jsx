const AccountSelectionModal = ({ accounts, onSelect, onClose }) => {
  const shortAccount = (acc) =>
    `${acc.substring(0, 6)}...${acc.substring(acc.length - 4)}`;

  return (
    <div
      className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Select an Account
        </h2>
        <div className="flex flex-col space-y-2">
          {accounts.map((acc) => (
            <button
              key={acc}
              onClick={() => onSelect(acc)}
              className="w-full text-left p-3 bg-gray-100 rounded-md hover:bg-blue-100 transition"
            >
              <span className="font-mono text-gray-700">
                {shortAccount(acc)}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AccountSelectionModal;
