// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./UserRegistry.sol";

contract LoanMatching {
    UserRegistry public userRegistry;
    uint256 public applicationCounter;

    struct LoanApplication {
        uint256 id;
        address farmer;
        address bank;
        uint256 amount;
        uint256 insurancePolicyId;
        LoanStatus status;
    }

    // Define a view struct
struct LoanApplicationView {
    LoanApplication application;
    string bankName;
}

    enum LoanStatus { Pending, Approved, Disbursed, Repaid, Rejected }

    mapping(uint256 => LoanApplication) public applications;

    event LoanApplied(uint256 indexed appId, address indexed farmer, address indexed bank);
    event LoanStatusUpdated(uint256 indexed appId, LoanStatus newStatus);

    // --- OPTIMIZATION: Mapping from farmer address to their application IDs ---
    mapping(address => uint256[]) public applicationIdsByFarmer;

    constructor(address _registryAddress) {
        userRegistry = UserRegistry(_registryAddress);
    }

    function applyForLoan(address _bank, uint256 _amount, uint256 _insurancePolicyId) public {
        require(userRegistry.getUser(msg.sender).role == UserRegistry.UserRole.Farmer, "Only farmers can apply.");
        require(userRegistry.getUser(_bank).role == UserRegistry.UserRole.Bank, "Invalid bank address.");
        
        applicationCounter++;
        applications[applicationCounter] = LoanApplication(
            applicationCounter, msg.sender, _bank, _amount, _insurancePolicyId, LoanStatus.Pending
        );

        // --- MODIFICATION: Add the new application ID to the farmer's list ---
        applicationIdsByFarmer[msg.sender].push(applicationCounter);

        emit LoanApplied(applicationCounter, msg.sender, _bank);
    }

    function updateLoanStatus(uint256 _appId, LoanStatus _newStatus) public {
        LoanApplication storage app = applications[_appId];
        require(app.bank == msg.sender, "You are not the bank for this application.");
        
        app.status = _newStatus;
        emit LoanStatusUpdated(_appId, _newStatus);
    }

    // --- OPTIMIZATION: New function to get all application IDs for a farmer ---
    function getApplicationIdsByFarmer(address _farmer) public view returns (uint256[] memory) {
        return applicationIdsByFarmer[_farmer];
    }


    
    function getApplicationsAndBankNamesByFarmer(address _farmer)
    public
    view
    returns (LoanApplicationView[] memory)
    {
        uint256[] memory appIds = applicationIdsByFarmer[_farmer];
        LoanApplicationView[] memory views = new LoanApplicationView[](appIds.length);

        for (uint i = 0; i < appIds.length; i++) {
            LoanApplication storage app = applications[appIds[i]];
            views[i] = LoanApplicationView({
                application: app,
                bankName: userRegistry.getUser(app.bank).name
            });
        }
        return views;
    }
}