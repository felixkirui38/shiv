import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PremiumCalculatorInput {
  productType: string;
  coverageAmount: number;
  deductible?: number;
  factors: Record<string, string | number | boolean>;
}

export interface PremiumCalculatorResult {
  basePremium: number;
  adjustments: { name: string; amount: number }[];
  totalPremium: number;
  monthlyPremium: number;
}
