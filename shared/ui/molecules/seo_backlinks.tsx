/**
 * SEO Backlinks Component
 * Purpose: Render SEO-friendly backlinks to enhance search engine optimization
 * Location: shared/ui/molecules/seo_backlinks.tsx
 *
 * Features:
 * - Invisible backlinks for search engine crawlers
 * - JSON-LD structured data for enhanced SEO
 * - Configurable for different page types (property, list, generic)
 * - Environment-aware (uses SEO config)
 *
 * Usage:
 * ```tsx
 * import { SeoBacklinks } from '@shared/ui/molecules/seo_backlinks';
 *
 * <SeoBacklinks
 *   page_type="property"
 *   page_url="https://yoursite.com/property/123"
 *   property_name="Luxury Condo in Bangkok"
 * />
 * ```
 */

'use client';

import { useEffect } from 'react';
import { SEO_CONFIG, get_backlink_schema, get_seo_keywords } from '@shared/config/seo_config';

export interface SeoBacklinksProps {
  /**
   * Type of page where backlinks are rendered
   * - 'property': Individual property detail page
   * - 'list': Property listing/browse page
   * - 'generic': Other dynamic pages
   */
  page_type: 'property' | 'list' | 'generic';

  /**
   * Current page URL (full URL including protocol)
   */
  page_url: string;

  /**
   * Optional: Property name for property pages
   */
  property_name?: string;

  /**
   * Optional: Additional context for generic pages
   */
  page_context?: string;
}

/**
 * SeoBacklinks Component
 * Purpose: Render invisible backlinks and structured data for SEO enhancement
 *
 * @param page_type - Type of page ('property' | 'list' | 'generic')
 * @param page_url - Current page URL
 * @param property_name - Optional property name for property pages
 * @param page_context - Optional context for generic pages
 */
export function SeoBacklinks({
  page_type,
  page_url,
  property_name,
  page_context
}: SeoBacklinksProps) {
  console.log('[SeoBacklinks] Rendering SEO backlinks', {
    page_type,
    page_url,
    property_name,
    page_context,
    enabled: SEO_CONFIG.enable_backlinks
  });

  // Don't render if backlinks are disabled
  if (!SEO_CONFIG.enable_backlinks) {
    return null;
  }

  // Generate JSON-LD schema with keywords
  const schema = get_backlink_schema(page_type, page_url, property_name);

  // Get SEO keywords for rich backlink anchor text
  const primary_keywords_en = get_seo_keywords('english', 'primary');
  const primary_keywords_th = get_seo_keywords('thai', 'primary');
  const secondary_keywords_en = get_seo_keywords('english', 'secondary');

  useEffect(() => {
    console.log('[SeoBacklinks] Component mounted', {
      page_type,
      main_domain: SEO_CONFIG.main_domain,
      property_domain: SEO_CONFIG.property_domain,
      keyword_count: primary_keywords_en.length + primary_keywords_th.length
    });
  }, [page_type, primary_keywords_en.length, primary_keywords_th.length]);

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Invisible Backlinks for Search Engines with Rich Keywords */}
      <div className="sr-only" aria-hidden="true">
        {/* Main domain backlink with English keywords */}
        <a
          href={SEO_CONFIG.main_domain}
          rel="noopener noreferrer"
          title={`${SEO_CONFIG.main_domain_name} - ${primary_keywords_en.slice(0, 4).join(', ')}`}
        >
          {SEO_CONFIG.main_domain_name} - {primary_keywords_en.slice(0, 3).join(', ')} platform with {secondary_keywords_en.slice(0, 2).join(' and ')}
        </a>

        {/* Main domain backlink with Thai keywords */}
        <a
          href={SEO_CONFIG.main_domain}
          rel="noopener noreferrer"
          title={`${SEO_CONFIG.main_domain_name} - ${primary_keywords_th.slice(0, 4).join(', ')}`}
        >
          {SEO_CONFIG.main_domain_name} - แพลตฟอร์ม{primary_keywords_th.slice(0, 3).join(', ')} พร้อม{primary_keywords_th.slice(3, 5).join('และ')}
        </a>

        {/* Property domain backlink (for property-related pages) */}
        {(page_type === 'property' || page_type === 'list') && (
          <>
            <a
              href={SEO_CONFIG.property_domain}
              rel="noopener noreferrer"
              title={`Browse ${primary_keywords_en[0]} and ${primary_keywords_en[1]} at ${SEO_CONFIG.property_domain_name}`}
            >
              {SEO_CONFIG.property_domain_name} - Browse {primary_keywords_en.slice(0, 2).join(', ')}, search with {secondary_keywords_en[0]}
            </a>

            <a
              href={SEO_CONFIG.property_domain}
              rel="noopener noreferrer"
              title={`ค้นหา${primary_keywords_th.slice(0, 3).join(', ')} ที่ ${SEO_CONFIG.property_domain_name}`}
            >
              {SEO_CONFIG.property_domain_name} - ค้นหา{primary_keywords_th.slice(0, 3).join(', ')} ด้วยระบบ AI
            </a>
          </>
        )}

        {/* Property-specific backlink with rich anchor text */}
        {page_type === 'property' && property_name && (
          <>
            <a
              href={SEO_CONFIG.property_domain}
              rel="noopener noreferrer"
              title={`Find ${primary_keywords_en[1]} like ${property_name}`}
            >
              Browse similar {primary_keywords_en[1]} to {property_name} - {primary_keywords_en[0]} search with {secondary_keywords_en[1]} on {SEO_CONFIG.property_domain_name}
            </a>

            <a
              href={SEO_CONFIG.property_domain}
              rel="noopener noreferrer"
              title={`ค้นหา${primary_keywords_th[0]}เหมือน ${property_name}`}
            >
              ค้นหา{primary_keywords_th[0]}ใกล้เคียง {property_name} - {primary_keywords_th.slice(1, 3).join('และ')} บน {SEO_CONFIG.property_domain_name}
            </a>
          </>
        )}

        {/* List page backlink with keywords */}
        {page_type === 'list' && (
          <>
            <a
              href={SEO_CONFIG.property_domain}
              rel="noopener noreferrer"
              title={`${primary_keywords_en[2]} and ${primary_keywords_en[3]}`}
            >
              Search and browse {primary_keywords_en.slice(0, 2).join(', ')} - {primary_keywords_en[2]} with {secondary_keywords_en[2]} at {SEO_CONFIG.property_domain_name}
            </a>

            <a
              href={SEO_CONFIG.property_domain}
              rel="noopener noreferrer"
              title={`${primary_keywords_th[2]} และ ${primary_keywords_th[3]}`}
            >
              ค้นหาและดู{primary_keywords_th.slice(0, 4).join(', ')} - {primary_keywords_th[4]} ด้วย AI บน {SEO_CONFIG.property_domain_name}
            </a>
          </>
        )}

        {/* Generic page context with keywords */}
        {page_type === 'generic' && page_context && (
          <>
            <a
              href={SEO_CONFIG.main_domain}
              rel="noopener noreferrer"
              title={`${page_context} - ${primary_keywords_en.slice(0, 3).join(', ')}`}
            >
              {page_context} - {primary_keywords_en[2]} powered by {secondary_keywords_en[0]} at {SEO_CONFIG.main_domain_name}
            </a>

            <a
              href={SEO_CONFIG.main_domain}
              rel="noopener noreferrer"
              title={`${page_context} - ${primary_keywords_th.slice(0, 3).join(', ')}`}
            >
              {page_context} - {primary_keywords_th[2]} ที่ขับเคลื่อนด้วย AI ที่ {SEO_CONFIG.main_domain_name}
            </a>
          </>
        )}

        {/* Additional keyword-rich content for search engines */}
        <p>
          Discover {primary_keywords_en[0]} and {primary_keywords_en[1]} with our {secondary_keywords_en[0]} platform.
          Featuring {secondary_keywords_en[1]}, {secondary_keywords_en[2]}, and {secondary_keywords_en[3]}.
          Search for {primary_keywords_en.slice(2, 5).join(', ')} using our {secondary_keywords_en[4]}.
        </p>

        <p>
          ค้นพบ{primary_keywords_th.slice(0, 4).join(', ')} กับแพลตฟอร์ม{primary_keywords_th[4]}ของเรา
          มีฟีเจอร์{primary_keywords_th[5]}, {primary_keywords_th[6]}, และ{primary_keywords_th[7]}
          ค้นหาและจัดการด้วยระบบ AI อัจฉริยะ
        </p>
      </div>

      {/* Additional meta tags for enhanced SEO */}
      <link rel="canonical" href={page_url} />
      <link rel="home" href={SEO_CONFIG.main_domain} />
    </>
  );
}

/**
 * Export default
 */
export default SeoBacklinks;
