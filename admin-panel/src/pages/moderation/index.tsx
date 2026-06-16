import Head from "next/head";
import AdminShell from "@/components/admin/AdminShell";
import ComingSoon from "@/components/app/ComingSoon";

export default function AdminModeration() {
  return (
    <AdminShell title="Moderation">
      <Head><title>Moderation · ClickCard Admin</title></Head>
      <ComingSoon title="Content moderation"
        description="Review reported profiles, approve or reject content, and block abusive URLs. Wired to /api/admin/users/:id/moderate." />
    </AdminShell>
  );
}
