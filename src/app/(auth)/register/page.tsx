import Link from "next/link";

export const metadata = { title: "Register | Shiv Insurance" };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Create Account</h1>
      <form action="/api/auth/register" method="POST" className="space-y-4">
        <input name="firstName" placeholder="First Name" required className="w-full rounded-md border px-4 py-2" />
        <input name="lastName" placeholder="Last Name" className="w-full rounded-md border px-4 py-2" />
        <input name="email" type="email" placeholder="Email" required className="w-full rounded-md border px-4 py-2" />
        <input name="phone" placeholder="Phone" className="w-full rounded-md border px-4 py-2" />
        <input name="password" type="password" placeholder="Password" required className="w-full rounded-md border px-4 py-2" />
        <button type="submit" className="w-full rounded-md bg-primary py-2 text-primary-foreground">
          Create Account
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
