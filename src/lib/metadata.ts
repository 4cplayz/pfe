// src/lib/metadata.ts
import { Metadata } from "next";

// Define base URL for canonical links
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://iato.ca';

// App name
export const siteName = "iato";
export const siteNameFull = "Plateforme de Journalisation Numérique pour Étudiants";

// Default metadata object that can be imported and extended in layout.tsx
export const defaultMetadata: Metadata = {
  // Basic metadata
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: "Plateforme de journalisation numérique pour les étudiants en laboratoire. Un moyen simple et efficace de documenter vos expériences et observations.",
  
  // Standard metadata tags
  applicationName: siteName,
  authors: [{ name: "iato Development Team" }],
  generator: "Next.js",
  keywords: ["journal numérique", "laboratoire", "éducation", "science", "documentation", "étudiants"],
  referrer: "origin-when-cross-origin",
  
  // Mobile-specific viewport settings
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,  // Prevents pinch zooming on Safari (can be controversial for accessibility)
    userScalable: false, // Prevents user scaling (improves form behavior on iOS)
    viewportFit: 'cover', // Important for iOS devices with notches
  },
  
  // Apple-specific metadata
  appleWebApp: {
    capable: true, // Makes your site feel more app-like on iOS
    statusBarStyle: 'black-translucent',
    title: siteName,
  },
  
  // Control crawler behavior
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  
  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico" },
    ],
    // Add Apple touch icons for Safari
    apple: [
      { url: "/iato_500x500_B.svg", sizes: "180x180", type: "image/svg+xml" }
    ],
  },
  
  // Add mobile app capability
  other: {
    "apple-mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
    "mobile-web-app-capable": "yes",
  }
};

// Function to create page-specific metadata
export function createMetadata({
  title,
  description,
  path = '',
  openGraph = {},
  twitter = {},
  robots = {},
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  openGraph?: Partial<typeof defaultMetadata.openGraph>;
  twitter?: Partial<typeof defaultMetadata.twitter>;
  robots?: Partial<typeof defaultMetadata.robots>;
  noIndex?: boolean;
}): Metadata {
  const url = `${baseUrl}${path}`;
  
  return {
    ...defaultMetadata,
    title: title,
    description: description || defaultMetadata.description,
    
    // Update canonical URL for this specific page
    alternates: {
      ...defaultMetadata.alternates,
      canonical: path,
    },
    
    // Update Open Graph details
    openGraph: {
      ...defaultMetadata.openGraph,
      ...openGraph,
      url,
      title: title || defaultMetadata.openGraph?.title,
      description: description || defaultMetadata.openGraph?.description,
    },
    
    // Update Twitter details
    twitter: {
      ...defaultMetadata.twitter,
      ...twitter,
      title: title || defaultMetadata.twitter?.title,
      description: description || defaultMetadata.twitter?.description,
    },
    
    // Handle noIndex pages
    robots: noIndex 
      ? { 
          index: false, 
          follow: false,
          googleBot: { index: false, follow: false }
        }
      : {
          ...defaultMetadata.robots,
          ...robots,
        },
  };
}