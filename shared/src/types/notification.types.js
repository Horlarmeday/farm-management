export var NotificationType;
(function (NotificationType) {
    NotificationType["VACCINATION_REMINDER"] = "vaccination_reminder";
    NotificationType["FEEDING_REMINDER"] = "feeding_reminder";
    NotificationType["HEALTH_ALERT"] = "health_alert";
    NotificationType["STOCK_ALERT"] = "stock_alert";
    NotificationType["MAINTENANCE_REMINDER"] = "maintenance_reminder";
    NotificationType["HARVEST_REMINDER"] = "harvest_reminder";
    NotificationType["PAYMENT_DUE"] = "payment_due";
    NotificationType["TASK_ASSIGNMENT"] = "task_assignment";
    NotificationType["SYSTEM_ALERT"] = "system_alert";
    NotificationType["WEATHER_ALERT"] = "weather_alert";
    NotificationType["REPORT_GENERATED"] = "report_generated";
    NotificationType["USER_REGISTRATION"] = "user_registration";
    NotificationType["PASSWORD_RESET"] = "password_reset";
    NotificationType["PAYROLL_GENERATED"] = "payroll_generated";
    NotificationType["LEAVE_REQUEST"] = "leave_request";
    NotificationType["LEAVE_RESPONSE"] = "leave_response";
    NotificationType["CUSTOM"] = "custom";
})(NotificationType || (NotificationType = {}));
export var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "pending";
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["DELIVERED"] = "delivered";
    NotificationStatus["FAILED"] = "failed";
    NotificationStatus["READ"] = "read";
})(NotificationStatus || (NotificationStatus = {}));
export var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["PENDING"] = "pending";
    DeliveryStatus["SENT"] = "sent";
    DeliveryStatus["DELIVERED"] = "delivered";
    DeliveryStatus["FAILED"] = "failed";
    DeliveryStatus["BOUNCED"] = "bounced";
})(DeliveryStatus || (DeliveryStatus = {}));
export var DeliveryChannel;
(function (DeliveryChannel) {
    DeliveryChannel["EMAIL"] = "email";
    DeliveryChannel["SMS"] = "sms";
    DeliveryChannel["PUSH"] = "push";
    DeliveryChannel["IN_APP"] = "in_app";
})(DeliveryChannel || (DeliveryChannel = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
    TaskStatus["OVERDUE"] = "overdue";
})(TaskStatus || (TaskStatus = {}));
export var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
})(TaskPriority || (TaskPriority = {}));
export var AlertType;
(function (AlertType) {
    AlertType["INFO"] = "info";
    AlertType["WARNING"] = "warning";
    AlertType["ERROR"] = "error";
    AlertType["SUCCESS"] = "success";
})(AlertType || (AlertType = {}));
export var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["LOW"] = "low";
    AlertSeverity["MEDIUM"] = "medium";
    AlertSeverity["HIGH"] = "high";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (AlertSeverity = {}));
export var AlertStatus;
(function (AlertStatus) {
    AlertStatus["ACTIVE"] = "active";
    AlertStatus["ACKNOWLEDGED"] = "acknowledged";
    AlertStatus["RESOLVED"] = "resolved";
    AlertStatus["DISMISSED"] = "dismissed";
})(AlertStatus || (AlertStatus = {}));
//# sourceMappingURL=notification.types.js.map