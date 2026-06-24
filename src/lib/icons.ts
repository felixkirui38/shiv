import {
  Car,
  HeartPulse,
  Plane,
  Shield,
  Home,
  Building2,
  Ship,
  PawPrint,
  BadgeCheck,
  Users,
  BarChart3,
  Heart,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  car: Car,
  heart: HeartPulse,
  plane: Plane,
  shield: Shield,
  home: Home,
  building: Building2,
  ship: Ship,
  paw: PawPrint,
  badge: BadgeCheck,
  users: Users,
  chart: BarChart3,
  briefcase: Briefcase,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Shield;
}
