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

// No build, o CSS vai dentro do HTML (<style>), em vez de um <link> que segura a primeira tela: são uns 10 KB com
// gzip. Com o CSS já no <head>, a regra que esconde o body até o estilo chegar (necessária só no dev, onde o CSS
// entra pelo JS) sai do HTML publicado, e a página desenha sem esperar o JavaScript.
// (o build minifica esse <style>, por isso o padrão sem espaços)
const ESCONDE = /html:not\(\.com-estilo\) body\{[^}]*\}@keyframes mostra\{to\{[^}]*\}\}html:not\(\.assentou\)[^{]*\{[^}]*\}/;
const NOSCRIPT = /<noscript><style>body\{[^<]*<\/style><\/noscript>\s*/;
const cssEmbutido = () => ({
  name: 'css-embutido',
  apply: 'build',
  enforce: 'post',
  generateBundle(_, bundle) {
    const usados = new Set();
    for (const f of Object.values(bundle)) {
      if (f.type !== 'asset' || !f.fileName.endsWith('.html')) continue;
      let html = String(f.source).replace(/<link rel="stylesheet"(?: crossorigin)? href="\/(assets\/[^"]+\.css)">/g, (tag, nome) => {
        const css = bundle[nome];
        if (!css) return tag;
        usados.add(nome);
        return `<style>${String(css.source).trim()}</style>`;
      });
      html = html.replace(ESCONDE, '').replace(NOSCRIPT, '');
      f.source = html;
    }
    for (const nome of usados) delete bundle[nome];
  },
});

export default defineConfig({
  plugins: [secoes(), cssEmbutido()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        pt: resolve(raiz, 'index.html'),
        en: resolve(raiz, 'en/index.html'),
        privacidade: resolve(raiz, 'privacidade/index.html'),
        privacy: resolve(raiz, 'en/privacy/index.html'),
      },
    },
  },
});
