package com.smart_ecomernce_api.smart_ecomernce_api.common.utils;


import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility service for generating URL-friendly slugs
 * Follows industry standards (Amazon, Shopify, Jumia, Alibaba)
 */
@Component
public class SlugGenerator {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern EDGES_DASHES = Pattern.compile("(^-|-$)");
    private static final Pattern MULTIPLE_DASHES = Pattern.compile("-{2,}");

    /**
     * Generate a URL-friendly slug from a string
     * Examples:
     * - "Samsung Galaxy S24 Ultra" → "samsung-galaxy-s24-ultra"
     * - "Men's Fashion & Accessories" → "mens-fashion-accessories"
     * - "Premium Coffee (250g)" → "premium-coffee-250g"
     *
     * @param input the input string
     * @return URL-friendly slug
     */
    public String generateSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException("Input string cannot be null or empty");
        }

        String slug = input.trim().toLowerCase(Locale.ENGLISH);

        // Normalize unicode characters (é → e, ñ → n)
        slug = Normalizer.normalize(slug, Normalizer.Form.NFD);

        // Replace whitespace with dashes
        slug = WHITESPACE.matcher(slug).replaceAll("-");

        // Remove non-alphanumeric characters (except dashes)
        slug = NON_LATIN.matcher(slug).replaceAll("");

        // Replace multiple consecutive dashes with single dash
        slug = MULTIPLE_DASHES.matcher(slug).replaceAll("-");

        // Remove dashes from edges
        slug = EDGES_DASHES.matcher(slug).replaceAll("");

        if (slug.isEmpty()) {
            throw new IllegalArgumentException("Generated slug is empty after processing");
        }

        return slug;
    }


}

