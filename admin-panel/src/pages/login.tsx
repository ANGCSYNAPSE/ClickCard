import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { adminLogin, clearAuthError } from "@/store/slices/authSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { useRequireGuest } from "@/lib/authGuards";

const schema = Yup.object({
  email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function AdminLogin() {
  useRequireGuest();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (router.query.error === "forbidden") {
      dispatch(pushToast("That account is not an admin.", "error"));
    }
  }, [router.query.error, dispatch]);

  const form = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async (v) => {
      const res = await dispatch(adminLogin({ email: v.email.trim(), password: v.password }));
      if (adminLogin.fulfilled.match(res)) {
        dispatch(pushToast("Welcome, admin.", "success"));
        router.replace("/dashboard");
      }
    },
  });

  return (
    <>
      <Head>
        <title>Admin · ClickCard</title>
        <meta name="robots" content="noindex" />
      </Head>
      <AuthShell title="Admin sign in" subtitle="Restricted area. Admin accounts only.">
        <form onSubmit={form.handleSubmit} className="space-y-4">
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="admin@angc.com"
            leftIcon={<Mail size={18} />}
            value={form.values.email}
            onChange={(e) => { form.handleChange(e); if (error) dispatch(clearAuthError()); }}
            onBlur={form.handleBlur}
            error={form.touched.email && form.errors.email}
            autoFocus
          />
          <Input
            name="password"
            type={showPw ? "text" : "password"}
            label="Password"
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
            rightSlot={
              <button type="button" onClick={() => setShowPw((v) => !v)} className="text-ink/40 hover:text-ink dark:text-white/40" aria-label="Toggle password">
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
            value={form.values.password}
            onChange={(e) => { form.handleChange(e); if (error) dispatch(clearAuthError()); }}
            onBlur={form.handleBlur}
            error={form.touched.password && form.errors.password}
          />
          {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
          <Button type="submit" fullWidth size="lg" loading={status === "loading"}>
            Sign in <ArrowRight size={18} />
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-ink/50 dark:text-white/50">
            <ShieldCheck size={13} /> Secured admin access
          </p>
        </form>
      </AuthShell>
    </>
  );
}
