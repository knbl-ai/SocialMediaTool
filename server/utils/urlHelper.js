/**
 * Ensures a URL has the https:// prefix
 * @param {string} url - The URL to format
 * @returns {string} - The formatted URL with https:// prefix
 */
export const formatUrl = (url) => {
  if (!url) return '';
  
  // Remove any leading/trailing whitespace
  url = url.trim();
  
  // Check if the URL already has a protocol
  if (url.match(/^https?:\/\//i)) {
    return url;
  }
  
  // Add https:// prefix
  return `https://${url}`;
};
