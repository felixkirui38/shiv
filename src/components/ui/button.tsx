import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent font-heading text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-secondary hover:shadow-md",
        accent:
          "bg-accent text-accent-foreground shadow-sm hover:bg-[#b8923f] hover:shadow-md",
        outline:
          "border-brand bg-background text-primary hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-[#16565c] hover:shadow-md",
        ghost: "text-primary hover:bg-muted",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-secondary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-5",
        sm: "h-9 gap-1.5 rounded-md px-4 text-[0.8rem]",
        lg: "h-12 gap-2 rounded-md px-8 text-base",
        icon: "size-10",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
