/** Static hosts serve directory indexes with a trailing slash. */
export function normalizePagePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}
