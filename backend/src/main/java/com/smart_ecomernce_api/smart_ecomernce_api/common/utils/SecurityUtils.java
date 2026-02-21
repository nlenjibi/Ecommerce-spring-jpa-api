package com.smart_ecomernce_api.smart_ecomernce_api.common.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * SecurityUtils provides security-related utility methods
 * Handles password hashing, salt generation, and other security operations
 */
public class SecurityUtils {
    private static final Logger logger = LoggerFactory.getLogger(SecurityUtils.class);
    private static final String HASH_ALGORITHM = "SHA-256";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private SecurityUtils() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    /**
     * Hash password using SHA-256
     * @param password Plain text password
     * @return Hashed password as hex string
     * @throws SecurityException if hashing fails
     */
    public static String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance(HASH_ALGORITHM);
            byte[] hash = md.digest(password.getBytes());
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            logger.error("Error hashing password", e);
            throw new SecurityException("Error hashing password", e);
        }
    }

    /**
     * Hash password with salt (more secure)
     * @param password Plain text password
     * @param salt Salt value
     * @return Hashed password
     * @throws SecurityException if hashing fails
     */
    public static String hashPasswordWithSalt(String password, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance(HASH_ALGORITHM);
            md.update(salt.getBytes());
            byte[] hash = md.digest(password.getBytes());
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            logger.error("Error hashing password with salt", e);
            throw new SecurityException("Error hashing password with salt", e);
        }
    }

    /**
     * Generate random salt for password hashing
     * @return Base64 encoded salt
     */
    public static String generateSalt() {
        byte[] salt = new byte[16];
        SECURE_RANDOM.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }



    /**
     * Verify password against hash
     * @param password Plain text password
     * @param hash Stored hash
     * @return true if password matches
     */
    public static boolean verifyPassword(String password, String hash) {
        String hashedInput = hashPassword(password);
        return hashedInput.equals(hash);
    }


    /**
     * Convert byte array to hex string
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }


}


