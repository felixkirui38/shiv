import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { defaultBlogPosts } from "@/config/blog.defaults";
import { AnimatedSection } from "@/components/shared/animated-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function BlogCards() {
  return (
    <section className="section-light py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="accent-bar mb-4" />
            <h2 className="mb-3 font-heading text-3xl font-semibold text-dark">
              Insurance Insights
            </h2>
            <p className="max-w-xl text-body">
              Expert advice and industry updates from our insurance professionals.
            </p>
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-1 font-heading text-sm font-medium text-secondary hover:underline"
          >
            View all articles
            <ArrowRight className="size-4" />
          </Link>
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-3">
          {defaultBlogPosts.map((post, i) => (
            <AnimatedSection key={post.slug} delay={i * 0.08}>
              <Link href={`/blog/${post.slug}`}>
                <Card className="h-full border-brand bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div className="h-2 bg-secondary" />
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="border-brand font-heading text-xs text-primary"
                      >
                        {post.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-body">
                        <Calendar className="size-3" />
                        {new Date(post.date).toLocaleDateString("en-KE", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <CardTitle className="font-heading text-base font-semibold leading-snug">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-body">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="font-heading text-sm font-medium text-secondary">
                      Read article &rarr;
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
