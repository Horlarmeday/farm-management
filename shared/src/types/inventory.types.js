export var InventoryCategory;
(function (InventoryCategory) {
    InventoryCategory["FEED"] = "feed";
    InventoryCategory["MEDICINE"] = "medicine";
    InventoryCategory["EQUIPMENT"] = "equipment";
    InventoryCategory["SUPPLIES"] = "supplies";
    InventoryCategory["PACKAGING"] = "packaging";
    InventoryCategory["FUEL"] = "fuel";
    InventoryCategory["OTHER"] = "other";
})(InventoryCategory || (InventoryCategory = {}));
export var TransactionType;
(function (TransactionType) {
    TransactionType["PURCHASE"] = "purchase";
    TransactionType["USAGE"] = "usage";
    TransactionType["SALE"] = "sale";
    TransactionType["TRANSFER"] = "transfer";
    TransactionType["ADJUSTMENT"] = "adjustment";
    TransactionType["WASTE"] = "waste";
    TransactionType["RETURN"] = "return";
})(TransactionType || (TransactionType = {}));
export var PurchaseOrderStatus;
(function (PurchaseOrderStatus) {
    PurchaseOrderStatus["DRAFT"] = "draft";
    PurchaseOrderStatus["SUBMITTED"] = "submitted";
    PurchaseOrderStatus["APPROVED"] = "approved";
    PurchaseOrderStatus["PARTIALLY_RECEIVED"] = "partially_received";
    PurchaseOrderStatus["RECEIVED"] = "received";
    PurchaseOrderStatus["CANCELLED"] = "cancelled";
})(PurchaseOrderStatus || (PurchaseOrderStatus = {}));
//# sourceMappingURL=inventory.types.js.map