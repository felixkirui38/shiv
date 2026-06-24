import { Quote } from "lucide-react";
import { AnimatedSection } from "@/components/shared/animated-section";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "James Mwangi",
    role: "Business Owner",
    content:
      "Shiv Insurance Brokers provided exceptional service when setting up our corporate medical scheme. Their expertise and responsiveness are unmatched.",
    rating: 5,
  },
  {
    name: "Sarah Wanjiku",
    role: "Fleet Manager",
    content:
      "We've managed our motor fleet insurance through Shiv for over five years. Claims are handled professionally and premiums remain competitive.",
    rating: 5,
  },
  {
    name: "David Ochieng",
    role: "Homeowner",
    content:
      "When we had a fire incident, the claims team guided us through every step. Settlement was fair and processed within the promised timeframe.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="section-light py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-12 text-center">
          <div className="accent-bar mx-auto mb-4" />
          <h2 className="mb-3 font-heading text-3xl font-semibold text-dark">
            What Our Clients Say
          </h2>
          <p className="mx-auto max-w-2xl text-body">
            Trusted by thousands of individuals and businesses across Kenya.
          </p>
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.name} delay={i * 0.1}>
              <Card className="h-full border-brand bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <Quote className="mb-4 size-8 text-accent/60" />
                  <p className="mb-6 text-sm leading-relaxed text-body">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="border-t border-brand pt-4">
                    <p className="font-heading text-sm font-semibold text-dark">
                      {t.name}
                    </p>
                    <p className="text-xs text-body">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
