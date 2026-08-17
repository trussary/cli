import type { FileSet, PackageJsonLike, Stack } from '../rules/types.js';

function deps(pkg: PackageJsonLike | undefined): Record<string, string> {
  return { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) };
}

export function detectStacks(files: FileSet, pkg: PackageJsonLike | undefined): Set<Stack> {
  const stacks = new Set<Stack>();
  const d = deps(pkg);

  if (d['next'] || files.list('next.config.{js,mjs,ts}').length > 0) stacks.add('next');

  if (
    d['vite'] &&
    (d['react'] || d['@vitejs/plugin-react'] || d['@vitejs/plugin-react-swc'])
  ) {
    stacks.add('vite-react');
  }

  if (
    d['@supabase/supabase-js'] ||
    d['@supabase/ssr'] ||
    d['@supabase/auth-helpers-nextjs'] ||
    files.list('supabase/**').length > 0
  ) {
    stacks.add('supabase');
  }

  if (files.has('vercel.json') || files.list('.vercel/**').length > 0) stacks.add('vercel');

  if (d['express']) stacks.add('express');

  return stacks;
}
