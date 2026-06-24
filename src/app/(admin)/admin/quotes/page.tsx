import { redirect } from "next/navigation";

export default function AdminQuotesRedirect() {
  redirect("/admin/applications");
}
