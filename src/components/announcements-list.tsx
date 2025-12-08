"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pin, Edit, Trash2, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";

interface Announcement {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface AnnouncementsListProps {
  announcements: Announcement[];
  isAdmin: boolean;
}

export function AnnouncementsList({ announcements, isAdmin }: AnnouncementsListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", pinned: false });
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // @ts-ignore
    const { error } = await (supabase as any).from("announcements").insert({
      title: formData.title,
      content: formData.content,
      pinned: formData.pinned,
    } as any);

    if (error) {
      toast.error("Failed to create announcement");
      return;
    }

    toast.success("Announcement created");
    setFormData({ title: "", content: "", pinned: false });
    setIsCreating(false);
    router.refresh();
  };

  const handleUpdate = async (id: string) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // @ts-ignore
    const { error } = await (supabase as any)
      .from("announcements")
      .update({
        title: formData.title,
        content: formData.content,
        pinned: formData.pinned,
      } as any)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update announcement");
      return;
    }

    toast.success("Announcement updated");
    setEditingId(null);
    setFormData({ title: "", content: "", pinned: false });
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete announcement");
      return;
    }

    toast.success("Announcement deleted");
    router.refresh();
  };

  const startEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      pinned: announcement.pinned,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", content: "", pinned: false });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (announcements.length === 0 && !isAdmin) {
    return (
      <div className="text-center py-16">
        <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No announcements at this time.</p>
        <p className="text-gray-400 text-sm mt-2">Check back later for updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Create Button */}
      {isAdmin && (
        <div className="flex justify-end">
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Announcement title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Announcement content..."
                    rows={5}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="pinned"
                    checked={formData.pinned}
                    onCheckedChange={(checked) => setFormData({ ...formData, pinned: checked })}
                  />
                  <Label htmlFor="pinned">Pin to top</Label>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No announcements yet.</p>
          {isAdmin && (
            <p className="text-gray-400 text-sm mt-2">Click &quot;New Announcement&quot; to create one.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className={announcement.pinned ? "border-blue-200 bg-blue-50/30" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {announcement.pinned && (
                      <Pin className="w-4 h-4 text-blue-600" />
                    )}
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  </div>
                  {isAdmin && editingId !== announcement.id && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(announcement)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this announcement? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(announcement.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(announcement.created_at)}
                  {announcement.updated_at !== announcement.created_at && (
                    <span className="ml-2">(edited)</span>
                  )}
                </p>
              </CardHeader>
              <CardContent>
                {editingId === announcement.id ? (
                  <div className="space-y-4">
                    {/* ... editing form ... */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-content">Content</Label>
                      <Textarea
                        id="edit-content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={5}
                      />
                    </div>
                    {/* Note: Image upload not implemented in edit mode yet */}
                    <div className="flex items-center gap-2">
                      <Switch
                        id="edit-pinned"
                        checked={formData.pinned}
                        onCheckedChange={(checked) => setFormData({ ...formData, pinned: checked })}
                      />
                      <Label htmlFor="edit-pinned">Pin to top</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleUpdate(announcement.id)}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcement.image_url && (
                      <div className="rounded-lg overflow-hidden border border-border/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={announcement.image_url}
                          alt={announcement.title}
                          className="w-full h-auto object-cover max-h-[400px]"
                        />
                      </div>
                    )}
                    <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

