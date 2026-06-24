import { Phone, Mail } from "lucide-react";
import type { NotificationConfig } from "@/types/navigation";
import { brand } from "@/lib/brand";

interface NotificationBarProps {
  config: NotificationConfig;
}

export function NotificationBar({ config }: NotificationBarProps) {
  if (!config.enabled) return null;

  const phone = config.phone ?? brand.contact.phone;
  const email = config.email ?? brand.contact.email;

  return (
    <div className="bg-primary text-sm text-white">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
        <p className="font-heading text-xs font-medium sm:text-sm">
          {config.message}
        </p>
        <div className="flex items-center gap-4 text-white/90 sm:gap-5">
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 transition-colors hover:text-accent"
          >
            <Phone className="size-3.5 shrink-0" />
            <span className="hidden xs:inline">{phone}</span>
            <span className="xs:hidden">Call</span>
          </a>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-1.5 transition-colors hover:text-accent"
          >
            <Mail className="size-3.5 shrink-0" />
            <span className="hidden md:inline">{email}</span>
            <span className="md:hidden">Email</span>
          </a>
        </div>
      </div>
    </div>
  );
}
