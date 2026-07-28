/** Prefix public assets with the deploy base path (e.g. GitHub Pages subpath). */
export const withBase = (p: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${p}`;
