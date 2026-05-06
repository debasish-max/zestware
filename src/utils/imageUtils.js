export const getProductImage = (img) => {
  if (!img) return 'https://via.placeholder.com/400?text=No+Image';
  
  // If it's already an array, return the first element
  if (Array.isArray(img)) {
    return img[0] || 'https://via.placeholder.com/400?text=No+Image';
  }
  
  // If it's a string, it might be a direct URL or a JSON-encoded array
  if (typeof img === 'string') {
    // Check if it looks like a JSON array
    if (img.startsWith('[') && img.endsWith(']')) {
      try {
        const parsed = JSON.parse(img);
        if (Array.isArray(parsed)) {
          return parsed[0] || 'https://via.placeholder.com/400?text=No+Image';
        }
      } catch (e) {
        // Not valid JSON, treat as direct URL
        return img;
      }
    }
    // Direct URL
    return img;
  }
  
  return 'https://via.placeholder.com/400?text=No+Image';
};

export const getAllProductImages = (img) => {
  if (!img) return [];
  
  if (Array.isArray(img)) {
    return img;
  }
  
  if (typeof img === 'string') {
    if (img.startsWith('[') && img.endsWith(']')) {
      try {
        const parsed = JSON.parse(img);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        return [img];
      }
    }
    return [img];
  }
  
  return [];
};
