// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

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

    address[] public farmerAddresses;
    address[] public bankAddresses;
    address[] public insuranceProviderAddresses;
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
        bankAddresses.push(_bankAddress); 
        emit UserRegistered(_bankAddress, _name, UserRole.Bank);
    }

    function addInsurance(address _insuranceAddress, string memory _name) public onlyOwner {
        require(!users[_insuranceAddress].isRegistered, "Insurance co. is already registered.");
        users[_insuranceAddress] = User(_insuranceAddress, _name, UserRole.Insurance, true, 0);
        insuranceProviderAddresses.push(_insuranceAddress); 
        emit UserRegistered(_insuranceAddress, _name, UserRole.Insurance);
    }
    
    function addVerifier(address _verifierAddress, string memory _name) public onlyOwner {
        require(!users[_verifierAddress].isRegistered, "Verifier is already registered.");
        users[_verifierAddress] = User(_verifierAddress, _name, UserRole.Verifier, true, 0);
        verifierAddresses.push(_verifierAddress); 
        emit UserRegistered(_verifierAddress, _name, UserRole.Verifier);
    }

    function getUser(address _userAddress) public view returns (User memory) {
        return users[_userAddress];
    }

    function getBankAddresses() public view returns (address[] memory) {
        return bankAddresses;
    }

    function getInsuranceProviderAddresses() public view returns (address[] memory) {
        return insuranceProviderAddresses;
    }

    function getUsersByAddresses(address[] memory _addresses) public view returns (User[] memory) {
        User[] memory result = new User[](_addresses.length);
        for (uint i = 0; i < _addresses.length; i++) {
            result[i] = users[_addresses[i]];
        }
        return result;
    }
}