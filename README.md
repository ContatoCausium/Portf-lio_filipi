# Filipi Moraes · portfólio

O site de **[www.filipimoraes.com](https://www.filipimoraes.com)**: um portfólio que se monta na frente de quem visita. Um enxame de cursores, como colegas num editor multiplayer, desenha cada bloco ao vivo (caixa com a medida → esboço → conteúdo). Vite sem framework, GSAP e as fontes Anton, Caveat e Manrope pelo Fontsource.

Em duas línguas: português em [`/`](https://www.filipimoraes.com/) e inglês em [`/en/`](https://www.filipimoraes.com/en/), com o seletor PT · EN na nav. As seções em inglês ficam em `src/sections/en/`.

O guia completo da arquitetura, do design system e das regras de motion está em [`CLAUDE.md`](CLAUDE.md).

## Rodar no computador

```bash
npm ci
npm run dev        # http://localhost:5300
npm run build      # gera o dist/
```

`?pronto` na URL abre a página já montada; `?reel` deixa pronta para gravar a tela com o celular.

## Publicação

O site está no **Cloudflare Pages**, ligado a este repositório:

| | |
|---|---|
| Projeto | `filipimoraes` (conta Cloudflare do Filipi) |
| Branch de produção | `main`: cada push publica sozinho |
| Build | `npm run build`, saída em `dist`, `NODE_VERSION=22` |
| Endereços | https://www.filipimoraes.com e https://filipimoraes.pages.dev |
| DNS | `CNAME www → filipimoraes.pages.dev`, criado pelo próprio Pages |

Para publicar uma mudança, basta fazer commit e push no `main`. Branches que não sejam o `main` viram uma prévia em `<branch>.filipimoraes.pages.dev`.

## Pastas

- `src/sections/`: o HTML e o CSS de cada seção (o `index.html` só tem as marcas `<!-- @secao nome -->`).
- `src/motion/`: o enxame de agentes, a barra do pé e os componentes da página.
- `public/img/`: retrato e telas dos projetos, em WebP.
- `fonte/`: os originais e os scripts que geram as imagens (o recorte e a luz do retrato, o print e o rascunho do comparador do CauSium). Não entra no site.
