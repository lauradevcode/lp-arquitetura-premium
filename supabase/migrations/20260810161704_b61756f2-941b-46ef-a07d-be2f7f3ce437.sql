CREATE SCHEMA IF NOT EXISTS app_private;
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION app_private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY "Admins manage projects" ON public.projects;
CREATE POLICY "Admins manage projects" ON public.projects FOR ALL TO authenticated USING (app_private.has_role(auth.uid(), 'admin')) WITH CHECK (app_private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins manage project images" ON public.project_images;
CREATE POLICY "Admins manage project images" ON public.project_images FOR ALL TO authenticated USING (app_private.has_role(auth.uid(), 'admin')) WITH CHECK (app_private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (app_private.has_role(auth.uid(), 'admin')) WITH CHECK (app_private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins manage site content" ON public.site_content;
CREATE POLICY "Admins manage site content" ON public.site_content FOR ALL TO authenticated USING (app_private.has_role(auth.uid(), 'admin')) WITH CHECK (app_private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins read leads" ON public.leads;
CREATE POLICY "Admins read leads" ON public.leads FOR SELECT TO authenticated USING (app_private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins update leads" ON public.leads;
CREATE POLICY "Admins update leads" ON public.leads FOR UPDATE TO authenticated USING (app_private.has_role(auth.uid(), 'admin')) WITH CHECK (app_private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins delete leads" ON public.leads;
CREATE POLICY "Admins delete leads" ON public.leads FOR DELETE TO authenticated USING (app_private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins read conversations" ON public.ai_conversations;
CREATE POLICY "Admins read conversations" ON public.ai_conversations FOR SELECT TO authenticated USING (app_private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins delete conversations" ON public.ai_conversations;
CREATE POLICY "Admins delete conversations" ON public.ai_conversations FOR DELETE TO authenticated USING (app_private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins read ai messages" ON public.ai_messages;
CREATE POLICY "Admins read ai messages" ON public.ai_messages FOR SELECT TO authenticated USING (app_private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins delete ai messages" ON public.ai_messages;
CREATE POLICY "Admins delete ai messages" ON public.ai_messages FOR DELETE TO authenticated USING (app_private.has_role(auth.uid(), 'admin'));

DROP FUNCTION public.has_role(uuid, public.app_role);