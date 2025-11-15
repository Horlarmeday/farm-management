export var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    PaymentMethod["CHEQUE"] = "cheque";
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["MOBILE_MONEY"] = "mobile_money";
    PaymentMethod["OTHER"] = "other";
})(PaymentMethod || (PaymentMethod = {}));
export var FinanceTransactionType;
(function (FinanceTransactionType) {
    FinanceTransactionType["INCOME"] = "income";
    FinanceTransactionType["EXPENSE"] = "expense";
})(FinanceTransactionType || (FinanceTransactionType = {}));
export var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "draft";
    InvoiceStatus["PENDING"] = "pending";
    InvoiceStatus["SENT"] = "sent";
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["OVERDUE"] = "overdue";
    InvoiceStatus["CANCELLED"] = "cancelled";
})(InvoiceStatus || (InvoiceStatus = {}));
export var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PARTIAL"] = "partial";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["OVERDUE"] = "overdue";
    PaymentStatus["CANCELLED"] = "cancelled";
})(PaymentStatus || (PaymentStatus = {}));
export var AccountType;
(function (AccountType) {
    AccountType["BANK"] = "bank";
    AccountType["CASH"] = "cash";
    AccountType["MOBILE_MONEY"] = "mobile_money";
    AccountType["INVESTMENT"] = "investment";
    AccountType["OTHER"] = "other";
})(AccountType || (AccountType = {}));
export var BudgetPeriod;
(function (BudgetPeriod) {
    BudgetPeriod["MONTHLY"] = "monthly";
    BudgetPeriod["QUARTERLY"] = "quarterly";
    BudgetPeriod["YEARLY"] = "yearly";
})(BudgetPeriod || (BudgetPeriod = {}));
export var BudgetStatus;
(function (BudgetStatus) {
    BudgetStatus["DRAFT"] = "draft";
    BudgetStatus["ACTIVE"] = "active";
    BudgetStatus["COMPLETED"] = "completed";
    BudgetStatus["CANCELLED"] = "cancelled";
})(BudgetStatus || (BudgetStatus = {}));
//# sourceMappingURL=finance.types.js.map