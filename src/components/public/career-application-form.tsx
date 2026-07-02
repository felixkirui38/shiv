"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const OPEN_POSITIONS = [
  "Insurance Sales Agent",
  "Claims Officer",
  "Customer Service Representative",
  "Underwriting Assistant",
  "Marketing Coordinator",
  "Other",
];

export function CareerApplicationForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState(OPEN_POSITIONS[0]);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const body = new FormData();
      body.append("firstName", firstName.trim());
      body.append("lastName", lastName.trim());
      body.append("email", email.trim().toLowerCase());
      if (phone.trim()) body.append("phone", phone.trim());
      body.append("position", position);
      if (coverLetter.trim()) body.append("coverLetter", coverLetter.trim());
      if (resume) body.append("resume", resume);

      const res = await fetch("/api/careers/apply", { method: "POST", body });
      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to submit application. Please try again.");
        return;
      }

      setSuccess(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPosition(OPEN_POSITIONS[0]);
      setCoverLetter("");
      setResume(null);
    } catch {
      setError("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
        <h2 className="font-heading text-xl font-semibold text-primary">Application received</h2>
        <p className="mt-2 text-body">
          Thank you for your interest in joining Shiv Insurance. We will review your application and be in touch.
        </p>
        <Button type="button" variant="outline" className="mt-6" onClick={() => setSuccess(false)}>
          Submit another application
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-brand bg-white p-6 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="career-first">First name *</Label>
          <Input id="career-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="career-last">Last name *</Label>
          <Input id="career-last" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1.5" />
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="career-email">Email *</Label>
          <Input id="career-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="career-phone">Phone</Label>
          <Input id="career-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" />
        </div>
      </div>
      <div>
        <Label htmlFor="career-position">Position *</Label>
        <select
          id="career-position"
          className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        >
          {OPEN_POSITIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="career-resume">Resume (PDF or Word, max 5MB)</Label>
        <Input
          id="career-resume"
          type="file"
          accept=".pdf,.doc,.docx"
          className="mt-1.5"
          onChange={(e) => setResume(e.target.files?.[0] ?? null)}
        />
      </div>
      <div>
        <Label htmlFor="career-cover">Cover letter</Label>
        <Textarea
          id="career-cover"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={5}
          className="mt-1.5"
          placeholder="Tell us why you'd be a great fit…"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" variant="accent" disabled={loading} className="gap-2">
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Submit application"}
      </Button>
    </form>
  );
}
