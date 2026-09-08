CREATE POLICY "own files read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'study-materials' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin()));
CREATE POLICY "own files insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own files update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own files delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);