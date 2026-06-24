import { redirect } from "next/navigation";

export default async function QuoteRedirectPage() {
  redirect("/products");
}
