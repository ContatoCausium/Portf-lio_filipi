import { defineConfig } from 'vite';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Uma seção por arquivo: <!-- @secao hero --> no index.html vira o conteúdo de src/sections/hero.html
// (vale dentro das próprias seções: o hero inclui o painel).
// Duas línguas: a página em /en/ (en/index.html) pega a seção de src/sections/en/<nome>.html quando ela existe e,
// se não existir (o sprite dos ícones, que não tem texto), a mesma de português.
const MARCA = /<!--\s*@secao\s+([\w-]+)\s*-->/g;
const raiz = import.meta.dirname;
const ler = (lingua, nome) => {
  const en = resolve(raiz, `src/sections/en/${nome}.html`);
  return readFileSync(lingua === 'en' && existsSync(en) ? en : resolve(raiz, `src/sections/${nome}.html`), 'utf8');
};
const inclui = (html, lingua) => html.replace(MARCA, (_, nome) => inclui(ler(lingua, nome), lingua));
const secoes = () => ({
  name: 'secoes',
  transformIndexHtml: {
    order: 'pre',
    handler: (html, ctx) => inclui(html, /(^|\/)en\//.test(ctx.path) ? 'en' : 'pt'),
  },
  handleHotUpdate({ file, server }) {
    if (file.includes('/src/sections/') && file.endsWith('.html')) server.ws.send({ type: 'full-reload' });
  },
});

export default defineConfig({
  plugins: [secoes()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    rollupOptions: { input: { pt: resolve(raiz, 'index.html'), en: resolve(raiz, 'en/index.html') } },
  },
});
