/**
 * Shared path vocabulary for rules. Keeping these in one place is what stops
 * two rules from disagreeing about what "server code" or "build output" means.
 */

/** Every hand-written source file a rule might read. Build output excluded — see below. */
export const SOURCE_GLOBS = [
  '**/*.{ts,tsx,js,jsx,mjs,cjs}',
];

/** Generated output. Copies of source live here; most rules would double-report. */
const BUILD_OUTPUT = /^(dist|build|out|\.next|\.output|\.vercel|public\/assets)\//;

export function isBuildOutput(path: string): boolean {
  return BUILD_OUTPUT.test(path);
}

/** Files that run on a server: API routes, route handlers, actions, express apps. */
const SERVER_PATH =
  /(^|\/)(api|server|routes|controllers|handlers|functions|middleware)(\/|\.)|(^|\/)route\.[jt]sx?$|\.server\.[jt]sx?$|(^|\/)supabase\/functions\//;

export function isServerPath(path: string): boolean {
  return SERVER_PATH.test(path);
}

/** Next.js API routes and route handlers, where a session check belongs. */
const NEXT_API_ROUTE =
  /^(src\/)?(pages\/api\/.+\.[jt]sx?|app\/(.+\/)?api\/(.+\/)?route\.[jt]sx?)$/;

export function isNextApiRoute(path: string): boolean {
  return NEXT_API_ROUTE.test(path);
}

/** Test and story files: intentionally full of fake keys and unguarded handlers. */
const TEST_PATH = /(^|\/)(__tests__|__mocks__|test|tests|e2e|cypress|\.storybook)\/|\.(test|spec|stories)\.[jt]sx?$/;

export function isTestPath(path: string): boolean {
  return TEST_PATH.test(path);
}

/** Source files worth analysing: hand-written, not generated, not tests. */
export function isAnalysableSource(path: string): boolean {
  return !isBuildOutput(path) && !isTestPath(path);
}
