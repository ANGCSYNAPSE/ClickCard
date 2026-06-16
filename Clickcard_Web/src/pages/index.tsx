import { useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { tokenService } from "@/lib/tokenService";

/** App entry — route to the dashboard when signed in, else to login. */
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(tokenService.isAuthenticated() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="grid min-h-screen place-items-center bg-mist dark:bg-[#0c0820]">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );
}
