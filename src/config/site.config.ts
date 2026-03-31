const SITE_URL = import.meta.env.SITE_URL || '';
const GOOGLE_SITE_VERIFICATION = import.meta.env.GOOGLE_SITE_VERIFICATION || '';
const BING_SITE_VERIFICATION = import.meta.env.BING_SITE_VERIFICATION || '';

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  author: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  socialLinks: string[];
  twitter?: {
    site: string;
    creator: string;
  };
  verification?: {
    google?: string;
    bing?: string;
  };
  /** ISO 3166-1 alpha-2 default country for phone input (e.g. 'AU', 'US', 'GB') */
  phoneCountryCode?: string;
  /**
   * Branding configuration
   * Logo files: Replace SVGs in src/assets/branding/
   * Favicon: Replace in public/favicon.svg
   */
  branding: {
    /** Logo alt text for accessibility */
    logo: {
      alt: string;
    };
    /** Favicon path (lives in public/) */
    favicon: {
      svg: string;
    };
    /** Theme colors for manifest and browser UI */
    colors: {
      /** Browser toolbar color (hex) */
      themeColor: string;
      /** PWA splash screen background (hex) */
      backgroundColor: string;
    };
  };
}

const siteConfig: SiteConfig = {
  name: 'Effective Outcomes',
  description: 'Executive Fitness & Performance Coaching',
  url: SITE_URL || 'https://www.effective-outcomes.com',
  ogImage: '/og-default.png',
  author: 'Alvin Sicre',
  email: 'alvin@effective-outcomes.com',
  phoneCountryCode: 'LU',
  socialLinks: [],
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
    bing: BING_SITE_VERIFICATION,
  },
  branding: {
    logo: {
      alt: 'Effective Outcomes',
    },
    favicon: {
      svg: '/favicon.svg',
    },
    colors: {
      themeColor: '#0F0F0F',
      backgroundColor: '#0F0F0F',
    },
  },
};

export default siteConfig;
