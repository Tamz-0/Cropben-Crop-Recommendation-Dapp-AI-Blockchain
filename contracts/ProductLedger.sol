// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./UserRegistry.sol";

contract ProductLedger {
    UserRegistry public userRegistry;
    uint256 public productCounter;

    enum FarmingPractice { Inorganic, Organic }
    enum ProductStage { Sown, Harvested, InTransit, AtVendor, Sold }

    struct ProductCore {
        uint256 id;
        address farmer;
        uint256 sowingDate;
        uint256 harvestDate;
        uint256 quantity;
        FarmingPractice practice;
        bool isVerified;
        ProductStage stage;
        address currentOwner;
        address designatedVendor;
        uint256 farmerSalePrice;
        uint256 vendorSalePrice;
    }

    struct ProductMetadata {
        string name;
        string unit;
        string location;
    }

    struct TraceEvent {
        ProductStage stage;
        address actor;
        uint256 timestamp;
        uint256 price; // Price at this stage (e.g., sale price to next owner)
    }

    mapping(uint256 => ProductCore) public productCores;
    mapping(uint256 => ProductMetadata) public productMetadata;
    mapping(uint256 => TraceEvent[]) public history;
    mapping(address => uint256[]) public verifiedProducts;
    mapping(address => uint256[]) public productIdsByFarmer;

    event ProductSown(uint256 indexed id, string name, address indexed farmer);
    event ProductHarvested(uint256 indexed id);
    event StageUpdated(uint256 indexed id, ProductStage newStage, address indexed newOwner, uint256 price);
    event ProductVerified(uint256 indexed id, address indexed verifier);
    event TransferInitiated(uint256 indexed id, address indexed from, address indexed to, uint256 price);
    event TransferConfirmed(uint256 indexed id, address indexed newOwner);

    uint256 public requiredVerifications;
    mapping(uint256 => uint256) public verificationCount;
    mapping(uint256 => mapping(address => bool)) public hasVerified;

    constructor(address _userRegistryAddress) {
        userRegistry = UserRegistry(_userRegistryAddress);
        requiredVerifications = 3;
    }

    function addSownProduct(string memory _name, FarmingPractice _practice, string memory _location, uint256 _quantity, string memory _unit) public {
        require(userRegistry.getUser(msg.sender).role == UserRegistry.UserRole.Farmer, "Only farmers can add products.");

        productCounter++;

        productCores[productCounter] = ProductCore(
            productCounter,
            msg.sender,
            block.timestamp,
            0,
            _quantity,
            _practice,
            false,
            ProductStage.Sown,
            msg.sender,
            address(0),
            0,
            0
        );

        productMetadata[productCounter] = ProductMetadata(
            _name,
            _unit,
            _location
        );

        productIdsByFarmer[msg.sender].push(productCounter);
        // MODIFIED: Pass 0 as the price for the Sown event.
        _addHistory(productCounter, ProductStage.Sown, 0);
        //_addHistory(productCounter, ProductStage.Sown);
        emit ProductSown(productCounter, _name, msg.sender);
    }

    function updateToHarvested(uint256 _id) public {
        ProductCore storage core = productCores[_id];
        require(core.farmer == msg.sender, "Only the original farmer can log harvest.");
        require(core.stage == ProductStage.Sown, "Product must be in Sown stage.");

        core.stage = ProductStage.Harvested;
        core.harvestDate = block.timestamp;

        _addHistory(_id, ProductStage.Harvested, 0);
        emit ProductHarvested(_id);
    }

    // MODIFIED: This function can now be called by a Farmer OR a Vendor.
    function transferProductToVendor(uint256 _id, address _vendorAddress, uint256 _price) public {
        ProductCore storage core = productCores[_id];
        require(core.currentOwner == msg.sender, "You are not the current owner.");
        // MODIFIED: A product can be transferred if it's Harvested (from farmer) or already AtVendor (from a previous vendor).
        require(core.stage == ProductStage.Harvested || core.stage == ProductStage.AtVendor, "Product must be Harvested or AtVendor to be transferred.");
        require(userRegistry.getUser(_vendorAddress).role == UserRegistry.UserRole.Vendor, "Receiver must be a registered vendor.");
        require(_price > 0, "Price must be greater than zero.");

        core.stage = ProductStage.InTransit;
        core.designatedVendor = _vendorAddress;
        
        // We only set the farmerSalePrice if the original farmer is the one selling.
        if (core.farmer == msg.sender) {
            core.farmerSalePrice = _price;
        }

        // MODIFIED: Pass the transaction price to be recorded in the history.
        _addHistory(_id, ProductStage.InTransit, _price);
        emit TransferInitiated(_id, msg.sender, _vendorAddress, _price);
    }

    function confirmReceipt(uint256 _id) public {
        ProductCore storage core = productCores[_id];
        require(core.stage == ProductStage.InTransit, "Product is not in transit.");
        require(core.designatedVendor == msg.sender, "You are not the designated recipient.");

        core.stage = ProductStage.AtVendor;
        core.currentOwner = msg.sender;
        core.designatedVendor = address(0);

        _addHistory(_id, ProductStage.AtVendor, 0);
        emit TransferConfirmed(_id, msg.sender);
    }

    function updateStageToSold(uint256 _id, uint256 _price) public {
        ProductCore storage core = productCores[_id];
        require(userRegistry.getUser(msg.sender).role == UserRegistry.UserRole.Vendor, "Only vendors can sell products.");
        require(core.currentOwner == msg.sender, "You are not the current owner.");
        require(_price > core.farmerSalePrice, "Sale price must be higher than purchase price.");

        core.stage = ProductStage.Sold;
        core.vendorSalePrice = _price;
        _addHistory(_id, ProductStage.Sold, _price);
        emit StageUpdated(_id, ProductStage.Sold, msg.sender, _price);
    }

    function verifyProduct(uint256 _id) public {
        require(userRegistry.getUser(msg.sender).role == UserRegistry.UserRole.Verifier, "Only verifiers can certify products.");
        require(!hasVerified[_id][msg.sender], "You have already verified this product.");
        hasVerified[_id][msg.sender] = true;
        verificationCount[_id]++;
        if (verificationCount[_id] >= requiredVerifications) {
            productCores[_id].isVerified = true;
        }
        emit ProductVerified(_id, msg.sender);
    }

    // MODIFIED: The internal function now accepts a price.
    function _addHistory(uint256 _id, ProductStage _stage, uint256 _price) internal {
        history[_id].push(TraceEvent({
            stage: _stage,
            actor: msg.sender,
            timestamp: block.timestamp,
            price: _price
        }));
    }

    function getProductCore(uint256 _id) public view returns (ProductCore memory) {
        return productCores[_id];
    }

    function getProductMetadata(uint256 _id) public view returns (ProductMetadata memory) {
        return productMetadata[_id];
    }

    function getProductDetails(uint256 _id) public view returns (ProductCore memory, ProductMetadata memory) {
        return (productCores[_id], productMetadata[_id]);
    }

    function getProductHistory(uint256 _id) public view returns (TraceEvent[] memory) {
        return history[_id];
    }

    function getProductIdsByFarmer(address _farmer) public view returns (uint256[] memory) {
        return productIdsByFarmer[_farmer];
    }

    function getProductsByIds(uint256[] memory _ids) public view returns (ProductCore[] memory, ProductMetadata[] memory) {
        ProductCore[] memory cores = new ProductCore[](_ids.length);
        ProductMetadata[] memory metadata = new ProductMetadata[](_ids.length);
        for (uint i = 0; i < _ids.length; i++) {
            cores[i] = productCores[_ids[i]];
            metadata[i] = productMetadata[_ids[i]];
        }
        return (cores, metadata);
    }

    function getAllProductsForVerifier() public view returns (
        ProductCore[] memory cores_,
        ProductMetadata[] memory metadata_,
        uint256[] memory verificationCounts_,
        bool[] memory userHasVerified_
    ) {
        uint256 count = productCounter;
        cores_ = new ProductCore[](count);
        metadata_ = new ProductMetadata[](count);
        verificationCounts_ = new uint256[](count);
        userHasVerified_ = new bool[](count);

        for (uint i = 1; i <= count; i++) {
            cores_[i-1] = productCores[i];
            metadata_[i-1] = productMetadata[i];
            verificationCounts_[i-1] = verificationCount[i];
            userHasVerified_[i-1] = hasVerified[i][msg.sender];
        }
        return (cores_, metadata_, verificationCounts_, userHasVerified_);
    }

    function getAllProducts() public view returns (ProductCore[] memory, ProductMetadata[] memory) {
        uint256 count = productCounter;
        ProductCore[] memory cores = new ProductCore[](count);
        ProductMetadata[] memory metadata = new ProductMetadata[](count);

        for (uint i = 0; i < count; i++) {
            cores[i] = productCores[i + 1];
            metadata[i] = productMetadata[i + 1];
        }

        return (cores, metadata);
    }
}