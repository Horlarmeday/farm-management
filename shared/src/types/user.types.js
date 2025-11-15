export var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["PRESENT"] = "present";
    AttendanceStatus["ABSENT"] = "absent";
    AttendanceStatus["LATE"] = "late";
    AttendanceStatus["HALF_DAY"] = "half_day";
})(AttendanceStatus || (AttendanceStatus = {}));
export var PayrollStatus;
(function (PayrollStatus) {
    PayrollStatus["DRAFT"] = "draft";
    PayrollStatus["PENDING"] = "pending";
    PayrollStatus["APPROVED"] = "approved";
    PayrollStatus["PAID"] = "paid";
})(PayrollStatus || (PayrollStatus = {}));
export var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["PENDING"] = "pending";
    UserStatus["SUSPENDED"] = "suspended";
})(UserStatus || (UserStatus = {}));
export var LeaveType;
(function (LeaveType) {
    LeaveType["ANNUAL"] = "annual";
    LeaveType["SICK"] = "sick";
    LeaveType["MATERNITY"] = "maternity";
    LeaveType["PATERNITY"] = "paternity";
    LeaveType["EMERGENCY"] = "emergency";
    LeaveType["UNPAID"] = "unpaid";
    LeaveType["OTHER"] = "other";
})(LeaveType || (LeaveType = {}));
export var LeaveStatus;
(function (LeaveStatus) {
    LeaveStatus["PENDING"] = "pending";
    LeaveStatus["APPROVED"] = "approved";
    LeaveStatus["REJECTED"] = "rejected";
    LeaveStatus["CANCELLED"] = "cancelled";
})(LeaveStatus || (LeaveStatus = {}));
//# sourceMappingURL=user.types.js.map