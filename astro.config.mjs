import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "astro-auto-import";
import { defineConfig } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import sharp from "sharp";
import config from "./src/config/config.json";

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url
    ? config.site.base_url
    : "https://theaviationbusinesspodcast.com",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash: config.site.trailing_slash ? "always" : "never",
  image: { service: sharp() },
  vite: { plugins: [tailwindcss()] },
  integrations: [
    react(),
    sitemap({
      // Enhanced sitemap configuration for podcast SEO
      customPages: [
        // Add any custom pages that might not be auto-discovered
        "https://theaviationbusinesspodcast.com/rss.xml",
      ],

      // Priority configuration for different content types
      serialize(item) {
        const url = item.url;
        const now = new Date();

        // Homepage gets highest priority
        if (url === "https://theaviationbusinesspodcast.com/") {
          return {
            ...item,
            priority: 1.0,
            changefreq: "weekly",
            lastmod: now, // Updated whenever new episodes are published
          };
        }

        // Episode pages get high priority (podcast content is key)
        if (url.includes("/episodes/") && !url.includes("/page/")) {
          return {
            ...item,
            priority: 0.9,
            changefreq: "monthly",
            // Episodes rarely change once published
            lastmod: item.lastmod || now,
          };
        }

        // Guest pages get high priority
        if (url.includes("/guests/") && !url.includes("/page/")) {
          return {
            ...item,
            priority: 0.8,
            changefreq: "monthly",
            // Guest pages may get updated with new episodes
            lastmod: item.lastmod || now,
          };
        }

        // Main section pages (episodes index, guests index, about)
        if (
          url.includes("/episodes") ||
          url.includes("/guests") ||
          url.includes("/about")
        ) {
          return {
            ...item,
            priority: 0.8,
            changefreq: "weekly",
            lastmod: now, // These update with new content
          };
        }

        // Category and tag pages (updated when new episodes are added)
        if (url.includes("/categories/") || url.includes("/tags/")) {
          return {
            ...item,
            priority: 0.7,
            changefreq: "weekly",
            lastmod: now, // Categories/tags update with new episodes
          };
        }

        // Pagination pages
        if (url.includes("/page/")) {
          return {
            ...item,
            priority: 0.6,
            changefreq: "weekly",
            lastmod: now, // Pagination changes with new content
          };
        }

        // Category and tag index pages
        if (url.includes("/categories") || url.includes("/tags")) {
          return {
            ...item,
            priority: 0.6,
            changefreq: "weekly",
            lastmod: now, // Index pages update with new content
          };
        }

        // Contact and other utility pages
        if (url.includes("/contact") || url.includes("/privacy-policy")) {
          return {
            ...item,
            priority: 0.5,
            changefreq: "monthly",
            lastmod: item.lastmod || now,
          };
        }

        // Default for any other pages
        return {
          ...item,
          priority: 0.5,
          changefreq: "monthly",
          lastmod: item.lastmod || now,
        };
      },

      // Filter function to exclude certain URLs
      filter: (page) => {
        // Exclude draft content, development pages, and utility files
        if (
          page.includes("/draft/") ||
          page.includes("/test/") ||
          page.includes("/elements") || // Remove elements demo page
          page.includes("/.")
        ) {
          return false;
        }
        return true;
      },

      // Note: trailingSlash and i18n are handled at the Astro config level, not sitemap level
    }),
    AutoImport({
      imports: [
        "@/shortcodes/Button",
        "@/shortcodes/Accordion",
        "@/shortcodes/Notice",
        "@/shortcodes/Video",
        "@/shortcodes/Youtube",
        "@/shortcodes/Tabs",
        "@/shortcodes/Tab",
      ],
    }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
    shikiConfig: { theme: "one-dark-pro", wrap: true },
    extendDefaultPlugins: true,
  },
});
