import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products } from "@/lib/content";
import ProductTemplate from "@/components/ProductTemplate";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) return {};
  return {
    title: `${product.name} — Kargo360`,
    description: product.short,
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) notFound();
  return <ProductTemplate product={product} />;
}
