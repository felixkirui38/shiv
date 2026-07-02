import Link from "next/link";
import { CustomerRegisterForm } from "@/components/auth/customer-register-form";

export const metadata = { title: "Register | Shiv Insurance" };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Create Account</h1>
      <CustomerRegisterForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
