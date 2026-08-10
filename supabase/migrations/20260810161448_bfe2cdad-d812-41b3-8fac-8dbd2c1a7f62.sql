-- roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Residencial',
  location text,
  year text,
  summary text,
  description text,
  cover_url text,
  order_index integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published projects are public" ON public.projects FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage projects" ON public.projects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.project_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_images TO authenticated;
GRANT ALL ON public.project_images TO service_role;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project images are public" ON public.project_images FOR SELECT USING (true);
CREATE POLICY "Admins manage project images" ON public.project_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- testimonials
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  quote text NOT NULL,
  photo_url text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Testimonials are public" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- site content
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site content is public" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins manage site content" ON public.site_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  project_type text,
  budget text,
  message text,
  status text NOT NULL DEFAULT 'novo',
  source text NOT NULL DEFAULT 'formulario',
  conversation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read leads" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update leads" ON public.leads FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete leads" ON public.leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ai conversations
CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text,
  project_type text,
  qualified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.ai_conversations TO authenticated;
GRANT ALL ON public.ai_conversations TO service_role;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read conversations" ON public.ai_conversations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete conversations" ON public.ai_conversations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_messages_conversation_idx ON public.ai_messages(conversation_id, created_at);
GRANT SELECT, DELETE ON public.ai_messages TO authenticated;
GRANT ALL ON public.ai_messages TO service_role;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read ai messages" ON public.ai_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete ai messages" ON public.ai_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- seed content
INSERT INTO public.site_content (key, value) VALUES
  ('office_name', 'Marina Bittencourt Arquitetura'),
  ('hero_eyebrow', 'Arquitetura & Interiores'),
  ('hero_title', 'Projetos personalizados para quem vive cada detalhe'),
  ('hero_subtitle', 'Design inteligente aplicado ao bem-estar: ambientes que respeitam a sua rotina, a luz natural e a forma como você quer se sentir em casa.'),
  ('hero_stat_value', '+250'),
  ('hero_stat_label', 'projetos entregues em 12 anos'),
  ('about_title', 'Neuroarquitetura como método, não como discurso'),
  ('about_text', 'Cada projeto começa por uma escuta profunda. Antes de desenhar uma parede, entendemos rotinas, memórias e a forma como você ocupa o espaço. A partir daí aplicamos princípios de neuroarquitetura — luz, escala, textura, cor e circulação — para criar ambientes que reduzem ruído mental e ampliam a sensação de pertencimento.'),
  ('about_signature', 'Marina Bittencourt — Arquiteta e Urbanista'),
  ('about_cau', 'CAU/BR A123456-7'),
  ('process_title', 'Como conduzimos o seu projeto'),
  ('process_subtitle', 'Um processo claro, documentado e sem improviso — do primeiro café à última almofada.'),
  ('portfolio_title', 'Projetos selecionados'),
  ('portfolio_subtitle', 'Residências, comerciais e consultorias conduzidas do conceito à execução.'),
  ('testimonials_title', 'Quem já morou a experiência'),
  ('contact_title', 'Vamos conversar sobre o seu espaço'),
  ('contact_text', 'Conte um pouco sobre o seu projeto. Respondemos todos os contatos em até 24 horas úteis.'),
  ('whatsapp_number', '5511999998888'),
  ('contact_email', 'contato@marinabittencourt.arq.br'),
  ('contact_location', 'Rua Harmonia, 1024 — Vila Madalena, São Paulo'),
  ('instagram_url', 'https://instagram.com'),
  ('pinterest_url', 'https://pinterest.com'),
  ('linkedin_url', 'https://linkedin.com'),
  ('logo_url', ''),
  ('hero_image_url', ''),
  ('about_image_url', '');

INSERT INTO public.projects (slug, title, category, location, year, summary, description, cover_url, order_index) VALUES
  ('casa-ipe', 'Casa Ipê', 'Residencial', 'Itu, SP', '2024', 'Uma casa de campo contemporânea onde a madeira envelhece junto com a família.', 'A Casa Ipê nasceu do desejo de um casal por um refúgio de fim de semana que também funcionasse como escritório remoto. Trabalhamos com uma paleta terrosa, esquadrias generosas e um pátio central que organiza a circulação e traz luz difusa para todos os ambientes sociais.', '/images/projeto-casa-ipe-1.jpg', 1),
  ('apartamento-aurora', 'Apartamento Aurora', 'Residencial', 'São Paulo, SP', '2023', 'Reforma integral de 148m² com foco em luz natural e silêncio visual.', 'O apartamento foi totalmente reconfigurado: derrubamos duas paredes para criar um living contínuo, projetamos marcenaria sob medida em freijó e adotamos revestimentos de baixo brilho para reduzir estímulos visuais. Uma iluminação em três camadas acompanha o ciclo circadiano dos moradores.', '/images/projeto-aurora-1.jpg', 2),
  ('clinica-serena', 'Clínica Serena', 'Comercial', 'Campinas, SP', '2024', 'Consultório integrado desenhado com princípios de neuroarquitetura aplicada ao acolhimento.', 'Para a Clínica Serena, o briefing pedia um espaço que reduzisse a ansiedade dos pacientes. Criamos uma sequência de ambientes com iluminação decrescente, acústica controlada e materiais naturais, além de um jardim interno visível da recepção.', '/images/projeto-serena-1.jpg', 3),
  ('loft-atelie', 'Loft Ateliê', 'Comercial', 'São Paulo, SP', '2022', 'Um ateliê de cerâmica que também é vitrine e sala de aula.', 'O Loft Ateliê combina área produtiva, showroom e espaço para workshops em 90m². A estrutura metálica aparente foi mantida e contrastada com massa mineral clara, bancadas de concreto e iluminação orientada às peças.', '/images/projeto-atelie-1.jpg', 4);

INSERT INTO public.project_images (project_id, image_url, caption, order_index)
SELECT p.id, i.url, i.caption, i.ord FROM public.projects p
JOIN (VALUES
  ('casa-ipe', '/images/projeto-casa-ipe-1.jpg', 'Fachada em madeira e pedra local', 1),
  ('casa-ipe', '/images/projeto-casa-ipe-2.jpg', 'Living integrado ao pátio central', 2),
  ('casa-ipe', '/images/projeto-casa-ipe-3.jpg', 'Cozinha com bancada em pedra bruta', 3),
  ('apartamento-aurora', '/images/projeto-aurora-1.jpg', 'Living contínuo com marcenaria em freijó', 1),
  ('apartamento-aurora', '/images/projeto-aurora-2.jpg', 'Detalhe da estante integrada', 2),
  ('clinica-serena', '/images/projeto-serena-1.jpg', 'Recepção com jardim interno', 1),
  ('clinica-serena', '/images/projeto-serena-2.jpg', 'Corredor com iluminação indireta', 2),
  ('loft-atelie', '/images/projeto-atelie-1.jpg', 'Showroom e bancada de trabalho', 1),
  ('loft-atelie', '/images/projeto-atelie-2.jpg', 'Área de workshops', 2)
) AS i(slug, url, caption, ord) ON i.slug = p.slug;

INSERT INTO public.testimonials (name, role, quote, photo_url, order_index) VALUES
  ('Helena Vasques', 'Casa Ipê, Itu', 'A Marina entendeu coisas sobre a nossa rotina que nem nós tínhamos percebido. A casa parece que sempre foi nossa.', '/images/depoimento-1.jpg', 1),
  ('Rodrigo Amaral', 'Apartamento Aurora, SP', 'Processo impecável: cronograma, planilhas, visitas de obra. Recebemos o apartamento no prazo e sem sustos no orçamento.', '/images/depoimento-2.jpg', 2),
  ('Dra. Camila Reis', 'Clínica Serena, Campinas', 'Meus pacientes comentam do ambiente antes mesmo da consulta. O projeto virou parte do meu atendimento.', '/images/depoimento-3.jpg', 3);