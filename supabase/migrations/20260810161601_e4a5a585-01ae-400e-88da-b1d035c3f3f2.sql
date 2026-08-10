DROP POLICY "Published projects are public" ON public.projects;
CREATE POLICY "Published projects are public" ON public.projects FOR SELECT USING (published = true);

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;