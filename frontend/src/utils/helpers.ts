// frontend/src/utils/helpers.ts

/**
 * Generate a random ID of specified length
 * @param length Length of the ID to generate
 * @returns Random alphanumeric ID
 */
export const generateId = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  /**
   * Format bytes to a human readable format
   * @param bytes Number of bytes
   * @param decimals Number of decimal places
   * @returns Formatted string (e.g. "1.5 KB")
   */
  export const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  /**
   * Format a date to a readable string
   * @param timestamp Unix timestamp in milliseconds
   * @returns Formatted date string
   */
  export const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  /**
   * Calculate time elapsed since a timestamp
   * @param timestamp Unix timestamp in milliseconds
   * @returns Human readable string (e.g. "5 minutes ago")
   */
  export const getTimeElapsed = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Less than a minute
    if (diff < 60 * 1000) {
      const seconds = Math.floor(diff / 1000);
      return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }
    
    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise, days
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };