const PLATZI_BASE = "https://api.escuelajs.co/api/v1";

export interface PlatziProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: { id: number; name: string };
}

interface PlatziCategory {
  id: number;
  name: string;
}

/**
 * Fetches the wearable-item catalog (Clothes + Shoes categories) from the
 * Platzi Fake Store API. Filters by category name locally rather than
 * relying on an assumed query-param shape, so this keeps working even if
 * category IDs change.
 */
export async function getWearableCatalog(): Promise<PlatziProduct[]> {
  const categoriesRes = await fetch(`${PLATZI_BASE}/categories`, {
    cache: "no-store",
  });
  if (!categoriesRes.ok) {
    throw new Error(`Failed to load categories (${categoriesRes.status})`);
  }
  const categories: PlatziCategory[] = await categoriesRes.json();
  const wearableIds = new Set(
    categories
      .filter((c) => ["clothes", "shoes"].includes(c.name.toLowerCase()))
      .map((c) => c.id)
  );

  const productsRes = await fetch(`${PLATZI_BASE}/products?offset=0&limit=100`, {
    cache: "no-store",
  });
  if (!productsRes.ok) {
    throw new Error(`Failed to load products (${productsRes.status})`);
  }
  const products: PlatziProduct[] = await productsRes.json();

  return products
    .filter((p) => wearableIds.has(p.category?.id))
    .filter((p) => p.title && p.price && p.images?.length > 0)
    .slice(0, 40);
}
