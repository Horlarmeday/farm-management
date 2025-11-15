export var ReportType;
(function (ReportType) {
    ReportType["PRODUCTION"] = "production";
    ReportType["FINANCIAL"] = "financial";
    ReportType["INVENTORY"] = "inventory";
    ReportType["HR"] = "hr";
    ReportType["CUSTOM"] = "custom";
})(ReportType || (ReportType = {}));
export var ReportStatus;
(function (ReportStatus) {
    ReportStatus["GENERATING"] = "generating";
    ReportStatus["COMPLETED"] = "completed";
    ReportStatus["FAILED"] = "failed";
})(ReportStatus || (ReportStatus = {}));
export var ReportFormat;
(function (ReportFormat) {
    ReportFormat["PDF"] = "pdf";
    ReportFormat["EXCEL"] = "excel";
    ReportFormat["CSV"] = "csv";
    ReportFormat["JSON"] = "json";
})(ReportFormat || (ReportFormat = {}));
export var ExportStatus;
(function (ExportStatus) {
    ExportStatus["PENDING"] = "pending";
    ExportStatus["PROCESSING"] = "processing";
    ExportStatus["COMPLETED"] = "completed";
    ExportStatus["FAILED"] = "failed";
    ExportStatus["EXPIRED"] = "expired";
})(ExportStatus || (ExportStatus = {}));
export var TemplateType;
(function (TemplateType) {
    TemplateType["PRODUCTION"] = "production";
    TemplateType["FINANCIAL"] = "financial";
    TemplateType["INVENTORY"] = "inventory";
    TemplateType["HR"] = "hr";
    TemplateType["CUSTOM"] = "custom";
})(TemplateType || (TemplateType = {}));
//# sourceMappingURL=reporting.types.js.map