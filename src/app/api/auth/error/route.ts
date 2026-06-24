import { redirect } from "next/navigation";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const error = url.searchParams.get("error");
  const params = new URLSearchParams({ admin: "1", callbackUrl: "/admin/dashboard" });
  if (error) params.set("error", error);
  redirect(`/login?${params.toString()}`);
}
