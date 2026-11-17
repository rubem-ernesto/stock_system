"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl space-y-6">
      <ProductForm onSuccess={() => router.push("/dashboard/products")} />
    </div>
  );
}
