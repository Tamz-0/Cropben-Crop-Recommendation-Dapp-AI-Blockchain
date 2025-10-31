import { useState, useEffect } from "react";

function RegistrationModal({ role, onClose, onSubmit, currentNickname }) {
  const [formData, setFormData] = useState({
    nickname: "",
    landSize: "",
    toolsOwned: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentNickname) {
      setFormData((prev) => ({ ...prev, nickname: currentNickname }));
    }
  }, [currentNickname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.nickname.trim()) {
      setError("A nickname is required to register.");
      return;
    }
    if (role === "Farmer") {
      if (
        !formData.landSize ||
        isNaN(formData.landSize) ||
        Number(formData.landSize) <= 0
      ) {
        setError("Please enter a valid land size in acres.");
        return;
      }
      if (
        !formData.toolsOwned ||
        isNaN(formData.toolsOwned) ||
        Number(formData.toolsOwned) < 0
      ) {
        setError("Please enter a valid number of tools owned.");
        return;
      }
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Register as a {role}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="nickname"
              className="block text-gray-700 font-semibold mb-2"
            >
              Nickname
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., John Doe"
              required
            />
          </div>

          {role === "Farmer" && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="landSize"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Land Size (in acres)
                </label>
                <input
                  type="number"
                  id="landSize"
                  name="landSize"
                  value={formData.landSize}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 50"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="toolsOwned"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Number of Tools Owned
                </label>
                <input
                  type="number"
                  id="toolsOwned"
                  name="toolsOwned"
                  value={formData.toolsOwned}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 12"
                  min="0"
                  step="1"
                  required
                />
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegistrationModal;
