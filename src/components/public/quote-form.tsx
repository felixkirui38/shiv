"use client";

import { useState } from "react";
import { AnimatedSection } from "@/components/shared/animated-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/hooks/use-products";

export function QuoteForm() {
  const { products } = useProducts();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          productSlug: productSlug || undefined,
          message,
          source: "quote-form",
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to submit request. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <div className="accent-bar mx-auto mb-4" />
            <h2 className="mb-3 font-heading text-3xl font-semibold text-dark">
              Request a Quote
            </h2>
            <p className="text-body">
              Fill in your details and our advisors will contact you with a
              tailored insurance proposal.
            </p>
          </div>

          <Card className="border-brand bg-white shadow-md">
            <CardHeader className="border-b border-brand">
              <CardTitle className="font-heading text-base font-semibold text-primary">
                Quote Request Form
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {submitted ? (
                <div className="rounded-md border border-brand bg-brand-light p-6 text-center">
                  <p className="font-heading text-lg font-semibold text-primary">
                    Thank you for your enquiry
                  </p>
                  <p className="mt-2 text-sm text-body">
                    A Shiv Insurance advisor will contact you within one
                    business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1.5 border-brand"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1.5 border-brand"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 border-brand"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1.5 border-brand"
                    />
                  </div>
                  <div>
                    <Label>Insurance Product</Label>
                    <Select value={productSlug} onValueChange={(v) => v && setProductSlug(v)}>
                      <SelectTrigger className="mt-1.5 border-brand">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.slug} value={p.slug}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message">Additional Details</Label>
                    <Textarea
                      id="message"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-1.5 border-brand"
                      placeholder="Tell us about your insurance needs..."
                    />
                  </div>
                  {error && (
                    <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    variant="accent"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Submitting…" : "Submit Quote Request"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </section>
  );
}
