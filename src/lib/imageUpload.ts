import { supabase } from './supabase';

export type ImageUploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

/**
 * Upload an image to Supabase storage
 * @param file - The image file to upload
 * @param folder - The folder name (usually 'wardrobe' for wardrobe items)
 * @param userId - The user ID for organizing files
 * @returns Promise with upload result
 */
export async function uploadImage(
  file: File, 
  folder: string = 'wardrobe',
  userId?: string
): Promise<ImageUploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Please select a valid image file'
      };
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Image size must be less than 10MB'
      };
    }

    // Get current user if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }
      userId = user.id;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${timestamp}_${randomId}.${fileExt}`;
    const filePath = `${userId}/${folder}/${fileName}`;

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from('wardrobe-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image'
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('wardrobe-images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl
    };

  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Delete an image from Supabase storage
 * @param imageUrl - The full URL of the image to delete
 * @returns Promise with deletion result
 */
export async function deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split('/');
    
    // Find the storage path after 'wardrobe-images'
    const bucketIndex = pathSegments.findIndex(segment => segment === 'wardrobe-images');
    if (bucketIndex === -1) {
      return {
        success: false,
        error: 'Invalid image URL format'
      };
    }
    
    const filePath = pathSegments.slice(bucketIndex + 1).join('/');
    
    const { error } = await supabase.storage
      .from('wardrobe-images')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete image'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Image deletion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Compress an image file before upload
 * @param file - The image file to compress
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param quality - Compression quality (0-1)
 * @returns Promise with compressed file
 */
export function compressImage(
  file: File, 
  maxWidth: number = 1200, 
  maxHeight: number = 1200, 
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas size and draw image
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob and create new file
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}