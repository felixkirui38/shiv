import { ProductAdminForm } from "@/components/admin/product-admin-form";

export const metadata = { title: "New Product | Admin" };

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Create Insurance Product</h1>
      <ProductAdminForm mode="create" />
    </div>
  );
}
