export var AssetType;
(function (AssetType) {
    AssetType["VEHICLE"] = "vehicle";
    AssetType["MACHINERY"] = "machinery";
    AssetType["EQUIPMENT"] = "equipment";
    AssetType["TOOLS"] = "tools";
    AssetType["FURNITURE"] = "furniture";
    AssetType["BUILDING"] = "building";
    AssetType["LAND"] = "land";
    AssetType["TECHNOLOGY"] = "technology";
    AssetType["OTHER"] = "other";
})(AssetType || (AssetType = {}));
export var AssetStatus;
(function (AssetStatus) {
    AssetStatus["ACTIVE"] = "active";
    AssetStatus["INACTIVE"] = "inactive";
    AssetStatus["MAINTENANCE"] = "maintenance";
    AssetStatus["DISPOSED"] = "disposed";
    AssetStatus["LOST"] = "lost";
})(AssetStatus || (AssetStatus = {}));
export var MaintenanceType;
(function (MaintenanceType) {
    MaintenanceType["PREVENTIVE"] = "preventive";
    MaintenanceType["CORRECTIVE"] = "corrective";
    MaintenanceType["EMERGENCY"] = "emergency";
    MaintenanceType["ROUTINE"] = "routine";
})(MaintenanceType || (MaintenanceType = {}));
export var MaintenanceStatus;
(function (MaintenanceStatus) {
    MaintenanceStatus["SCHEDULED"] = "scheduled";
    MaintenanceStatus["IN_PROGRESS"] = "in_progress";
    MaintenanceStatus["COMPLETED"] = "completed";
    MaintenanceStatus["CANCELLED"] = "cancelled";
    MaintenanceStatus["OVERDUE"] = "overdue";
})(MaintenanceStatus || (MaintenanceStatus = {}));
export var DepreciationMethod;
(function (DepreciationMethod) {
    DepreciationMethod["STRAIGHT_LINE"] = "straight_line";
    DepreciationMethod["DECLINING_BALANCE"] = "declining_balance";
    DepreciationMethod["UNITS_OF_PRODUCTION"] = "units_of_production";
})(DepreciationMethod || (DepreciationMethod = {}));
export var AuxiliaryProductType;
(function (AuxiliaryProductType) {
    AuxiliaryProductType["PAPER_CRATE"] = "paper_crate";
    AuxiliaryProductType["ICE_BLOCK"] = "ice_block";
    AuxiliaryProductType["MANUAL_PACKAGING"] = "manual_packaging";
    AuxiliaryProductType["SERVICE"] = "service";
    AuxiliaryProductType["OTHER"] = "other";
})(AuxiliaryProductType || (AuxiliaryProductType = {}));
//# sourceMappingURL=asset.types.js.map