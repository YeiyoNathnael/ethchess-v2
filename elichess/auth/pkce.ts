"use client"

import crypto from 'crypto';

/**
 * Encodes a buffer as URL-safe base64
 * 
 * This is used for PKCE code challenge and verifier generation
 * 
 * @param buffer - Buffer to encode
 * @returns URL-safe base64 encoded string
 */

export const base64URLEncode = (buffer: Buffer): string => {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Creates a SHA-256 hash of a string
 * 
 * @param str - String to hash
 * @returns Buffer containing the hash
 */
// @ts-ignore
export const sha256 = (str: string): Buffer => 
  crypto.createHash('sha256').update(str).digest();

/**
 * Generates a random code verifier for PKCE
 * 
 * @returns A random code verifier string
 */
export const createVerifier = (): string => 
  base64URLEncode(crypto.randomBytes(32));

/**
 * Creates a code challenge from a verifier
 * 
 * @param verifier - The code verifier
 * @returns The code challenge
 */
export const createChallenge = (verifier: string): string => 
  base64URLEncode(sha256(verifier));

/**
 * Generates a random string for use as a PKCE code verifier
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => 
    ('0' + (byte & 0xFF).toString(16)).slice(-2)
  ).join('');
}

/**
 * Creates a code challenge from a verifier using SHA-256
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  // Convert to base64url encoding
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}