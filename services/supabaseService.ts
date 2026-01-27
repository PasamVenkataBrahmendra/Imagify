
import { supabase } from '../supabase';

const dataUrlToBlob = async (dataUrl: string) => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

export const uploadImage = async (dataUrl: string, bucket: string) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const blob = await dataUrlToBlob(dataUrl);
  const fileName = `${userData.user.id}/${Date.now()}.png`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, blob, { contentType: 'image/png' });

  if (error) throw error;
  
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return urlData.publicUrl;
};

export const logGeneration = async (table: string, payload: any) => {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from(table)
    .insert({ ...payload, user_id: userData.user?.id })
    .select();

  if (error) throw error;
  return data;
};

export const getHistory = async () => {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
};
