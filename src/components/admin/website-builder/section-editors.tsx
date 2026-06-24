"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { HomepageContent } from "@/types/homepage";
import type { SiteNavigationConfig } from "@/types/navigation";
import type { WebsiteEditorPanel } from "@/types/website-builder";

interface SectionEditorsProps {
  panel: WebsiteEditorPanel;
  homepage: HomepageContent;
  navigation: SiteNavigationConfig;
  onHomepageChange: (homepage: HomepageContent) => void;
  onNavigationChange: (navigation: SiteNavigationConfig) => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function SectionEditors({
  panel,
  homepage,
  navigation,
  onHomepageChange,
  onNavigationChange,
}: SectionEditorsProps) {
  const update = <K extends keyof HomepageContent>(
    key: K,
    value: HomepageContent[K]
  ) => onHomepageChange({ ...homepage, [key]: value });

  if (panel === "hero") {
    return (
      <div className="space-y-4">
        <Field label="Headline">
          <Input
            value={homepage.hero.headline}
            onChange={(e) =>
              update("hero", { ...homepage.hero, headline: e.target.value })
            }
          />
        </Field>
        <Field label="Subheadline">
          <Textarea
            value={homepage.hero.subheadline}
            onChange={(e) =>
              update("hero", { ...homepage.hero, subheadline: e.target.value })
            }
            rows={2}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Primary button">
            <Input
              value={homepage.hero.primaryButtonLabel}
              onChange={(e) =>
                update("hero", { ...homepage.hero, primaryButtonLabel: e.target.value })
              }
            />
          </Field>
          <Field label="Primary link">
            <Input
              value={homepage.hero.primaryButtonHref}
              onChange={(e) =>
                update("hero", { ...homepage.hero, primaryButtonHref: e.target.value })
              }
            />
          </Field>
          <Field label="Secondary button">
            <Input
              value={homepage.hero.secondaryButtonLabel}
              onChange={(e) =>
                update("hero", { ...homepage.hero, secondaryButtonLabel: e.target.value })
              }
            />
          </Field>
          <Field label="Secondary link">
            <Input
              value={homepage.hero.secondaryButtonHref}
              onChange={(e) =>
                update("hero", { ...homepage.hero, secondaryButtonHref: e.target.value })
              }
            />
          </Field>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-600">Hero images</Label>
          {homepage.hero.images.map((img, i) => (
            <div key={img.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
              <Input
                placeholder="Label"
                value={img.label}
                onChange={(e) => {
                  const images = [...homepage.hero.images];
                  images[i] = { ...img, label: e.target.value };
                  update("hero", { ...homepage.hero, images });
                }}
              />
              <Input
                placeholder="Image URL"
                value={img.imageUrl ?? ""}
                onChange={(e) => {
                  const images = [...homepage.hero.images];
                  images[i] = { ...img, imageUrl: e.target.value };
                  update("hero", { ...homepage.hero, images });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (panel === "products") {
    return (
      <div className="space-y-4">
        <Field label="Section title">
          <Input
            value={homepage.products.title}
            onChange={(e) =>
              update("products", { ...homepage.products, title: e.target.value })
            }
          />
        </Field>
        <Field label="Section subtitle">
          <Textarea
            value={homepage.products.subtitle}
            onChange={(e) =>
              update("products", { ...homepage.products, subtitle: e.target.value })
            }
            rows={2}
          />
        </Field>
        <p className="text-xs text-slate-500">
          Product cards are synced from the active insurance products catalog at publish time.
        </p>
      </div>
    );
  }

  if (panel === "statistics") {
    return (
      <div className="space-y-4">
        <Field label="Title">
          <Input
            value={homepage.statistics.title}
            onChange={(e) =>
              update("statistics", { ...homepage.statistics, title: e.target.value })
            }
          />
        </Field>
        <Field label="Subtitle">
          <Input
            value={homepage.statistics.subtitle ?? ""}
            onChange={(e) =>
              update("statistics", { ...homepage.statistics, subtitle: e.target.value })
            }
          />
        </Field>
        {homepage.statistics.stats.map((stat, i) => (
          <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-3">
            <Input
              type="number"
              placeholder="Value"
              value={stat.value}
              onChange={(e) => {
                const stats = [...homepage.statistics.stats];
                stats[i] = { ...stat, value: Number(e.target.value) };
                update("statistics", { ...homepage.statistics, stats });
              }}
            />
            <Input
              placeholder="Suffix"
              value={stat.suffix}
              onChange={(e) => {
                const stats = [...homepage.statistics.stats];
                stats[i] = { ...stat, suffix: e.target.value };
                update("statistics", { ...homepage.statistics, stats });
              }}
            />
            <Input
              placeholder="Label"
              value={stat.label}
              onChange={(e) => {
                const stats = [...homepage.statistics.stats];
                stats[i] = { ...stat, label: e.target.value };
                update("statistics", { ...homepage.statistics, stats });
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (panel === "claims") {
    return (
      <div className="space-y-4">
        <Field label="Banner title">
          <Input
            value={homepage.claims.title}
            onChange={(e) =>
              update("claims", { ...homepage.claims, title: e.target.value })
            }
          />
        </Field>
        <Field label="Banner subtitle">
          <Textarea
            value={homepage.claims.subtitle ?? ""}
            onChange={(e) =>
              update("claims", { ...homepage.claims, subtitle: e.target.value })
            }
            rows={2}
          />
        </Field>
        {homepage.claims.steps.map((step, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <Input
              placeholder="Step title"
              value={step.title}
              onChange={(e) => {
                const steps = [...homepage.claims.steps];
                steps[i] = { ...step, title: e.target.value };
                update("claims", { ...homepage.claims, steps });
              }}
            />
            <Textarea
              placeholder="Description"
              value={step.description}
              onChange={(e) => {
                const steps = [...homepage.claims.steps];
                steps[i] = { ...step, description: e.target.value };
                update("claims", { ...homepage.claims, steps });
              }}
              rows={2}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            update("claims", {
              ...homepage.claims,
              steps: [...homepage.claims.steps, { title: "New step", description: "" }],
            })
          }
        >
          <Plus className="mr-1 size-4" /> Add step
        </Button>
      </div>
    );
  }

  if (panel === "partners") {
    return (
      <div className="space-y-4">
        <Field label="Title">
          <Input
            value={homepage.partners.title}
            onChange={(e) =>
              update("partners", { ...homepage.partners, title: e.target.value })
            }
          />
        </Field>
        {homepage.partners.items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder="Partner name"
              value={item.name}
              onChange={(e) => {
                const items = [...homepage.partners.items];
                items[i] = { ...item, name: e.target.value };
                update("partners", { ...homepage.partners, items });
              }}
            />
            <Input
              placeholder="Logo URL"
              value={item.logoUrl ?? ""}
              onChange={(e) => {
                const items = [...homepage.partners.items];
                items[i] = { ...item, logoUrl: e.target.value };
                update("partners", { ...homepage.partners, items });
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                const items = homepage.partners.items.filter((_, j) => j !== i);
                update("partners", { ...homepage.partners, items });
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            update("partners", {
              ...homepage.partners,
              items: [...homepage.partners.items, { name: "Partner" }],
            })
          }
        >
          <Plus className="mr-1 size-4" /> Add partner
        </Button>
      </div>
    );
  }

  if (panel === "testimonials") {
    return (
      <div className="space-y-4">
        <Field label="Title">
          <Input
            value={homepage.testimonials.title}
            onChange={(e) =>
              update("testimonials", { ...homepage.testimonials, title: e.target.value })
            }
          />
        </Field>
        {homepage.testimonials.items.map((item, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Name"
                value={item.name}
                onChange={(e) => {
                  const items = [...homepage.testimonials.items];
                  items[i] = { ...item, name: e.target.value };
                  update("testimonials", { ...homepage.testimonials, items });
                }}
              />
              <Input
                placeholder="Role"
                value={item.role}
                onChange={(e) => {
                  const items = [...homepage.testimonials.items];
                  items[i] = { ...item, role: e.target.value };
                  update("testimonials", { ...homepage.testimonials, items });
                }}
              />
            </div>
            <Textarea
              placeholder="Quote"
              value={item.content}
              onChange={(e) => {
                const items = [...homepage.testimonials.items];
                items[i] = { ...item, content: e.target.value };
                update("testimonials", { ...homepage.testimonials, items });
              }}
              rows={3}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            update("testimonials", {
              ...homepage.testimonials,
              items: [
                ...homepage.testimonials.items,
                { name: "Customer", role: "", content: "", rating: 5 },
              ],
            })
          }
        >
          <Plus className="mr-1 size-4" /> Add testimonial
        </Button>
      </div>
    );
  }

  if (panel === "faq") {
    return (
      <div className="space-y-4">
        <Field label="Title">
          <Input
            value={homepage.faq.title}
            onChange={(e) => update("faq", { ...homepage.faq, title: e.target.value })}
          />
        </Field>
        {homepage.faq.items.map((item, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <Input
              placeholder="Question"
              value={item.question}
              onChange={(e) => {
                const items = [...homepage.faq.items];
                items[i] = { ...item, question: e.target.value };
                update("faq", { ...homepage.faq, items });
              }}
            />
            <Textarea
              placeholder="Answer"
              value={item.answer}
              onChange={(e) => {
                const items = [...homepage.faq.items];
                items[i] = { ...item, answer: e.target.value };
                update("faq", { ...homepage.faq, items });
              }}
              rows={3}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            update("faq", {
              ...homepage.faq,
              items: [...homepage.faq.items, { question: "Question?", answer: "" }],
            })
          }
        >
          <Plus className="mr-1 size-4" /> Add FAQ
        </Button>
      </div>
    );
  }

  if (panel === "cta") {
    return (
      <div className="space-y-4">
        <Field label="Title">
          <Input
            value={homepage.cta.title}
            onChange={(e) => update("cta", { ...homepage.cta, title: e.target.value })}
          />
        </Field>
        <Field label="Subtitle">
          <Textarea
            value={homepage.cta.subtitle ?? ""}
            onChange={(e) => update("cta", { ...homepage.cta, subtitle: e.target.value })}
            rows={2}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Primary button">
            <Input
              value={homepage.cta.primaryButtonLabel}
              onChange={(e) =>
                update("cta", { ...homepage.cta, primaryButtonLabel: e.target.value })
              }
            />
          </Field>
          <Field label="Primary link">
            <Input
              value={homepage.cta.primaryButtonHref}
              onChange={(e) =>
                update("cta", { ...homepage.cta, primaryButtonHref: e.target.value })
              }
            />
          </Field>
          <Field label="Secondary button">
            <Input
              value={homepage.cta.secondaryButtonLabel}
              onChange={(e) =>
                update("cta", { ...homepage.cta, secondaryButtonLabel: e.target.value })
              }
            />
          </Field>
          <Field label="Secondary link">
            <Input
              value={homepage.cta.secondaryButtonHref}
              onChange={(e) =>
                update("cta", { ...homepage.cta, secondaryButtonHref: e.target.value })
              }
            />
          </Field>
        </div>
      </div>
    );
  }

  if (panel === "header") {
    return (
      <div className="space-y-4">
        <Field label="Notification bar message">
          <Input
            value={navigation.notification.message}
            onChange={(e) =>
              onNavigationChange({
                ...navigation,
                notification: { ...navigation.notification, message: e.target.value },
              })
            }
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={navigation.notification.enabled}
            onChange={(e) =>
              onNavigationChange({
                ...navigation,
                notification: { ...navigation.notification, enabled: e.target.checked },
              })
            }
          />
          Show notification bar
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Purchase button label">
            <Input
              value={navigation.actions.quoteLabel}
              onChange={(e) =>
                onNavigationChange({
                  ...navigation,
                  actions: { ...navigation.actions, quoteLabel: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Purchase button link">
            <Input
              value={navigation.actions.quoteHref}
              onChange={(e) =>
                onNavigationChange({
                  ...navigation,
                  actions: { ...navigation.actions, quoteHref: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Emergency label">
            <Input
              value={navigation.actions.emergencyLabel}
              onChange={(e) =>
                onNavigationChange({
                  ...navigation,
                  actions: { ...navigation.actions, emergencyLabel: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Login label">
            <Input
              value={navigation.actions.loginLabel}
              onChange={(e) =>
                onNavigationChange({
                  ...navigation,
                  actions: { ...navigation.actions, loginLabel: e.target.value },
                })
              }
            />
          </Field>
        </div>
      </div>
    );
  }

  if (panel === "footer") {
    return (
      <div className="space-y-4">
        <Field label="Company description">
          <Textarea
            value={navigation.footer.companyDescription}
            onChange={(e) =>
              onNavigationChange({
                ...navigation,
                footer: { ...navigation.footer, companyDescription: e.target.value },
              })
            }
            rows={3}
          />
        </Field>
        <Field label="Copyright">
          <Input
            value={navigation.footer.copyright}
            onChange={(e) =>
              onNavigationChange({
                ...navigation,
                footer: { ...navigation.footer, copyright: e.target.value },
              })
            }
          />
        </Field>
        <Field label="License text">
          <Input
            value={navigation.footer.license}
            onChange={(e) =>
              onNavigationChange({
                ...navigation,
                footer: { ...navigation.footer, license: e.target.value },
              })
            }
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={navigation.footer.newsletter.enabled}
            onChange={(e) =>
              onNavigationChange({
                ...navigation,
                footer: {
                  ...navigation.footer,
                  newsletter: {
                    ...navigation.footer.newsletter,
                    enabled: e.target.checked,
                  },
                },
              })
            }
          />
          Show newsletter signup
        </label>
        <Field label="Newsletter title">
          <Input
            value={navigation.footer.newsletter.title}
            onChange={(e) =>
              onNavigationChange({
                ...navigation,
                footer: {
                  ...navigation.footer,
                  newsletter: {
                    ...navigation.footer.newsletter,
                    title: e.target.value,
                  },
                },
              })
            }
          />
        </Field>
      </div>
    );
  }

  return (
    <p className="text-sm text-slate-500">
      Select a section from the list to edit its content.
    </p>
  );
}
