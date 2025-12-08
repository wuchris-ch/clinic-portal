"use client";

import { format } from "date-fns";
import type { LeaveRequest, LeaveType, Profile } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, FileText } from "lucide-react";

type RequestWithDetails = LeaveRequest & {
  profiles: Pick<Profile, "id" | "full_name" | "email" | "avatar_url">;
  leave_types: LeaveType;
};

interface RequestsHistoryProps {
  requests: RequestWithDetails[];
}

export function RequestsHistory({ requests }: RequestsHistoryProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-1">No history yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Processed requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Processed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const initials = request.profiles.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();
              const isSameDay = request.start_date === request.end_date;

              return (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.profiles.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.profiles.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.profiles.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: request.leave_types.color }}
                      />
                      <span className="text-sm">{request.leave_types.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {isSameDay ? (
                        format(new Date(request.start_date), "MMM d, yyyy")
                      ) : (
                        <>
                          {format(new Date(request.start_date), "MMM d")} -{" "}
                          {format(new Date(request.end_date), "MMM d, yyyy")}
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>
                    {request.reviewed_at && (
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(request.reviewed_at), "MMM d, yyyy")}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-border/50">
        {requests.map((request) => {
          const initials = request.profiles.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
          const isSameDay = request.start_date === request.end_date;

          return (
            <div key={request.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.profiles.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.profiles.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.profiles.email}
                    </p>
                  </div>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: request.leave_types.color }}
                  />
                  <span>{request.leave_types.name}</span>
                </div>
                <p className="text-muted-foreground">
                  {isSameDay ? (
                    format(new Date(request.start_date), "MMM d, yyyy")
                  ) : (
                    <>
                      {format(new Date(request.start_date), "MMM d")} -{" "}
                      {format(new Date(request.end_date), "MMM d, yyyy")}
                    </>
                  )}
                </p>
                {request.reviewed_at && (
                  <p className="text-xs text-muted-foreground">
                    Processed {format(new Date(request.reviewed_at), "MMM d, yyyy")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1.5 bg-success/10 text-success border-success/30"
      >
        <CheckCircle className="w-3 h-3" />
        Approved
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1.5 bg-destructive/10 text-destructive border-destructive/30"
    >
      <XCircle className="w-3 h-3" />
      Denied
    </Badge>
  );
}

