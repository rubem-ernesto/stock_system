"use client";

import Link from "next/link";
import { ProductList } from "@/components/product-list";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <ProductList onAddNewProduct={() => {}} />
    </div>
  );
}
