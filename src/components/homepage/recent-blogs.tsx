"use client";

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useHomepage } from "@/components/providers/homepage-provider";
import { AnimatedSection, SectionHeader } from "@/components/homepage/section-primitives";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecentBlogsSection() {
  const { blog } = useHomepage();

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeader
            title={blog.title}
            subtitle={blog.subtitle}
            align="left"
          />
          <Link
            href="/blog"
            className="flex shrink-0 items-center gap-1 font-heading text-sm font-medium text-secondary hover:underline"
          >
            View all articles
            <ArrowRight className="size-4" />
          </Link>
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-3">
          {blog.posts.map((post, i) => (
            <AnimatedSection key={post.slug} delay={i * 0.08}>
              <Link href={`/blog/${post.slug}`}>
                <Card className="h-full overflow-hidden border-brand bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  {post.imageUrl ? (
                    <div className="relative aspect-[16/9] w-full">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-1.5 bg-secondary" />
                  )}
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
                        {post.date}
                      </span>
                    </div>
                    <CardTitle className="font-heading text-base font-semibold leading-snug">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-body">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="font-heading text-sm font-medium text-secondary">
                      Read article →
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
