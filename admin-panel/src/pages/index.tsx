import { useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { tokenService } from "@/lib/tokenService";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(tokenService.isAuthenticated() ? "/dashboard" : "/login");
  }, [router]);
  return (
    <div className="grid min-h-screen place-items-center bg-mist dark:bg-[#0a0717]">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );
}
