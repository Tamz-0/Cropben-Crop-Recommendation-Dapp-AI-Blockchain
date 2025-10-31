// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./UserRegistry.sol";

contract CropInsurance {
    UserRegistry public userRegistry;
    uint256 public policyCounter;

    enum PolicyStatus { PendingApproval, Active, ClaimRequested, ClaimApproved, PaidOut, Expired, Rejected }

    struct Policy {
        uint256 id;
        address farmer;
        address insuranceProvider;
        uint256 productId;
        uint256 sumInsured;
        uint256 premium;
        PolicyStatus status;
    }

    event PolicyRequested(uint256 indexed policyId, address indexed farmer, address indexed provider);
    event PolicyActivated(uint256 indexed policyId);
    event PolicyRejected(uint256 indexed policyId);
    event ClaimRequested(uint256 indexed policyId, address indexed farmer);
    event ClaimApproved(uint256 indexed policyId);
    event PayoutCompleted(uint256 indexed policyId);

    mapping(uint256 => Policy) public policies;

    mapping(address => uint256[]) public policyIdsByFarmer;

    constructor(address _registryAddress) {
        userRegistry = UserRegistry(_registryAddress);
    }

    function requestPolicy(uint256 _productId, uint256 _sumInsured, uint256 _premium, address _insuranceProvider) public {
        require(userRegistry.getUser(msg.sender).role == UserRegistry.UserRole.Farmer, "Only farmers can request policies.");
        require(userRegistry.getUser(_insuranceProvider).role == UserRegistry.UserRole.Insurance, "Invalid insurance provider address.");
        
        policyCounter++;
        policies[policyCounter] = Policy(
            policyCounter, msg.sender, _insuranceProvider, _productId, _sumInsured, _premium, PolicyStatus.PendingApproval
        );

        policyIdsByFarmer[msg.sender].push(policyCounter);

        emit PolicyRequested(policyCounter, msg.sender, _insuranceProvider);
    }

    function approvePolicy(uint256 _policyId) public {
        Policy storage policy = policies[_policyId];
        require(policy.insuranceProvider == msg.sender, "You are not the provider for this policy.");
        require(policy.status == PolicyStatus.PendingApproval, "Policy is not pending approval.");
        
        // In a real dApp, this is where the premium payment from the farmer to the insurer would be handled.
        
        policy.status = PolicyStatus.Active;
        emit PolicyActivated(_policyId);
    }

    function rejectPolicy(uint256 _policyId) public {
        Policy storage policy = policies[_policyId];
        require(policy.insuranceProvider == msg.sender, "You are not the provider for this policy.");
        require(policy.status == PolicyStatus.PendingApproval, "Policy is not pending approval.");
        
        policy.status = PolicyStatus.Rejected;
        emit PolicyRejected(_policyId);
    }
    
    function requestClaim(uint256 _policyId) public {
        Policy storage policy = policies[_policyId];
        require(policy.farmer == msg.sender, "Only the policyholder can request a claim.");
        require(policy.status == PolicyStatus.Active, "Can only file claims on active policies.");

        policy.status = PolicyStatus.ClaimRequested;
        emit ClaimRequested(_policyId, msg.sender);
    }

    function approveClaim(uint256 _policyId) public {
        Policy storage policy = policies[_policyId];
        require(policy.insuranceProvider == msg.sender, "You are not the provider for this policy.");
        require(policy.status == PolicyStatus.ClaimRequested, "Claim must be requested by farmer first.");
        
        policy.status = PolicyStatus.ClaimApproved;
        emit ClaimApproved(_policyId);
    }

    function markAsPaid(uint256 _policyId) public {
        Policy storage policy = policies[_policyId];
        require(policy.insuranceProvider == msg.sender, "You are not the provider for this policy.");
        require(policy.status == PolicyStatus.ClaimApproved, "Claim must be approved first.");

        policy.status = PolicyStatus.PaidOut;
        emit PayoutCompleted(_policyId);
    }

    function getPolicyIdsByFarmer(address _farmer) public view returns (uint256[] memory) {
        return policyIdsByFarmer[_farmer];
    }

    function getPoliciesByFarmer(address _farmer) public view returns (Policy[] memory) {
        uint256[] memory farmerPolicyIds = policyIdsByFarmer[_farmer];
        
        Policy[] memory farmerPolicies = new Policy[](farmerPolicyIds.length);

        for (uint i = 0; i < farmerPolicyIds.length; i++) {
            uint256 policyId = farmerPolicyIds[i];
            farmerPolicies[i] = policies[policyId];
        }

        return farmerPolicies;
    }
}