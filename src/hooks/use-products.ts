"use client";

import { useEffect, useState } from "react";

export interface ProductOption {
  id: string;
  slug: string;
  name: string;
  category?: string | null;
  shortDescription?: string | null;
  icon?: string | null;
  basePremium: number;
  isActive?: boolean;
}

export function useProducts() {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.data);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}
