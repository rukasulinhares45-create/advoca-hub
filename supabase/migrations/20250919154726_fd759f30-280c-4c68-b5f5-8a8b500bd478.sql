-- Check and create storage policies for document downloads
-- First, let's create the proper policies for the documents bucket

-- Policy to allow users to download documents they have access to
CREATE POLICY "Users can download documents they have access to"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND (
    -- Users can download if they created the document
    EXISTS (
      SELECT 1 FROM public.documents d 
      WHERE d.file_path = name 
      AND d.created_by = auth.uid()
    )
    OR
    -- Users can download if they own the client
    EXISTS (
      SELECT 1 FROM public.documents d 
      JOIN public.clients c ON c.id = d.client_id
      WHERE d.file_path = name 
      AND c.created_by = auth.uid()
    )
    OR
    -- Admins can download all documents
    public.is_admin(auth.uid())
  )
);