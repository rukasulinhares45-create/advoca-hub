-- Fix security issues detected by linter

-- Fix security definer view by recreating as regular view
DROP VIEW IF EXISTS public.client_summary;
CREATE VIEW public.client_summary AS
SELECT 
  c.*,
  COUNT(d.id) as document_count,
  COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_documents,
  MAX(d.created_at) as last_document_date
FROM public.clients c
LEFT JOIN public.documents d ON c.id = d.client_id
GROUP BY c.id;

-- Fix search_path for audit_trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_email_val TEXT;
  user_id_val UUID;
BEGIN
  -- Get current user info
  user_id_val := auth.uid();
  SELECT email INTO user_email_val FROM auth.users WHERE id = user_id_val;
  
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      table_name, record_id, action, old_data, user_id, user_email, created_at
    ) VALUES (
      TG_TABLE_NAME, OLD.id, 'DELETE'::audit_action, row_to_json(OLD), user_id_val, user_email_val, now()
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      table_name, record_id, action, old_data, new_data, user_id, user_email, created_at
    ) VALUES (
      TG_TABLE_NAME, NEW.id, 'UPDATE'::audit_action, row_to_json(OLD), row_to_json(NEW), user_id_val, user_email_val, now()
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      table_name, record_id, action, new_data, user_id, user_email, created_at
    ) VALUES (
      TG_TABLE_NAME, NEW.id, 'CREATE'::audit_action, row_to_json(NEW), user_id_val, user_email_val, now()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix search_path for get_user_stats function
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  total_clients BIGINT,
  total_documents BIGINT,
  pending_documents BIGINT,
  recent_activity BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.clients WHERE created_by = user_uuid OR public.is_admin(auth.uid())),
    (SELECT COUNT(*) FROM public.documents d 
     JOIN public.clients c ON c.id = d.client_id 
     WHERE d.created_by = user_uuid OR c.created_by = user_uuid OR public.is_admin(auth.uid())),
    (SELECT COUNT(*) FROM public.documents d 
     JOIN public.clients c ON c.id = d.client_id 
     WHERE d.status = 'pending' AND (d.created_by = user_uuid OR c.created_by = user_uuid OR public.is_admin(auth.uid()))),
    (SELECT COUNT(*) FROM public.audit_logs 
     WHERE user_id = user_uuid AND created_at > NOW() - INTERVAL '7 days');
END;
$$;