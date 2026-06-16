import { useState } from "react";
import { Megaphone, X, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { notificationService } from "@/services/notificationService";
import { useAppDispatch } from "@/store/hooks";
import { pushToast } from "@/store/slices/uiSlice";

/** Lets an admin broadcast a new feature/announcement to every user (live). */
export default function AnnounceModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!title.trim()) return;
    setSending(true);
    try {
      const { data } = await notificationService.announce(title.trim(), message.trim());
      dispatch(pushToast(`Announcement sent to ${data.data?.delivered ?? 0} users 🎉`, "success"));
      onClose();
    } catch {
      dispatch(pushToast("Could not send announcement", "error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-float dark:bg-[#100b26]"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-ink/40 hover:text-ink dark:text-white/40" aria-label="Close">
          <X size={18} />
        </button>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white">
          <Megaphone size={22} />
        </span>
        <h2 className="mt-4 font-display text-xl font-black text-ink dark:text-white">
          Announce a feature
        </h2>
        <p className="mt-1 text-sm text-ink/55 dark:text-white/55">
          Every user gets a live notification.
        </p>
        <div className="mt-5 space-y-3">
          <Input label="Title" placeholder="New: AI Resume Templates" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink/80 dark:text-white/80">Message</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Build a recruiter-ready resume in minutes."
              className="w-full rounded-2xl border-2 border-brand-100 bg-white p-3.5 text-sm font-medium text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <Button fullWidth size="lg" loading={sending} disabled={!title.trim()} onClick={send}>
            <Send size={16} /> Send to all users
          </Button>
        </div>
      </div>
    </div>
  );
}
