"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRecipient } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Mail,
  Plus,
  Trash2,
  Loader2,
  UserPlus,
  CheckCircle2,
  XCircle,
  MailWarning,
} from "lucide-react";

interface NotificationRecipientsProps {
  recipients: NotificationRecipient[];
  adminId: string;
  organizationId: string;
}

export function NotificationRecipients({ recipients, adminId, organizationId }: NotificationRecipientsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<NotificationRecipient | null>(null);
  
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail.trim()) {
      toast.error("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsAdding(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("notification_recipients")
        .insert({
          email: newEmail.trim().toLowerCase(),
          name: newName.trim() || null,
          added_by: adminId,
          is_active: true,
          organization_id: organizationId,
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already in the list");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Recipient added successfully");
      setNewEmail("");
      setNewName("");
      setShowAddDialog(false);
      
      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast.error("Failed to add recipient");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (recipient: NotificationRecipient) => {
    setTogglingId(recipient.id);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("notification_recipients")
        .update({ is_active: !recipient.is_active })
        .eq("id", recipient.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        recipient.is_active 
          ? "Notifications paused for this recipient" 
          : "Notifications enabled for this recipient"
      );
      
      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast.error("Failed to update recipient");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteClick = (recipient: NotificationRecipient) => {
    setSelectedRecipient(recipient);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecipient) return;

    setDeletingId(selectedRecipient.id);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("notification_recipients")
        .delete()
        .eq("id", selectedRecipient.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Recipient removed");
      setShowDeleteDialog(false);
      setSelectedRecipient(null);
      
      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast.error("Failed to remove recipient");
    } finally {
      setDeletingId(null);
    }
  };

  const activeCount = recipients.filter((r) => r.is_active).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span>
            {activeCount} active recipient{activeCount !== 1 ? "s" : ""}
          </span>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Recipient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleAddRecipient}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Add Notification Recipient
                </DialogTitle>
                <DialogDescription>
                  This person will receive email notifications when new time-off requests are submitted.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="manager@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={isAdding}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name (optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Smith"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={isAdding}
                    autoComplete="name"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adding a name helps identify who this email belongs to.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  disabled={isAdding}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isAdding || !newEmail.trim()}>
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Recipient
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recipients List */}
      {recipients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border/50 rounded-lg">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
            <MailWarning className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">No notification recipients</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-4">
            Add email addresses to receive notifications when staff submit time-off requests.
          </p>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Recipient
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {recipients.map((recipient) => (
            <div
              key={recipient.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border transition-colors ${
                recipient.is_active 
                  ? "bg-card border-border/50" 
                  : "bg-muted/30 border-border/30 opacity-75"
              }`}
            >
              {/* Email and Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${recipient.is_active ? "bg-success" : "bg-muted-foreground"}`} />
                  <span className="font-medium truncate">{recipient.email}</span>
                </div>
                {recipient.name && (
                  <p className="text-sm text-muted-foreground ml-4 truncate">
                    {recipient.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground ml-4 mt-1">
                  Added {format(new Date(recipient.created_at), "MMM d, yyyy")}
                </p>
              </div>

              {/* Status Badge - Mobile */}
              <div className="flex items-center gap-2 sm:hidden">
                {recipient.is_active ? (
                  <span className="text-xs flex items-center gap-1 text-success">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="text-xs flex items-center gap-1 text-muted-foreground">
                    <XCircle className="w-3 h-3" />
                    Paused
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Toggle Switch */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={recipient.is_active}
                    onCheckedChange={() => handleToggleActive(recipient)}
                    disabled={togglingId === recipient.id || isPending}
                    aria-label={recipient.is_active ? "Pause notifications" : "Enable notifications"}
                  />
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {recipient.is_active ? "Active" : "Paused"}
                  </span>
                </div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteClick(recipient)}
                  disabled={deletingId === recipient.id || isPending}
                >
                  {deletingId === recipient.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span className="sr-only">Delete recipient</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Note */}
      {recipients.length > 0 && (
        <p className="text-xs text-muted-foreground">
          💡 Tip: Toggle the switch to temporarily pause notifications for a recipient without removing them.
        </p>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Recipient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium text-foreground">
                {selectedRecipient?.email}
              </span>
              ? They will no longer receive email notifications for new requests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={!!deletingId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

