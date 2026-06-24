import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, FileText, HelpCircle, Shield, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedSection } from "@/components/shared/animated-section";
import { ProductCta } from "@/components/products/product-cta";
import { DynamicProductCalculator } from "@/components/products/dynamic-product-calculator";
import { getPublicCalculatorConfig } from "@/lib/premium-engine/queries";
import { CTASection } from "@/components/public/cta-section";
import { getIcon } from "@/lib/icons";
import type { getProductBySlug } from "@/lib/products/queries";

type Product = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

interface ProductDetailViewProps {
  product: Product;
}

function SectionBlock({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <AnimatedSection delay={delay}>
      <Card className="h-full border-brand shadow-sm">
        <CardHeader className="border-b border-brand bg-white">
          <CardTitle className="font-heading text-base font-semibold text-primary">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">{children}</CardContent>
      </Card>
    </AnimatedSection>
  );
}

export async function ProductDetailView({ product }: ProductDetailViewProps) {
  const Icon = getIcon(product.icon ?? "shield");
  const bannerUrl =
    product.bannerImage?.url ?? product.heroImage?.url ?? null;
  const calculatorConfig = await getPublicCalculatorConfig(product.slug);

  return (
    <>
      <section className="relative border-b border-brand bg-brand-light py-14 md:py-20">
        {bannerUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={bannerUrl}
              alt=""
              fill
              className="object-cover opacity-15"
              priority
            />
          </div>
        )}
        <div className="container relative mx-auto px-4">
          <AnimatedSection>
            <div className="accent-bar mb-4" />
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                <Icon className="size-7" />
              </div>
              <div>
                {product.category && (
                  <p className="mb-1 font-heading text-xs font-semibold tracking-wider text-secondary uppercase">
                    {product.category}
                  </p>
                )}
                <h1 className="mb-4 font-heading text-4xl font-semibold text-dark md:text-5xl">
                  {product.name}
                </h1>
                {product.shortDescription && (
                  <p className="max-w-3xl text-lg text-body">
                    {product.shortDescription}
                  </p>
                )}
              </div>
            </div>
            <ProductCta slug={product.slug} className="mt-8" />
          </AnimatedSection>
        </div>
      </section>

      {product.longDescription && (
        <section className="py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <AnimatedSection>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-dark">
                Overview
              </h2>
              <div className="prose prose-sm max-w-none text-body whitespace-pre-line">
                {product.longDescription}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      <section className="section-light py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {product.benefits.length > 0 && (
              <SectionBlock title="Benefits" delay={0}>
                <ul className="space-y-3">
                  {product.benefits.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-sm text-body">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      <div>
                        <p className="font-medium text-dark">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-body">{item.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionBlock>
            )}

            {product.coverages.length > 0 && (
              <SectionBlock title="Coverage" delay={0.08}>
                <ul className="space-y-3">
                  {product.coverages.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-sm text-body">
                      <Shield className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium text-dark">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-body">{item.description}</p>
                        )}
                        {(item.limit || item.deductible) && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.limit && `Limit: KES ${Number(item.limit).toLocaleString()}`}
                            {item.limit && item.deductible && " · "}
                            {item.deductible &&
                              `Deductible: KES ${Number(item.deductible).toLocaleString()}`}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionBlock>
            )}

            {product.exclusions.length > 0 && (
              <SectionBlock title="Exclusions" delay={0.16}>
                <ul className="space-y-3">
                  {product.exclusions.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-sm text-body">
                      <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                      <div>
                        <p className="font-medium text-dark">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-body">{item.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionBlock>
            )}

            {product.eligibilityItems.length > 0 && (
              <SectionBlock title="Eligibility" delay={0.24}>
                <ul className="space-y-3">
                  {product.eligibilityItems.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-sm text-body">
                      <Check className="mt-0.5 size-4 shrink-0 text-secondary" />
                      <div>
                        <p className="font-medium text-dark">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-body">{item.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionBlock>
            )}

            {product.requiredDocuments.length > 0 && (
              <SectionBlock title="Documents Required" delay={0.32}>
                <ul className="space-y-3">
                  {product.requiredDocuments.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-sm text-body">
                      <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium text-dark">
                          {item.name}
                          {item.isRequired && (
                            <span className="ml-1 text-xs text-accent">(Required)</span>
                          )}
                        </p>
                        {item.description && (
                          <p className="text-xs text-body">{item.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionBlock>
            )}

            {product.claimProcedure && (
              <SectionBlock title="Claim Procedure" delay={0.4}>
                <div className="text-sm text-body whitespace-pre-line">
                  {product.claimProcedure}
                </div>
              </SectionBlock>
            )}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <AnimatedSection>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-dark">
                Estimate Your Premium
              </h2>
              <p className="mb-4 text-body">
                Use our premium calculator for an indicative premium based on your
                selected coverage. Complete the application to purchase cover online.
              </p>
              <p className="text-sm text-body">
                Starting from{" "}
                <span className="font-semibold text-primary">
                  KES {product.basePremium.toLocaleString()}
                </span>{" "}
                per year
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <DynamicProductCalculator
                slug={product.slug}
                productName={product.name}
                config={calculatorConfig}
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {product.terms && (
        <section className="section-light py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <AnimatedSection>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-dark">
                Terms & Conditions
              </h2>
              <div className="text-sm text-body whitespace-pre-line">{product.terms}</div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {product.faqs.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto max-w-3xl px-4">
            <AnimatedSection className="mb-8 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
                <HelpCircle className="size-6" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-dark">
                Frequently Asked Questions
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <Accordion className="w-full">
                {product.faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="font-heading text-left text-sm font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-body">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AnimatedSection>
          </div>
        </section>
      )}

      <section className="border-t border-brand py-10">
        <div className="container mx-auto px-4 text-center">
          <ProductCta slug={product.slug} className="justify-center" />
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
          >
            <ArrowRight className="size-4 rotate-180" />
            Back to all products
          </Link>
        </div>
      </section>

      <CTASection />
    </>
  );
}
