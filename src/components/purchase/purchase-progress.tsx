import { PURCHASE_STEPS } from "@/types/purchase";
import { cn } from "@/lib/utils";

export function PurchaseProgress({ currentStep }: { currentStep: number }) {
  return (
    <ol className="mb-8 flex flex-wrap gap-2 md:gap-0 md:justify-between">
      {PURCHASE_STEPS.map((step) => {
        const active = currentStep === step.step;
        const done = currentStep > step.step;
        return (
          <li
            key={step.step}
            className={cn(
              "flex flex-1 min-w-[45%] md:min-w-0 flex-col items-center gap-1 border-b-2 pb-3 text-center md:px-2",
              active ? "border-accent" : done ? "border-primary/40" : "border-brand"
            )}
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                active
                  ? "bg-accent text-white"
                  : done
                    ? "bg-primary text-white"
                    : "bg-brand-light text-body"
              )}
            >
              {step.step}
            </span>
            <span className="font-heading text-xs font-semibold text-dark md:text-sm">
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
