// ============================================================================
// EXAMPLE SCULPT SCHEMAS
// Demonstrates how to use the sculpt transformation engine for API responses
// Replace these with your actual API response schemas
// ============================================================================

/**
 * @fileoverview
 * Sculpt schemas map raw API JSON responses into clean, typed domain models.
 *
 * Syntax guide:
 * - '@link.path'        → Extract value at JSON path
 * - '@link.path::type'  → Extract + type cast (::number, ::string, ::date)
 * - (data) => value     → Custom transformation function
 * - { $map, $transform } → Array mapping
 *
 * @see {@link ../json-sculpt/sculpt.js} for the transformation engine
 */

// ============================================================================
// EXAMPLE: USER SCHEMA
// Maps a raw user API response to a clean user model
// ============================================================================

/**
 * Example: Maps raw user object from API to a clean User model.
 *
 * Raw API response:
 * {
 *   "user_id": "12345",
 *   "first_name": "John",
 *   "last_name": "Doe",
 *   "email_address": "john@example.com",
 *   "created_at": "2024-01-15T10:30:00Z",
 *   "profile": { "avatar_url": "https://...", "bio": "..." }
 * }
 *
 * @type {Object}
 */
export const UserSchema = {
  id: '@link.user_id',
  firstName: '@link.first_name',
  lastName: '@link.last_name',
  email: '@link.email_address',
  createdAt: '@link.created_at',
  avatarUrl: '@link.profile.avatar_url',
  bio: '@link.profile.bio',

  /**
   * Combines first and last name
   * @param {Object} data - Raw user object
   * @returns {string} Full name
   */
  fullName: (data) => {
    return [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Unknown';
  },

  /**
   * Formats the creation date for display
   * @param {Object} data - Raw user object
   * @returns {string} Formatted date
   */
  memberSince: (data) => {
    if (!data.created_at) return '';
    try {
      return new Date(data.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
    } catch {
      return data.created_at;
    }
  },
};

// ============================================================================
// EXAMPLE: LIST ITEM SCHEMA
// Maps a raw list item from API to a display-ready model
// ============================================================================

/**
 * Example: Maps a raw item object from a paginated API response.
 *
 * @type {Object}
 */
export const ItemSchema = {
  id: '@link.id',
  title: '@link.title',
  description: '@link.description',
  status: '@link.status',
  price: '@link.price',

  /**
   * Determines if item is available
   * @param {Object} data - Raw item object
   * @returns {boolean}
   */
  isAvailable: (data) => {
    if (typeof data.available === 'boolean') return data.available;
    return data.status === 'AVAILABLE';
  },

  /**
   * Formats price for display
   * @param {Object} data - Raw item object
   * @returns {string}
   */
  formattedPrice: (data) => {
    const price = data.price || 0;
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  },
};

// ============================================================================
// USAGE EXAMPLE (in your service):
//
// import { sculpt } from '../json-sculpt/sculpt.js';
// import { UserSchema, ItemSchema } from '../mappers/example.sculpt.js';
//
// // Single object:
// const user = sculpt.data({ data: rawApiResponse, to: UserSchema });
//
// // Array of objects:
// const items = sculpt.data({ data: rawItems, to: ItemSchema });
// ============================================================================
