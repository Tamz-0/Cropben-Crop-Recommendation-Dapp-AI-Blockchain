// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title UserRegistry
 * @dev Manages user registration, roles, and key data like landholding size.
 */
contract UserRegistry {
    address public owner;

    enum UserRole { Unassigned, Farmer, Vendor, Consumer, Bank, Insurance, Verifier }

    struct User {
        address userAddress;
        string name;
        UserRole role;
        bool isRegistered;
        uint256 landholdingSize; // In acres or hectares
    }

    mapping(address => User) public users;
    //address[] public userAddresses;

    // --- OPTIMIZATION: Arrays to track addresses by role ---
    address[] public farmerAddresses;
    address[] public bankAddresses;
    address[] public insuranceProviderAddresses;
    // Add other role arrays as needed
    // ❗ NEW: Added for consistency
    address[] public verifierAddresses;

    event UserRegistered(address indexed userAddress, string name, UserRole role);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function _registerUser(string memory _name, UserRole _role, uint256 _landSize) internal {
        require(!users[msg.sender].isRegistered, "User is already registered.");
        users[msg.sender] = User(msg.sender, _name, _role, true, _landSize);
        //userAddresses.push(msg.sender);
        if (_role == UserRole.Farmer) {
            farmerAddresses.push(msg.sender);
        } else if (_role == UserRole.Bank) {
            bankAddresses.push(msg.sender);
        } else if (_role == UserRole.Insurance) {
            insuranceProviderAddresses.push(msg.sender);
        }
        emit UserRegistered(msg.sender, _name, _role);
    }

    function registerAsFarmer(string memory _name, uint256 _landSize) public {
        require(_landSize > 0, "Farmer must have land.");
        _registerUser(_name, UserRole.Farmer, _landSize);
    }

    function registerAsVendor(string memory _name) public {
        _registerUser(_name, UserRole.Vendor, 0);
    }

    function registerAsConsumer(string memory _name) public {
        _registerUser(_name, UserRole.Consumer, 0);
    }
    
    function addBank(address _bankAddress, string memory _name) public onlyOwner {
        require(!users[_bankAddress].isRegistered, "Bank is already registered.");
        users[_bankAddress] = User(_bankAddress, _name, UserRole.Bank, true, 0);
        //userAddresses.push(_bankAddress);
        bankAddresses.push(_bankAddress); // Correctly adds to the bank list
        emit UserRegistered(_bankAddress, _name, UserRole.Bank);
    }

    function addInsurance(address _insuranceAddress, string memory _name) public onlyOwner {
        require(!users[_insuranceAddress].isRegistered, "Insurance co. is already registered.");
        users[_insuranceAddress] = User(_insuranceAddress, _name, UserRole.Insurance, true, 0);
        //userAddresses.push(_insuranceAddress);
        insuranceProviderAddresses.push(_insuranceAddress); // Correctly adds to the insurance list
        emit UserRegistered(_insuranceAddress, _name, UserRole.Insurance);
    }
    
    function addVerifier(address _verifierAddress, string memory _name) public onlyOwner {
        require(!users[_verifierAddress].isRegistered, "Verifier is already registered.");
        users[_verifierAddress] = User(_verifierAddress, _name, UserRole.Verifier, true, 0);
        //userAddresses.push(_verifierAddress);
        verifierAddresses.push(_verifierAddress); // Correctly adds to the verifier list
        emit UserRegistered(_verifierAddress, _name, UserRole.Verifier);
    }

    function getUser(address _userAddress) public view returns (User memory) {
        return users[_userAddress];
    }

    // --- OPTIMIZATION: New getter functions ---
    function getBankAddresses() public view returns (address[] memory) {
        return bankAddresses;
    }

    function getInsuranceProviderAddresses() public view returns (address[] memory) {
        return insuranceProviderAddresses;
    }

    /**
    * @dev Gets multiple User structs from an array of addresses.
    * @param _addresses The array of user addresses to fetch.
    * @return An array of User structs.
    */
    function getUsersByAddresses(address[] memory _addresses) public view returns (User[] memory) {
        User[] memory result = new User[](_addresses.length);
        for (uint i = 0; i < _addresses.length; i++) {
            result[i] = users[_addresses[i]];
        }
        return result;
    }
}