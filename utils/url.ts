// Build a link that keeps app state (like ?station and ?lang) in the query.
// Empty values are left out, so buildHref("/", { lang: "" }) is just "/".
export const buildHref = (
  pathname: string,
  params: Record<string, string | null | undefined>
) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const queryString = query.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};
