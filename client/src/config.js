import USER_REGISTRY_ABI from '../../build/contracts/UserRegistry.json'
import PRODUCT_LEDGER_ABI from '../../build/contracts/ProductLedger.json';
import CROP_INSURANCE_ABI from '../../build/contracts/CropInsurance.json';
import LOAN_MATCHING_ABI from '../../build/contracts/LoanMatching.json';

export const USER_REGISTRY_ADDRESS = USER_REGISTRY_ABI.networks["5777"].address;
export const PRODUCT_LEDGER_ADDRESS = PRODUCT_LEDGER_ABI.networks["5777"].address;
export const CROP_INSURANCE_ADDRESS = CROP_INSURANCE_ABI.networks["5777"].address;
export const LOAN_MATCHING_ADDRESS = LOAN_MATCHING_ABI.networks["5777"].address;