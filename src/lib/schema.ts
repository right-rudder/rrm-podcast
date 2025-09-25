import config from "@/config/config.json";
import { format } from "date-fns";

// Base organization schema for Right Rudder Marketing
export const getOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Right Rudder Marketing",
    url: config.site.base_url,
    logo: `${config.site.base_url}${config.metadata.meta_image}`,
    description: config.metadata.meta_description,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
    },
    sameAs: [
      // Add social media URLs here if available
    ],
  };
};

// Podcast series schema for the main podcast
export const getPodcastSeriesSchema = (episodes?: any[]) => {
  const episodeList =
    episodes?.map((episode) => ({
      "@type": "PodcastEpisode",
      name: episode.data.title,
      description: episode.data.description || config.metadata.meta_description,
      url: `${config.site.base_url}/episodes/${episode.id}`,
      datePublished: episode.data.date
        ? format(new Date(episode.data.date), "yyyy-MM-dd")
        : undefined,
      episodeNumber: episode.data.episode,
      partOfSeries: {
        "@type": "PodcastSeries",
        name: config.site.title,
        url: config.site.base_url,
      },
    })) || [];

  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: config.site.title,
    description: config.metadata.meta_description,
    url: config.site.base_url,
    image: `${config.site.base_url}${config.metadata.meta_image}`,
    author: getOrganizationSchema(),
    publisher: getOrganizationSchema(),
    episodes: episodeList.slice(0, 10), // Limit to latest 10 episodes to avoid bloat
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": config.site.base_url,
    },
  };
};

// Individual podcast episode schema
export const getPodcastEpisodeSchema = (episode: any) => {
  const {
    title,
    description,
    date,
    image,
    episode: episodeNumber,
    season,
  } = episode.data;

  return {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: title,
    description: description || config.metadata.meta_description,
    url: `${config.site.base_url}/episodes/${episode.id}`,
    datePublished: date ? format(new Date(date), "yyyy-MM-dd") : undefined,
    episodeNumber: episodeNumber,
    seasonNumber: season,
    image: image
      ? `${config.site.base_url}${image}`
      : `${config.site.base_url}${config.metadata.meta_image}`,
    partOfSeries: {
      "@type": "PodcastSeries",
      name: config.site.title,
      url: config.site.base_url,
    },
    author: getOrganizationSchema(),
    publisher: getOrganizationSchema(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${config.site.base_url}/episodes/${episode.id}`,
    },
  };
};

// Person schema for guests
export const getPersonSchema = (guest: any) => {
  const { title, description, image, email } = guest.data;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: title,
    description: description,
    image: image ? `${config.site.base_url}${image}` : undefined,
    email: email,
    url: `${config.site.base_url}/guests/${guest.id}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${config.site.base_url}/guests/${guest.id}`,
    },
  };
};

// Website schema for general pages
export const getWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Website",
    name: config.site.title,
    description: config.metadata.meta_description,
    url: config.site.base_url,
    publisher: getOrganizationSchema(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${config.site.base_url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
};

// Breadcrumb schema generator
export const getBreadcrumbSchema = (
  breadcrumbs: { name: string; url: string }[],
) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
};

// WebPage schema for generic pages
export const getWebPageSchema = (page: {
  title: string;
  description?: string;
  url: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description || config.metadata.meta_description,
    url: page.url,
    isPartOf: {
      "@type": "Website",
      name: config.site.title,
      url: config.site.base_url,
    },
    author: getOrganizationSchema(),
    publisher: getOrganizationSchema(),
  };
};

// Collection page schema (for episode listings, guest listings, etc.)
export const getCollectionPageSchema = (page: {
  title: string;
  description?: string;
  url: string;
  items?: any[];
  itemType?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.title,
    description: page.description || config.metadata.meta_description,
    url: page.url,
    isPartOf: {
      "@type": "Website",
      name: config.site.title,
      url: config.site.base_url,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: page.items?.length || 0,
      itemListElement:
        page.items?.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${config.site.base_url}/${page.itemType || "items"}/${item.id || item.slug}`,
        })) || [],
    },
  };
};

// FAQ Page schema (if you have FAQ content)
export const getFAQPageSchema = (
  faqs: { question: string; answer: string }[],
) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
};

// Helper function to generate JSON-LD script tag
export const generateSchemaScript = (schema: object) => {
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
};

// Helper to combine multiple schemas
export const combineSchemas = (schemas: object[]) => {
  return schemas.filter(Boolean); // Remove any null/undefined schemas
};
