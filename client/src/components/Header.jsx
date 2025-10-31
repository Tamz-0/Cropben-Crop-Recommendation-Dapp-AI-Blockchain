import { useState, useRef, useEffect } from "react";

const Header = ({
  account,
  accounts,
  userRole,
  connectWallet,
  roleToString,
  handleAccountChange,
  disconnectWallet,
  nickname,
  onSetNickname,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = nickname
    ? nickname
    : account
    ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
    : "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAccountSelect = (selectedAccount) => {
    handleAccountChange(selectedAccount);
    setIsDropdownOpen(false);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsDropdownOpen(false);
  };

  const handleSetNicknameClick = () => {
    onSetNickname();
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-md p-3 flex justify-between items-center sticky top-0 z-20">
      <div className="flex items-center">
        <i className="fas fa-leaf text-3xl text-green-600 mr-3"></i>
        <h1 className="text-2xl font-bold text-gray-800">AI-Agrochain</h1>
      </div>
      <div>
        {account ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 transition-colors p-2 rounded-lg cursor-pointer"
            >
              <span className="font-mono text-sm text-gray-800 font-semibold">
                {displayName}
              </span>
              <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-bold">
                {userRole !== null ? roleToString(userRole) : "—"}
              </span>
              <i
                className={`fas fa-chevron-down text-xs text-gray-500 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-30">
                <div className="py-1">
                  <div className="px-4 py-2 text-xs text-gray-500 uppercase">
                    Switch Account
                  </div>
                  {accounts.map((acc) => (
                    <button
                      key={acc}
                      onClick={() => handleAccountSelect(acc)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      {acc === account && (
                        <i className="fas fa-check text-green-500 mr-2"></i>
                      )}
                      <span className="font-mono">{`${acc.substring(
                        0,
                        6
                      )}...${acc.substring(acc.length - 4)}`}</span>
                    </button>
                  ))}
                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={handleSetNicknameClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <i className="fas fa-pencil-alt w-4 text-center mr-2 text-gray-500"></i>
                    <span>{nickname ? "Edit Nickname" : "Set Nickname"}</span>
                  </button>

                  <button
                    onClick={handleDisconnect}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <i className="fas fa-sign-out-alt w-4 text-center mr-2"></i>
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
