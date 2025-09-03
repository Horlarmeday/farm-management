// Export all validation schemas from individual modules
export { assetValidations } from './asset.validations';
export { authValidations } from './auth.validations';
export { financeValidations } from './finance.validations';
export { fisheryValidations } from './fishery.validations';
export { inventoryValidations } from './inventory.validations';
export { livestockValidations } from './livestock.validations';
export { notificationValidations } from './notification.validations';
export { poultryValidations } from './poultry.validations';
export { reportingValidations } from './reporting.validations';
export { userValidations } from './user.validations';

// Re-export all validations as a single object for convenience
import { assetValidations } from './asset.validations';
import { authValidations } from './auth.validations';
import { financeValidations } from './finance.validations';
import { fisheryValidations } from './fishery.validations';
import { inventoryValidations } from './inventory.validations';
import { livestockValidations } from './livestock.validations';
import { notificationValidations } from './notification.validations';
import { poultryValidations } from './poultry.validations';
import { reportingValidations } from './reporting.validations';
import { userValidations } from './user.validations';

export const allValidations = {
  auth: authValidations,
  inventory: inventoryValidations,
  poultry: poultryValidations,
  livestock: livestockValidations,
  fishery: fisheryValidations,
  asset: assetValidations,
  finance: financeValidations,
  user: userValidations,
  notification: notificationValidations,
  reporting: reportingValidations,
};
