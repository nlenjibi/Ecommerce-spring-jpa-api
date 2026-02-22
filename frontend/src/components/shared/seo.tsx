import { Head } from '@components';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  noIndex?: boolean;
  canonical?: string;
  alternateUrls?: Array<{ lang: string; url: string }>;
  structuredData?: Record<string, any>;
}

export function SEO({
  title,
  description,
  keywords,
  author,
  url,
  image,
  type = 'website',
  siteName = 'ShopHub',
  noIndex = false,
  canonical,
  alternateUrls,
  structuredData,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || 'ShopHub - Your premier e-commerce destination for quality products';
  const metaKeywords = keywords?.join(', ') || 'e-commerce, shopping, products, online store';

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      {author && <meta name="author" content={author} />}

      {/* Open Graph */}
      <meta property="og:title" content={title || siteName} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteName} />
      <meta name="twitter:description" content={metaDescription} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Alternate Language URLs */}
      {alternateUrls?.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  );
}

export default SEO;
