import { InventoryCategory } from '@/types/inventory.types';
import type { ExpenseCategory } from '@/types/finance.types';

// Convert InventoryCategory enum to dropdown options
export const getInventoryCategoryOptions = () => {
  return Object.values(InventoryCategory).map((category) => ({
    value: category,
    label: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase().replace('_', ' ')
  }));
};

// Convert ExpenseCategory to dropdown options
export const getExpenseCategoryOptions = (): { value: ExpenseCategory; label: string }[] => {
  const categories: ExpenseCategory[] = [
    'feed', 'medicine', 'veterinary', 'labor', 'utilities', 
    'equipment', 'maintenance', 'transport', 'insurance', 
    'taxes', 'rent', 'other_expense'
  ];
  
  return categories.map((category) => ({
    value: category,
    label: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase().replace('_', ' ')
  }));
};

// Common department/project options for forms
export const getDepartmentOptions = () => [
  { value: 'poultry', label: 'Poultry' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'fishery', label: 'Fishery' },
  { value: 'crops', label: 'Crops' },
  { value: 'general farm', label: 'General Farm' },
  { value: 'infrastructure', label: 'Infrastructure' },
];

export const getEmployeeDepartmentOptions = () => [
  { value: 'operations', label: 'Operations' },
  { value: 'animal_health', label: 'Animal Health' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'administration', label: 'Administration' },
  { value: 'production', label: 'Production' },
  { value: 'sales_marketing', label: 'Sales & Marketing' },
  { value: 'quality_control', label: 'Quality Control' },
];

// Payment method options
export const getPaymentMethodOptions = () => [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other', label: 'Other' },
];

export const getAssetCategoryOptions = () => [
  { value: 'machinery', label: 'Machinery' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'tools', label: 'Tools' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'technology', label: 'Technology' },
];

export const getAssetConditionOptions = () => [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'needs_repair', label: 'Needs Repair' },
];

export const getMaintenanceScheduleOptions = () => [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'biannually', label: 'Bi-annually' },
  { value: 'annually', label: 'Annually' },
];

export const getEmploymentTypeOptions = () => [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'internship', label: 'Internship' },
];

export const getAnimalStatusOptions = () => [
  { value: 'healthy', label: 'Healthy' },
  { value: 'sick', label: 'Sick' },
  { value: 'injured', label: 'Injured' },
  { value: 'pregnant', label: 'Pregnant' },
  { value: 'quarantine', label: 'Quarantine' },
  { value: 'sold', label: 'Sold' },
  { value: 'deceased', label: 'Deceased' },
];

export const getAnimalPurposeOptions = () => [
  { value: 'dairy', label: 'Dairy' },
  { value: 'meat', label: 'Meat' },
  { value: 'breeding', label: 'Breeding' },
  { value: 'draft', label: 'Draft' },
];

export const getSalePaymentMethodOptions = () => [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'check', label: 'Check' },
  { value: 'credit', label: 'Credit' },
];

export const getPaymentStatusOptions = () => [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial Payment' },
  { value: 'overdue', label: 'Overdue' },
];

export const getWaterSourceOptions = () => [
  { value: 'borehole', label: 'Borehole' },
  { value: 'river', label: 'River' },
  { value: 'rainwater', label: 'Rainwater' },
  { value: 'tap', label: 'Tap Water' },
];

export const getPondTypeOptions = () => [
  { value: 'earthen', label: 'Earthen Pond' },
  { value: 'concrete', label: 'Concrete Pond' },
  { value: 'plastic', label: 'Plastic Liner' },
  { value: 'fiberglass', label: 'Fiberglass Tank' },
];

export const getBirdBatchPurposeOptions = () => [
  { value: 'laying', label: 'Laying' },
  { value: 'broiler', label: 'Broiler' },
  { value: 'breeding', label: 'Breeding' },
];

export const getProductTypeOptions = () => [
  { value: 'eggs', label: 'Eggs' },
  { value: 'meat', label: 'Meat' },
  { value: 'fish', label: 'Fish' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'produce', label: 'Produce' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'other', label: 'Other' },
];

export const getUnitOptions = () => [
  { value: 'dozens', label: 'Dozens' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'lbs', label: 'Pounds' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'crates', label: 'Crates' },
  { value: 'bags', label: 'Bags' },
  { value: 'liters', label: 'Liters' },
];

export const getGenderOptions = () => [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const getReportModuleOptions = () => [
  { value: 'all', label: 'All Modules' },
  { value: 'poultry', label: 'Poultry' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'fishery', label: 'Fishery' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'finance', label: 'Finance' },
];

export const getExportFormatOptions = () => [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' }
];

export const getUserRoleOptions = () => [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
  { value: 'viewer', label: 'Viewer' }
];

/**
 * Common project options for expense categorization
 */
export const getProjectOptions = () => {
  return [
    { value: 'poultry_layers', label: 'Poultry - Layers' },
    { value: 'poultry_broilers', label: 'Poultry - Broilers' },
    { value: 'livestock_cattle', label: 'Livestock - Cattle' },
    { value: 'livestock_goats', label: 'Livestock - Goats' },
    { value: 'livestock_sheep', label: 'Livestock - Sheep' },
    { value: 'fishery_tilapia', label: 'Fishery - Tilapia' },
    { value: 'fishery_catfish', label: 'Fishery - Catfish' },
    { value: 'crops_maize', label: 'Crops - Maize' },
    { value: 'crops_vegetables', label: 'Crops - Vegetables' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'general_operations', label: 'General Operations' }
  ];
};