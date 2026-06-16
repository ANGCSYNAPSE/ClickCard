import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AtSign,
  Gift,
  Check,
  Loader2,
  PartyPopper,
} from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import SocialButtons from "@/components/auth/SocialButtons";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import OtpInput from "@/components/ui/OtpInput";
import { emailSchema, usernameSchema, USERNAME_REGEX } from "@/lib/validation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { pushToast } from "@/store/slices/uiSlice";
import {
  initiateRegistration,
  verifyRegistrationOtp,
  checkUsername,
  completeRegistration,
  resendRegistrationOtp,
  setUsernameDraft,
  goToStep,
  clearRegistrationError,
} from "@/store/slices/registrationSlice";
import { useRequireGuest } from "@/lib/authGuards";

const STEPS = ["email", "otp", "username"] as const;

export default function SignupPage() {
  useRequireGuest();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reg = useAppSelector((s) => s.registration);
  const [otp, setOtp] = useState("");

  const stepIndex = Math.min(STEPS.indexOf(reg.step as never), 2);

  /* ---- step 1: email ---- */
  const emailForm = useFormik({
    initialValues: { email: "" },
    validationSchema: emailSchema,
    onSubmit: async (v) => {
      const res = await dispatch(initiateRegistration(v.email.trim()));
      if (initiateRegistration.fulfilled.match(res)) {
        dispatch(pushToast("Verification code sent to your email.", "success"));
      }
    },
  });

  /* ---- step 3: username ---- */
  const userForm = useFormik({
    initialValues: { username: "", referralCode: "" },
    validationSchema: usernameSchema,
    onSubmit: async (v) => {
      const res = await dispatch(
        completeRegistration({
          email: reg.email,
          username: v.username.trim(),
          referralCode: v.referralCode.trim() || undefined,
        }),
      );
      if (completeRegistration.fulfilled.match(res)) {
        dispatch(pushToast("🎉 Your ClickCard is live!", "success"));
      }
    },
  });

  /* debounced username availability check */
  useEffect(() => {
    const u = userForm.values.username.trim();
    if (!USERNAME_REGEX.test(u)) return;
    dispatch(setUsernameDraft(u));
    const t = setTimeout(() => dispatch(checkUsername(u)), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userForm.values.username]);

  /* prefill referral from ?ref= */
  useEffect(() => {
    const ref = router.query.ref as string;
    if (ref) userForm.setFieldValue("referralCode", ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.ref]);

  /* redirect after success */
  useEffect(() => {
    if (reg.step === "done") {
      const t = setTimeout(() => router.replace("/dashboard"), 1400);
      return () => clearTimeout(t);
    }
  }, [reg.step, router]);

  const verifyOtp = async () => {
    const res = await dispatch(
      verifyRegistrationOtp({ email: reg.email, otp }),
    );
    if (verifyRegistrationOtp.fulfilled.match(res)) {
      dispatch(pushToast("Email verified! Pick your handle.", "success"));
    }
  };

  if (reg.step === "done") {
    return (
      <AuthShell title="You're all set!" subtitle="Taking you to your dashboard…">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-3xl bg-brand-gradient text-white shadow-glow animate-float">
            <PartyPopper size={36} />
          </span>
          <p className="font-display text-xl font-bold text-ink dark:text-white">
            clickcard.app/{reg.username}
          </p>
          <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
        </div>
      </AuthShell>
    );
  }

  return (
    <>
      <Head>
        <title>Create your ClickCard</title>
        <meta name="robots" content="noindex" />
      </Head>
      <AuthShell
        title="Create your ClickCard"
        subtitle="Claim your link in under a minute."
      >
        {/* progress */}
        <div className="mb-7 flex items-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= stepIndex
                  ? "bg-brand-gradient"
                  : "bg-ink/10 dark:bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* STEP 1 — EMAIL */}
        {reg.step === "email" && (
          <>
            <form onSubmit={emailForm.handleSubmit} className="space-y-4">
              <Input
                name="email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                leftIcon={<Mail size={18} />}
                value={emailForm.values.email}
                onChange={(e) => {
                  emailForm.handleChange(e);
                  if (reg.error) dispatch(clearRegistrationError());
                }}
                onBlur={emailForm.handleBlur}
                error={emailForm.touched.email && emailForm.errors.email}
                autoFocus
              />
              {reg.error && (
                <p className="text-xs font-semibold text-rose-500">{reg.error}</p>
              )}
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={reg.status === "loading"}
              >
                Continue <ArrowRight size={18} />
              </Button>
            </form>
            <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase text-ink/30 dark:text-white/30">
              <span className="h-px flex-1 bg-ink/10 dark:bg-white/10" />
              or
              <span className="h-px flex-1 bg-ink/10 dark:bg-white/10" />
            </div>
            <SocialButtons />
            <p className="mt-7 text-center text-sm text-ink/60 dark:text-white/60">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-brand-600 hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}

        {/* STEP 2 — OTP */}
        {reg.step === "otp" && (
          <div className="space-y-5">
            <p className="text-sm text-ink/60 dark:text-white/60">
              Enter the 6-digit code sent to{" "}
              <span className="font-bold text-ink dark:text-white">
                {reg.email}
              </span>
              .
            </p>
            <OtpInput value={otp} onChange={setOtp} error={!!reg.error} />
            {reg.error && (
              <p className="text-xs font-semibold text-rose-500">{reg.error}</p>
            )}
            <Button
              fullWidth
              size="lg"
              loading={reg.status === "loading"}
              disabled={otp.length !== 6}
              onClick={verifyOtp}
            >
              Verify email <ArrowRight size={18} />
            </Button>
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  dispatch(goToStep("email"));
                  setOtp("");
                  dispatch(clearRegistrationError());
                }}
                className="flex items-center gap-1.5 text-sm font-semibold text-ink/60 transition hover:text-brand-600 dark:text-white/60"
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                onClick={() => {
                  dispatch(resendRegistrationOtp(reg.email));
                  dispatch(pushToast("New code sent.", "info"));
                }}
                className="text-sm font-bold text-brand-600 hover:underline"
              >
                Resend code
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — USERNAME */}
        {reg.step === "username" && (
          <form onSubmit={userForm.handleSubmit} className="space-y-4">
            <Input
              name="username"
              label="Claim your link"
              placeholder="yourname"
              leftIcon={<AtSign size={18} />}
              value={userForm.values.username}
              onChange={userForm.handleChange}
              onBlur={userForm.handleBlur}
              error={userForm.touched.username && userForm.errors.username}
              hint="clickcard.app/yourname"
              rightSlot={<UsernameStatus />}
              autoFocus
            />
            <Input
              name="referralCode"
              label="Referral code (optional)"
              placeholder="CC-ABC123"
              leftIcon={<Gift size={18} />}
              value={userForm.values.referralCode}
              onChange={userForm.handleChange}
            />
            {reg.error && (
              <p className="text-xs font-semibold text-rose-500">{reg.error}</p>
            )}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={reg.status === "loading"}
              disabled={reg.usernameAvailable === false}
            >
              Create my ClickCard <ArrowRight size={18} />
            </Button>
          </form>
        )}
      </AuthShell>
    </>
  );
}

function UsernameStatus() {
  const { checkingUsername, usernameAvailable } = useAppSelector(
    (s) => s.registration,
  );
  if (checkingUsername)
    return <Loader2 className="h-4 w-4 animate-spin text-ink/40" />;
  if (usernameAvailable === true)
    return <Check className="h-5 w-5 text-emerald-500" />;
  if (usernameAvailable === false)
    return <span className="text-xs font-bold text-rose-500">taken</span>;
  return null;
}
