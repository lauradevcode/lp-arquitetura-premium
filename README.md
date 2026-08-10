# lp - arquitetura

Crie um site institucional premium para um escritório de arquitetura e design de interiores, no estilo de portfólio moderno minimalista de alto padrão (referência de tom: Julia Rosa Cabral Arquitetura).

IDENTIDADE VISUAL:

- Paleta neutra e quente: off-white/creme (#F7F4EF), preto suave (#1C1C1C), um tom terracota ou areia como cor de destaque (#B08968 ou similar)

- Tipografia serifada elegante para títulos (estilo editorial, ex: "Fraunces" ou "Playfair Display") combinada com sans-serif limpa para corpo de texto (ex: "Inter" ou "Manrope")

- Muito espaço em branco, grid assimétrico, fotografia de projetos em tela cheia (full-bleed) com transições suaves ao rolar

- Sensação de revista de arquitetura, não de "site institucional genérico"

ESTRUTURA DE SEÇÕES:

1. Hero full-screen com foto de projeto de destaque, headline curta e forte (posicionamento: projetos personalizados, "design inteligente" + prova de autoridade, ex: "+250 projetos entregues")

2. Seção "Sobre" com foto da arquiteta, texto de posicionamento (conceito de neuroarquitetura/design inteligente aplicado ao bem-estar do cliente) e credenciais (CAU)

3. Grid de portfólio com projetos em cards grandes, cada um abrindo em página de projeto com galeria

4. Seção de diferenciais/processo (como funciona a consultoria, etapas do projeto)

5. Depoimentos em carrossel, estilo cards com foto e nome do cliente

6. Seção de contato com formulário + CTA para WhatsApp

7. Footer com redes sociais, CAU, e-mail e localização

PAINEL ADMINISTRATIVO (área /admin protegida por login):

- Dashboard para a arquiteta gerenciar sozinha, sem programador:

  - CRUD de projetos do portfólio (título, categoria, descrição, upload de múltiplas fotos, ordem de exibição)

  - CRUD de depoimentos (nome, texto, foto opcional)

  - Edição dos textos principais do site (hero, sobre, seções) via campos editáveis

  - Gestão de leads recebidos pelo formulário de contato (lista, status: novo/em conversa/fechado)

  - Upload/troca de logo e imagens de destaque

ASSISTENTE DE IA INTEGRADO (chat widget no canto do site):

- Widget de chat flutuante, com visual alinhado à identidade do site (mesma paleta)

- A IA deve: dar boas-vindas ao visitante, entender se ele busca projeto residencial, comercial ou consultoria, explicar de forma breve como funciona o processo de contratação, coletar nome/telefone/tipo de projeto/orçamento aproximado, e só então direcionar para o WhatsApp da arquiteta com o resumo da conversa

- Tom de voz da IA: sofisticado, acolhedor, consultivo — nunca robótico ou genérico

- Painel admin deve ter uma aba para a arquiteta ver o histórico de conversas da IA e os leads qualificados por ela

Gere o site completo com essas seções, painel admin funcional e o widget de IA integrado, usando dados fictícios de exemplo (nome do escritório: [NOME], pode ser substituído depois).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cc543394-52d7-487a-99d0-8eaa10d9c5ea).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
