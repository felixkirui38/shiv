"use client";

import { useState } from "react";
import { AdminCmsPopup } from "@/components/admin/admin-cms-popup";
import { useDoubleActivation } from "@/hooks/use-double-activation";

interface FooterLicenseTriggerProps {
  license: string;
  className?: string;
}

export function FooterLicenseTrigger({ license, className }: FooterLicenseTriggerProps) {
  const [cmsOpen, setCmsOpen] = useState(false);
  const activation = useDoubleActivation(() => setCmsOpen(true));

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={license}
        {...activation}
      >
        {license}
      </button>
      <AdminCmsPopup open={cmsOpen} onOpenChange={setCmsOpen} />
    </>
  );
}
