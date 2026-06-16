import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import SocialButtons from "@/components/auth/SocialButtons";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import OtpInput from "@/components/ui/OtpInput";
import { credentialSchema } from "@/lib/validation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginInitiate, loginVerify, clearAuthError } from "@/store/slices/authSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { useRequireGuest } from "@/lib/authGuards";

export default function LoginPage() {
  useRequireGuest();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);

  const [stage, setStage] = useState<"credential" | "otp">("credential");
  const [credential, setCredential] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (router.query.session === "expired") {
      dispatch(pushToast("Your session expired. Please sign in again.", "info"));
    }
  }, [router.query.session, dispatch]);

  const form = useFormik({
    initialValues: { credential: "" },
    validationSchema: credentialSchema,
    onSubmit: async (values) => {
      const res = await dispatch(loginInitiate(values.credential.trim()));
      if (loginInitiate.fulfilled.match(res)) {
        setCredential(values.credential.trim());
        setStage("otp");
        dispatch(pushToast("We sent a 6-digit code to your email.", "success"));
      }
    },
  });

  const verify = async () => {
    const res = await dispatch(loginVerify({ credential, otp }));
    if (loginVerify.fulfilled.match(res)) {
      dispatch(pushToast("Welcome back!", "success"));
      const redirect = (router.query.redirect as string) || "/dashboard";
      router.replace(redirect);
    }
  };

  return (
    <>
      <Head>
        <title>Log in · ClickCard</title>
        <meta name="robots" content="noindex" />
      </Head>
      <AuthShell
        title={stage === "credential" ? "Welcome back" : "Enter your code"}
        subtitle={
          stage === "credential"
            ? "Sign in with a one-time code — no password needed."
            : `We sent a 6-digit code to ${credential}.`
        }
      >
        {stage === "credential" ? (
          <>
            <form onSubmit={form.handleSubmit} className="space-y-4">
              <Input
                name="credential"
                placeholder="you@example.com or username"
                leftIcon={<Mail size={18} />}
                value={form.values.credential}
                onChange={(e) => {
                  form.handleChange(e);
                  if (error) dispatch(clearAuthError());
                }}
                onBlur={form.handleBlur}
                error={form.touched.credential && form.errors.credential}
                autoComplete="username"
                autoFocus
              />
              {error && (
                <p className="text-xs font-semibold text-rose-500">{error}</p>
              )}
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={status === "loading"}
              >
                Send code <ArrowRight size={18} />
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase text-ink/30 dark:text-white/30">
              <span className="h-px flex-1 bg-ink/10 dark:bg-white/10" />
              or
              <span className="h-px flex-1 bg-ink/10 dark:bg-white/10" />
            </div>
            <SocialButtons />

            <p className="mt-7 text-center text-sm text-ink/60 dark:text-white/60">
              New to ClickCard?{" "}
              <Link
                href="/signup"
                className="font-bold text-brand-600 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </>
        ) : (
          <div className="space-y-5">
            <OtpInput value={otp} onChange={setOtp} error={!!error} />
            {error && (
              <p className="text-xs font-semibold text-rose-500">{error}</p>
            )}
            <Button
              fullWidth
              size="lg"
              loading={status === "loading"}
              disabled={otp.length !== 6}
              onClick={verify}
            >
              Verify & sign in <ArrowRight size={18} />
            </Button>
            <button
              onClick={() => {
                setStage("credential");
                setOtp("");
                dispatch(clearAuthError());
              }}
              className="flex items-center gap-1.5 text-sm font-semibold text-ink/60 transition hover:text-brand-600 dark:text-white/60"
            >
              <ArrowLeft size={15} /> Use a different account
            </button>
          </div>
        )}
      </AuthShell>
    </>
  );
}
