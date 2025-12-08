"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { LeaveRequest, LeaveType, Profile } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  User,
  Mail,
  FileText,
  Loader2,
  Inbox,
} from "lucide-react";

type RequestWithDetails = LeaveRequest & {
  profiles: Pick<Profile, "id" | "full_name" | "email" | "avatar_url">;
  leave_types: LeaveType;
};

interface PendingRequestsQueueProps {
  requests: RequestWithDetails[];
  adminId: string;
}

export function PendingRequestsQueue({ requests, adminId }: PendingRequestsQueueProps) {
  const router = useRouter();
  const supabase = createClient();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDetails | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const handleApprove = async (request: RequestWithDetails) => {
    setProcessingId(request.id);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("leave_requests")
        .update({
          status: "approved",
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      // Trigger notification
      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          userId: request.user_id,
          type: "approved",
          userEmail: request.profiles.email,
          userName: request.profiles.full_name,
          startDate: request.start_date,
          endDate: request.end_date,
          leaveType: request.leave_types.name,
        }),
      });

      toast.success(`Request approved for ${request.profiles.full_name}`);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDenyClick = (request: RequestWithDetails) => {
    setSelectedRequest(request);
    setAdminNotes("");
    setShowDenyDialog(true);
  };

  const handleDenyConfirm = async () => {
    if (!selectedRequest) return;

    setProcessingId(selectedRequest.id);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("leave_requests")
        .update({
          status: "denied",
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
        })
        .eq("id", selectedRequest.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      // Trigger notification
      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          userId: selectedRequest.user_id,
          type: "denied",
          userEmail: selectedRequest.profiles.email,
          userName: selectedRequest.profiles.full_name,
          startDate: selectedRequest.start_date,
          endDate: selectedRequest.end_date,
          leaveType: selectedRequest.leave_types.name,
          adminNotes,
        }),
      });

      toast.success(`Request denied for ${selectedRequest.profiles.full_name}`);
      setShowDenyDialog(false);
      setSelectedRequest(null);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-success" />
        </div>
        <h3 className="font-medium mb-1">All caught up!</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          There are no pending requests to review at this time.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {requests.map((request) => {
          const initials = request.profiles.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
          const isSameDay = request.start_date === request.end_date;
          const isProcessing = processingId === request.id;

          return (
            <Card
              key={request.id}
              className="p-5 border-border/50 hover:border-primary/30 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.profiles.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {request.profiles.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {request.profiles.email}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1.5 bg-warning/10 text-warning-foreground border-warning/30"
                >
                  Pending
                </Badge>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: request.leave_types.color }}
                  />
                  <span className="text-sm font-medium">
                    {request.leave_types.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="w-4 h-4 flex-shrink-0" />
                  {isSameDay ? (
                    <span>{format(new Date(request.start_date), "EEEE, MMM d, yyyy")}</span>
                  ) : (
                    <span>
                      {format(new Date(request.start_date), "MMM d")} -{" "}
                      {format(new Date(request.end_date), "MMM d, yyyy")}
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{request.reason}</span>
                </div>

                {request.coverage_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>Coverage: {request.coverage_name}</span>
                    {request.coverage_email && (
                      <>
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{request.coverage_email}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Submitted timestamp */}
              <div className="text-xs text-muted-foreground mb-4 pb-4 border-b border-border/50">
                Submitted {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => handleApprove(request)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => handleDenyClick(request)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Deny
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Deny Dialog */}
      <Dialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to deny this time-off request from{" "}
              {selectedRequest?.profiles.full_name}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Reason for denial (optional)
            </label>
            <Textarea
              placeholder="Provide feedback for the employee..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDenyDialog(false)}
              disabled={!!processingId}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDenyConfirm}
              disabled={!!processingId}
            >
              {processingId ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirm Denial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

