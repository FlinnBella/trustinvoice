import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadInvoicePDF = async (file: File, invoiceId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${invoiceId}.${fileExt}`;
  const filePath = `invoices/${fileName}`;

  const { data, error } = await supabase.storage
    .from('invoice-pdfs')
    .upload(filePath, file);

  if (error) throw error;
  return data;
};

export const getInvoicePDFUrl = async (filePath: string) => {
  const { data } = supabase.storage
    .from('invoice-pdfs')
    .getPublicUrl(filePath);

  return data.publicUrl;
};