"use client";

import { useId, useState } from "react";
import styles from "./NewsletterForm.module.scss";

type FormState = "idle" | "sending" | "done" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ variant = "inline" }: { variant?: "inline" | "card" | "pill" }) {
  const inputId = useId();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;

    const clean = email.trim();
    if (!EMAIL_RE.test(clean)) {
      setMessage("Enter a valid email address.");
      setState("error");
      return;
    }

    setState("sending");
    setMessage("");
    const res = await fetch("/api/subscribers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: clean, website }),
    }).catch(() => null);

    if (res?.ok) {
      setState("done");
      return;
    }

    const data = await res?.json().catch(() => null);
    setMessage(
      res?.status === 429
        ? "Too many attempts. Please try again in a few minutes."
        : data?.error || "Something went wrong. Try again.",
    );
    setState("error");
  }

  if (state === "done") {
    return (
      <p className={styles.done} role="status">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Thanks — you&apos;re on the list. New notes will land in your inbox.
      </p>
    );
  }

  const formClass = variant === "card" ? `${styles.form} ${styles.formCard}` : variant === "pill" ? `${styles.form} ${styles.formPill}` : styles.form;
  const invalid = state === "error";

  return (
    <form className={formClass} onSubmit={onSubmit} noValidate aria-busy={state === "sending"}>
      <label htmlFor={inputId} className="sr-only">Email address</label>
      <input
        id={inputId}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === "error") {
            setState("idle");
            setMessage("");
          }
        }}
        placeholder="Email address"
        className={styles.input}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
      />
      <button type="submit" className={styles.submit} disabled={state === "sending"}>
        {state === "sending" ? "Subscribing…" : "Subscribe"}
      </button>
      {/* honeypot — humans never see or fill this */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      {invalid ? (
        <p id={errorId} role="alert" className={styles.error}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
