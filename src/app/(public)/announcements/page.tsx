import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Search, ArrowLeft } from "lucide-react";
import { AnnouncementsList } from "@/components/announcements-list";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const supabase = await createClient();

  // Get current user (if logged in)
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user is admin
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    isAdmin = (profile as any)?.role === "admin";
  }

  // Fetch announcements
  const { data: announcements, error } = await supabase
    .from("announcements")
    .select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-blue-500 py-8 rounded-xl shadow-sm">
        <div className="px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Help Center
          </Link>
          <h1 className="text-3xl font-bold text-white">Announcements</h1>
          <p className="text-white/80 mt-2">
            Stay updated with the latest clinic news and updates
          </p>
        </div>
      </div>

      {/* Content */}
      <div>
        <AnnouncementsList
          announcements={announcements || []}
          isAdmin={isAdmin}
        />
      </div>

      {/* Footer link for Dr. Ma */}
      <div className="py-8 text-center border-t border-gray-100 mt-8">
        <a
          href="mailto:sma.eyemd@gmail.com"
          className="text-blue-600 hover:underline text-xs"
        >
          Email Dr. Ma
        </a>
      </div>
    </div>
  );
}

