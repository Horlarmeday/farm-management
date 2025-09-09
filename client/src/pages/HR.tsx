import React, { useState } from "react";
import type { UserResponse } from "../../../shared/src/types/user.types";
import { Users, Plus, Search, Filter, Edit, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingTable } from "@/components/ui/loading-card";
import { 
  useUsers, 
  useDepartments, 
  useAttendance, 
  usePayroll, 
  useUserLeaveRequests,
  useUserStats,
  useDeleteUser,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment
} from "@/hooks/useUsers";
import { UserRole } from "../../../shared/src/types/user.types";
import { getUserRoleOptions } from "@/lib/formUtils";

export default function HR() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  
  // Fetch data using hooks
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers({
    search: searchTerm,
    department: selectedDepartment,
    role: selectedRole as UserRole,
    page: 1,
    limit: 50
  });
  
  const { data: departmentsData, isLoading: departmentsLoading } = useDepartments();
  const { data: statsData, isLoading: statsLoading } = useUserStats();
  
  const deleteUserMutation = useDeleteUser();
  
  const users = usersData?.data || [];
  const departments = departmentsData?.data || [];
  const stats = statsData?.data;
  
  const isLoading = usersLoading || departmentsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="max-w-full mx-auto px-6 py-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Users className="h-8 w-8 text-purple-600" />
                Human Resources
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage employees, attendance, payroll, and leave requests
              </p>
            </div>
            <div className="flex space-x-3">
              <Button className="farm-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
        <LoadingTable />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-6 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-8 w-8 text-purple-600" />
              Human Resources
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage employees, attendance, payroll, and leave requests
            </p>
          </div>
          <div className="flex space-x-3">
            <Button className="farm-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search employees..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-3 py-2 border rounded-md"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select 
              className="px-3 py-2 border rounded-md"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            >
              {getUserRoleOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No employees found</p>
              </div>
            ) : (
              users.map((user) => (
                <Card key={user.id} className="farm-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{user.department || 'No Department'}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => deleteUserMutation.mutate(user.id)}
                          disabled={deleteUserMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Email:</span>
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Department:</span>
                        <span className="text-sm">{user.department || 'No department'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Role:</span>
                        <span className="text-sm">{user.role.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge 
                          className={`farm-status-badge ${
                            user.isActive ? "farm-status-success" : "farm-status-warning"
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card className="farm-card">
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-sm text-muted-foreground">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">2</div>
                  <div className="text-sm text-muted-foreground">Late</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">1</div>
                  <div className="text-sm text-muted-foreground">Absent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card className="farm-card">
            <CardHeader>
              <CardTitle>Payroll Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">$12,450</div>
                  <div className="text-sm text-muted-foreground">Total Monthly Payroll</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">$3,200</div>
                  <div className="text-sm text-muted-foreground">Average Salary</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-6">
          <Card className="farm-card">
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "John Smith", type: "Vacation", days: 3, status: "pending" },
                  { name: "Sarah Johnson", type: "Sick Leave", days: 1, status: "approved" },
                ].map((request, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{request.name}</div>
                      <div className="text-sm text-muted-foreground">{request.type} - {request.days} days</div>
                    </div>
                    <Badge 
                      className={`farm-status-badge ${
                        request.status === "approved" ? "farm-status-success" : "farm-status-warning"
                      }`}
                    >
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}