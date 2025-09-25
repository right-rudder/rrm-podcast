import config from "@/config/config.json";

/**
 * Canonical URL utilities for The Aviation Business Podcast
 * Ensures proper URL normalization and SEO best practices
 */

// Get the base URL from config, ensuring no trailing slash
const getBaseUrl = (): string => {
  return (
    config.site.base_url?.replace(/\/$/, "") ||
    "https://theaviationbusinesspodcast.com"
  );
};

// Normalize a path to ensure consistent formatting
const normalizePath = (path: string): string => {
  // Remove leading slash if present, we'll add it back
  path = path.replace(/^\//, "");

  // Remove trailing slash for consistency
  path = path.replace(/\/$/, "");

  // Handle empty path (homepage)
  if (!path) {
    return "";
  }

  return path;
};

/**
 * Generate canonical URL for any page
 * @param path - The path of the page (e.g., "/episodes/episode-1" or "episodes/episode-1")
 * @param removePageNumber - Whether to remove /page/X from pagination (default: true for page 1)
 */
export const getCanonicalUrl = (
  path: string,
  removePageNumber: boolean = false,
): string => {
  const baseUrl = getBaseUrl();
  const normalizedPath = normalizePath(path);

  if (!normalizedPath) {
    return baseUrl;
  }

  // Handle pagination canonical URLs
  if (removePageNumber && normalizedPath.includes("/page/")) {
    // For page 1, canonical should point to the base path without /page/1
    if (normalizedPath.endsWith("/page/1")) {
      const basePath = normalizedPath.replace("/page/1", "");
      return basePath ? `${baseUrl}/${basePath}` : baseUrl;
    }
  }

  return `${baseUrl}/${normalizedPath}`;
};

/**
 * Generate canonical URL from Astro.url object
 * Automatically handles current page URL normalization
 */
export const getCanonicalFromAstroUrl = (astroUrl: URL): string => {
  const baseUrl = getBaseUrl();
  const pathname = astroUrl.pathname;

  // Remove base path if it exists in the pathname
  const basePath = config.site.base_path?.replace(/\/$/, "") || "";
  let cleanPath = pathname;

  if (basePath && pathname.startsWith(basePath)) {
    cleanPath = pathname.slice(basePath.length);
  }

  // Normalize and generate canonical
  const normalizedPath = normalizePath(cleanPath);

  // Handle pagination - page 1 should canonical to base path
  if (normalizedPath.endsWith("/page/1")) {
    const basePath = normalizedPath.replace("/page/1", "");
    return basePath ? `${baseUrl}/${basePath}` : baseUrl;
  }

  return normalizedPath ? `${baseUrl}/${normalizedPath}` : baseUrl;
};

/**
 * Generate canonical URL for episode pages
 */
export const getEpisodeCanonical = (episodeId: string): string => {
  return getCanonicalUrl(`episodes/${episodeId}`);
};

/**
 * Generate canonical URL for guest pages
 */
export const getGuestCanonical = (guestId: string): string => {
  return getCanonicalUrl(`guests/${guestId}`);
};

/**
 * Generate canonical URL for category pages
 */
export const getCategoryCanonical = (categorySlug: string): string => {
  return getCanonicalUrl(`categories/${categorySlug}`);
};

/**
 * Generate canonical URL for tag pages
 */
export const getTagCanonical = (tagSlug: string): string => {
  return getCanonicalUrl(`tags/${tagSlug}`);
};

/**
 * Generate canonical URL for regular pages
 */
export const getPageCanonical = (pageId: string): string => {
  return getCanonicalUrl(pageId);
};

/**
 * Generate canonical URL for paginated content
 * @param basePath - The base path (e.g., "episodes", "guests")
 * @param pageNumber - The page number (1, 2, 3, etc.)
 */
export const getPaginatedCanonical = (
  basePath: string,
  pageNumber: number,
): string => {
  if (pageNumber === 1) {
    // Page 1 canonical should point to base path without /page/1
    return getCanonicalUrl(basePath);
  }

  return getCanonicalUrl(`${basePath}/page/${pageNumber}`);
};

/**
 * Validate canonical URL format
 * Ensures the URL follows proper format and best practices
 */
export const validateCanonicalUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);

    // Must be https for production
    if (parsedUrl.protocol !== "https:") {
      console.warn(`Canonical URL should use HTTPS: ${url}`);
    }

    // Should not have query parameters in most cases
    if (parsedUrl.search) {
      console.warn(`Canonical URL contains query parameters: ${url}`);
    }

    // Should not have fragments
    if (parsedUrl.hash) {
      console.warn(`Canonical URL contains fragment: ${url}`);
    }

    return true;
  } catch (error) {
    console.error(`Invalid canonical URL: ${url}`, error);
    return false;
  }
};

/**
 * Get canonical URL for the current Astro page with automatic detection
 * This is the main function that should be used in most page templates
 */
export const getAutoCanonical = (
  astroUrl: URL,
  explicitPath?: string,
): string => {
  if (explicitPath) {
    return getCanonicalUrl(explicitPath);
  }

  return getCanonicalFromAstroUrl(astroUrl);
};

/**
 * Canonical URL configuration and validation
 */
export const canonicalConfig = {
  // Whether to enforce trailing slash consistency
  enforceTrailingSlash: config.site.trailing_slash === true,

  // Base URL validation
  validateBaseUrl: () => {
    const baseUrl = getBaseUrl();
    return validateCanonicalUrl(baseUrl);
  },

  // Generate all canonical URLs for sitemap validation
  generateAllCanonicals: () => {
    return {
      homepage: getCanonicalUrl(""),
      episodes: getCanonicalUrl("episodes"),
      guests: getCanonicalUrl("guests"),
      categories: getCanonicalUrl("categories"),
      tags: getCanonicalUrl("tags"),
      about: getCanonicalUrl("about"),
      contact: getCanonicalUrl("contact"),
    };
  },
};
