// Utility functions for formatting time and dates
export const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return '' + Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return '' + Math.floor(seconds / 3600) + 'h ago';
  if (seconds < 2592000) return '' + Math.floor(seconds / 86400) + 'd ago';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return '' + Math.floor(diff / 60000) + ' minutes ago';
  if (diff < 86400000) return '' + Math.floor(diff / 3600000) + ' hours ago';
  if (diff < 604800000) return '' + Math.floor(diff / 86400000) + ' days ago';
  
  return new Date(timestamp).toLocaleDateString();
};