"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Shield, User, Clock, CheckCircle } from "lucide-react";

type EmployeeWithCounts = Profile & {
  pendingCount: number;
  approvedCount: number;
};

interface EmployeesListProps {
  employees: EmployeeWithCounts[];
  currentUserId: string;
}

export function EmployeesList({ employees, currentUserId }: EmployeesListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithCounts | null>(null);
  const [newRole, setNewRole] = useState<"staff" | "admin">("staff");

  const handleRoleChange = (employee: EmployeeWithCounts, role: "staff" | "admin") => {
    setSelectedEmployee(employee);
    setNewRole(role);
    setShowRoleDialog(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedEmployee) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("profiles")
        .update({ role: newRole })
        .eq("id", selectedEmployee.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(`${selectedEmployee.full_name} is now ${newRole === "admin" ? "an Administrator" : "Staff"}`);
      setShowRoleDialog(false);
      router.refresh();
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-center">Pending</TableHead>
              <TableHead className="text-center">Approved</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => {
              const initials = employee.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();
              const isCurrentUser = employee.id === currentUserId;

              return (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {employee.full_name}
                          {isCurrentUser && (
                            <span className="text-xs text-muted-foreground">(You)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={employee.role} />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-warning-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-medium">{employee.pendingCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-success">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="font-medium">{employee.approvedCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isCurrentUser}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {employee.role === "staff" ? (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(employee, "admin")}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(employee, "staff")}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Remove Admin
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {employees.map((employee) => {
          const initials = employee.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
          const isCurrentUser = employee.id === currentUserId;

          return (
            <div
              key={employee.id}
              className="p-4 rounded-lg border border-border/50"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={employee.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {employee.full_name}
                      {isCurrentUser && (
                        <span className="text-xs text-muted-foreground">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {employee.email}
                    </p>
                  </div>
                </div>
                <RoleBadge role={employee.role} />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-warning-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{employee.pendingCount} pending</span>
                </div>
                <div className="flex items-center gap-1.5 text-success">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{employee.approvedCount} approved</span>
                </div>
              </div>
              {!isCurrentUser && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      handleRoleChange(
                        employee,
                        employee.role === "staff" ? "admin" : "staff"
                      )
                    }
                  >
                    {employee.role === "staff" ? (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Make Admin
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 mr-2" />
                        Remove Admin
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {newRole === "admin"
                ? `make ${selectedEmployee?.full_name} an Administrator`
                : `remove Admin privileges from ${selectedEmployee?.full_name}`}
              ?
              {newRole === "admin" && (
                <span className="block mt-2 text-warning-foreground">
                  Administrators can approve/deny requests and manage staff.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return (
      <Badge
        variant="outline"
        className="bg-primary/10 text-primary border-primary/30"
      >
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-muted text-muted-foreground">
      <User className="w-3 h-3 mr-1" />
      Staff
    </Badge>
  );
}

