export function generateProductSlug(name: string) {
  // Convert to lowercase and replace spaces with hyphens
  let slug = name.toLowerCase().replace(/\s+/g, "-");

  // Remove special characters
  slug = slug.replace(/[^a-z0-9\-]/g, "");

  // Remove consecutive hyphens
  slug = slug.replace(/-{2,}/g, "-");

  // Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, "");

  return slug;
}
