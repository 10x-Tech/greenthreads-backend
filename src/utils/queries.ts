export const getInfiniteNestedCategoryQuery = (
  query: any,
  initialQuery: any,
  depth = 20
): any => {
  if (depth === 0) return query;
  const newQuery = JSON.parse(JSON.stringify(initialQuery));
  newQuery.include.children = query;
  return getInfiniteNestedCategoryQuery(newQuery, initialQuery, depth - 1);
};
