ALTER TABLE public.training_cards ADD COLUMN image_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true);

CREATE POLICY "Anyone can view card images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'card-images');

CREATE POLICY "Editors can upload card images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'card-images' AND public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Editors can update card images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'card-images' AND public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Editors can delete card images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'card-images' AND public.is_editor_or_admin(auth.uid()));