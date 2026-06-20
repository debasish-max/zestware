const optimizeCloudinaryUrl = (url) => {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/f_auto,q_auto/')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
};

export const getProductImage = (img) => {
  if (!img) return 'https://via.placeholder.com/400?text=No+Image';
  
  // If it's already an array, return the first element
  if (Array.isArray(img)) {
    return optimizeCloudinaryUrl(img[0]) || 'https://via.placeholder.com/400?text=No+Image';
  }
  
  // If it's a string, it might be a direct URL or a JSON-encoded array
  if (typeof img === 'string') {
    // Check if it looks like a JSON array
    if (img.startsWith('[') && img.endsWith(']')) {
      try {
        const parsed = JSON.parse(img);
        if (Array.isArray(parsed)) {
          return optimizeCloudinaryUrl(parsed[0]) || 'https://via.placeholder.com/400?text=No+Image';
        }
      } catch (e) {
        // Not valid JSON, treat as direct URL
        return optimizeCloudinaryUrl(img);
      }
    }
    // Direct URL
    return optimizeCloudinaryUrl(img);
  }
  
  return 'https://via.placeholder.com/400?text=No+Image';
};

export const getAllProductImages = (img) => {
  if (!img) return [];
  
  if (Array.isArray(img)) {
    return img.map(optimizeCloudinaryUrl);
  }
  
  if (typeof img === 'string') {
    if (img.startsWith('[') && img.endsWith(']')) {
      try {
        const parsed = JSON.parse(img);
        if (Array.isArray(parsed)) {
          return parsed.map(optimizeCloudinaryUrl);
        }
      } catch (e) {
        return [optimizeCloudinaryUrl(img)];
      }
    }
    return [optimizeCloudinaryUrl(img)];
  }
  
  return [];
};
