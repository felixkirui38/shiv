"use client";

import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "@/types/quote-wizard";
import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: number;
  className?: string;
}

export function WizardProgress({ currentStep, className }: WizardProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop stepper */}
      <ol className="hidden gap-2 md:grid md:grid-cols-8">
        {WIZARD_STEPS.map((step) => {
          const done = currentStep > step.id;
          const active = currentStep === step.id;
          return (
            <li key={step.id} className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "mb-2 flex size-9 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  done && "border-accent bg-accent text-dark",
                  active && "border-primary bg-primary text-white",
                  !done && !active && "border-brand bg-white text-body"
                )}
              >
                {done ? <Check className="size-4" /> : step.id}
              </div>
              <span
                className={cn(
                  "font-heading text-[10px] font-semibold leading-tight lg:text-xs",
                  active ? "text-primary" : "text-body"
                )}
              >
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Mobile progress bar */}
      <div className="md:hidden">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-heading font-semibold text-primary">
            Step {currentStep} of {WIZARD_STEPS.length}
          </span>
          <span className="text-body">
            {WIZARD_STEPS[currentStep - 1]?.title}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-brand-light">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
