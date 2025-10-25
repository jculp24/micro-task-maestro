-- Create highlight_images table
CREATE TABLE public.highlight_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  campaign_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active',
  CONSTRAINT highlight_images_uploader_id_fkey FOREIGN KEY (uploader_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.highlight_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for highlight_images
CREATE POLICY "Users can insert own images"
ON public.highlight_images
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can view own images"
ON public.highlight_images
FOR SELECT
TO authenticated
USING (auth.uid() = uploader_id);

CREATE POLICY "Users can update own images"
ON public.highlight_images
FOR UPDATE
TO authenticated
USING (auth.uid() = uploader_id);

CREATE POLICY "Users can delete own images"
ON public.highlight_images
FOR DELETE
TO authenticated
USING (auth.uid() = uploader_id);

-- Create storage bucket for highlight images
INSERT INTO storage.buckets (id, name, public)
VALUES ('highlight-images', 'highlight-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'highlight-images');

CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'highlight-images');

CREATE POLICY "Users can update own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'highlight-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'highlight-images' AND auth.uid()::text = (storage.foldername(name))[1]);