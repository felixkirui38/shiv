"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { width: 40, height: 40, className: "h-9 w-9" },
  md: { width: 52, height: 52, className: "h-11 w-11" },
  header: { width: 140, height: 140, className: "h-[4.5rem] w-[4.5rem] md:h-24 md:w-24" },
  lg: { width: 72, height: 72, className: "h-16 w-16" },
} as const;

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
  size?: keyof typeof SIZES;
  showLink?: boolean;
  href?: string;
}

export function Logo({
  className,
  variant = "default",
  size = "md",
  showLink = true,
  href = "/",
}: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const dims = SIZES[size];

  const content = !imgError ? (
    <Image
      src={brand.logo}
      alt={`${brand.name} — Est. 1995`}
      width={dims.width}
      height={dims.height}
      className={cn(dims.className, "w-auto rounded-sm object-contain", className)}
      priority={size !== "sm"}
      onError={() => setImgError(true)}
    />
  ) : (
    <div className="flex flex-col leading-none">
      <span
        className={cn(
          "font-heading text-lg font-semibold tracking-tight",
          variant === "light" ? "text-white" : "text-primary"
        )}
      >
        SIB
      </span>
      <span
        className={cn(
          "text-[0.65rem] font-medium tracking-widest uppercase",
          variant === "light" ? "text-white/80" : "text-brand-body"
        )}
      >
        Est. 1995
      </span>
    </div>
  );

  if (!showLink) {
    return <div className={cn("flex items-center", className)}>{content}</div>;
  }

  return (
    <Link href={href} className={cn("flex shrink-0 items-center", className)} aria-label={brand.name}>
      {content}
    </Link>
  );
}
