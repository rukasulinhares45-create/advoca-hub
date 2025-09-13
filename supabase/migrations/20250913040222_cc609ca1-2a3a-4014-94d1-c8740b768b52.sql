-- Create comprehensive database schema for law firm management

-- Create enum types
CREATE TYPE public.client_type AS ENUM ('PF', 'PJ');
CREATE TYPE public.document_status AS ENUM ('pending', 'review', 'approved', 'rejected');
CREATE TYPE public.audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'DOWNLOAD');

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type client_type NOT NULL,
  name TEXT NOT NULL,
  document TEXT NOT NULL UNIQUE, -- CPF ou CNPJ
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  occupation TEXT, -- Para PF
  activity TEXT, -- Para PJ
  address JSONB NOT NULL DEFAULT '{}', -- Armazena endereço completo
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT, -- Path no storage
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  status document_status NOT NULL DEFAULT 'pending',
  tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table for complete audit trail
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action audit_action NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('client-photos', 'client-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- RLS Policies for clients table
CREATE POLICY "Users can view their own clients and admins can view all"
ON public.clients FOR SELECT
USING (
  created_by = auth.uid() OR 
  public.is_admin(auth.uid())
);

CREATE POLICY "Users can create clients"
ON public.clients FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own clients and admins can update all"
ON public.clients FOR UPDATE
USING (
  created_by = auth.uid() OR 
  public.is_admin(auth.uid())
);

CREATE POLICY "Only admins can delete clients"
ON public.documents FOR DELETE
USING (public.is_admin(auth.uid()));

-- RLS Policies for documents table
CREATE POLICY "Users can view documents of their clients and admins can view all"
ON public.documents FOR SELECT
USING (
  created_by = auth.uid() OR 
  public.is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = documents.client_id AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Users can create documents"
ON public.documents FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = client_id AND (c.created_by = auth.uid() OR public.is_admin(auth.uid()))
  )
);

CREATE POLICY "Users can update documents of their clients and admins can update all"
ON public.documents FOR UPDATE
USING (
  created_by = auth.uid() OR 
  public.is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = documents.client_id AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete documents of their clients and admins can delete all"
ON public.documents FOR DELETE
USING (
  created_by = auth.uid() OR 
  public.is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = documents.client_id AND c.created_by = auth.uid()
  )
);

-- RLS Policies for audit_logs table
CREATE POLICY "Users can view their own audit logs and admins can view all"
ON public.audit_logs FOR SELECT
USING (
  user_id = auth.uid() OR 
  public.is_admin(auth.uid())
);

CREATE POLICY "Only system can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true); -- Controlled by triggers

-- Storage policies for documents bucket
CREATE POLICY "Users can view documents they have access to"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND (
    public.is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.documents d
      JOIN public.clients c ON c.id = d.client_id
      WHERE d.file_path = name AND (
        d.created_by = auth.uid() OR
        c.created_by = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete documents they have access to"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND (
    public.is_admin(auth.uid()) OR
    auth.uid()::text = (storage.foldername(name))[1]
  )
);

-- Storage policies for client-photos bucket
CREATE POLICY "Users can view client photos they have access to"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'client-photos' AND (
    public.is_admin(auth.uid()) OR
    auth.uid()::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can upload client photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'client-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update client photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'client-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete client photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'client-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers
CREATE TRIGGER clients_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER documents_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Create timestamp update triggers
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_clients_document ON public.clients(document);
CREATE INDEX idx_clients_created_by ON public.clients(created_by);
CREATE INDEX idx_clients_type ON public.clients(type);
CREATE INDEX idx_documents_client_id ON public.documents(client_id);
CREATE INDEX idx_documents_created_by ON public.documents(created_by);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Create helpful views
CREATE VIEW public.client_summary AS
SELECT 
  c.*,
  COUNT(d.id) as document_count,
  COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_documents,
  MAX(d.created_at) as last_document_date
FROM public.clients c
LEFT JOIN public.documents d ON c.id = d.client_id
GROUP BY c.id;

-- Create function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  total_clients BIGINT,
  total_documents BIGINT,
  pending_documents BIGINT,
  recent_activity BIGINT
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;