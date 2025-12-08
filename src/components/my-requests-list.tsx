"use client";

import { format } from "date-fns";
import type { LeaveRequest, LeaveType } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CalendarDays, Clock, CheckCircle, XCircle, FileText } from "lucide-react";

type RequestWithType = LeaveRequest & {
  leave_types: LeaveType;
};

interface MyRequestsListProps {
  requests: RequestWithType[];
}

export function MyRequestsList({ requests }: MyRequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-1">No requests yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Submit your first time-off request using the form on the left.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}

function RequestCard({ request }: { request: RequestWithType }) {
  const statusConfig = {
    pending: {
      label: "Pending",
      icon: Clock,
      className: "bg-warning/10 text-warning-foreground border-warning/30",
    },
    approved: {
      label: "Approved",
      icon: CheckCircle,
      className: "bg-success/10 text-success border-success/30",
    },
    denied: {
      label: "Denied",
      icon: XCircle,
      className: "bg-destructive/10 text-destructive border-destructive/30",
    },
  };

  const status = statusConfig[request.status];
  const StatusIcon = status.icon;
  const isSameDay = request.start_date === request.end_date;

  return (
    <Card className="p-4 border-border/50 hover:border-border transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: request.leave_types.color }}
            />
            <span className="font-medium truncate">
              {request.leave_types.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <CalendarDays className="w-4 h-4 flex-shrink-0" />
            {isSameDay ? (
              <span>{format(new Date(request.start_date), "MMM d, yyyy")}</span>
            ) : (
              <span>
                {format(new Date(request.start_date), "MMM d")} -{" "}
                {format(new Date(request.end_date), "MMM d, yyyy")}
              </span>
            )}
          </div>
          {request.reason && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {request.reason}
            </p>
          )}
        </div>
        <Badge
          variant="outline"
          className={`flex items-center gap-1.5 flex-shrink-0 ${status.className}`}
        >
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </Badge>
      </div>
      {request.admin_notes && request.status !== "pending" && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Admin notes:</span> {request.admin_notes}
          </p>
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Submitted {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
    </Card>
  );
}

