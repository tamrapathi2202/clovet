-- Storage setup for wardrobe images
-- This should be run as a separate migration after the main schema

-- Create a bucket for wardrobe images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wardrobe-images', 'wardrobe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow users to upload their own images
CREATE POLICY "Users can upload wardrobe images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'wardrobe-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to view their own images
CREATE POLICY "Users can view their wardrobe images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'wardrobe-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete their own images
CREATE POLICY "Users can delete their wardrobe images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'wardrobe-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to update their own images
CREATE POLICY "Users can update their wardrobe images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'wardrobe-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);