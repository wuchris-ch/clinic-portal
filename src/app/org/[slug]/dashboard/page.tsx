import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function OrgDashboardPage({ params }: PageProps) {
    const { slug } = await params;
    // Redirect to the day-off form as the default dashboard view
    redirect(`/org/${slug}/dashboard/day-off`);
}
