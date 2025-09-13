-- Remove problematic view and replace with a function to avoid security definer issues
DROP VIEW IF EXISTS public.client_summary;

-- Create a function instead of a view to avoid security definer issues
CREATE OR REPLACE FUNCTION public.get_client_summary()
RETURNS TABLE (
  id UUID,
  type client_type,
  name TEXT,
  document TEXT,
  email TEXT,
  phone TEXT,
  occupation TEXT,
  activity TEXT,
  address JSONB,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  document_count BIGINT,
  pending_documents BIGINT,
  last_document_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.type,
    c.name,
    c.document,
    c.email,
    c.phone,
    c.occupation,
    c.activity,
    c.address,
    c.created_by,
    c.created_at,
    c.updated_at,
    COUNT(d.id) as document_count,
    COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_documents,
    MAX(d.created_at) as last_document_date
  FROM public.clients c
  LEFT JOIN public.documents d ON c.id = d.client_id
  WHERE (c.created_by = auth.uid() OR public.is_admin(auth.uid()))
  GROUP BY c.id, c.type, c.name, c.document, c.email, c.phone, c.occupation, c.activity, c.address, c.created_by, c.created_at, c.updated_at;
END;
$$;