import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { solutions } from "@/lib/content";
import SolutionTemplate from "@/components/SolutionTemplate";

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const solution = solutions.find((s) => s.slug === params.slug);
  if (!solution) return {};
  return {
    title: `${solution.name} — Kargo360`,
    description: solution.short,
  };
}

export default function SolutionPage({ params }: { params: { slug: string } }) {
  const solution = solutions.find((s) => s.slug === params.slug);
  if (!solution) notFound();
  return <SolutionTemplate solution={solution} />;
}
