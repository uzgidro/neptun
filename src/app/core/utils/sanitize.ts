import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content using DOMPurify.
 * Removes dangerous tags/attributes while preserving safe HTML.
 */
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target']
    });
}

/**
 * Sanitize SVG content using DOMPurify.
 * Preserves SVG-specific tags and attributes.
 */
export function sanitizeSvg(svg: string): string {
    return DOMPurify.sanitize(svg, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['use'],
        ADD_ATTR: ['xlink:href', 'clip-path', 'fill-rule', 'flood-color', 'flood-opacity']
    });
}
