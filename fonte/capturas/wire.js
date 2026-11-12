// Desenha o rascunho por cima do app: some a cor e o texto, cada linha de texto vira uma barra cinza no mesmo lugar,
// gráficos viram caixas com X, ícones ficam em traço. Nada muda de tamanho (só cores e uma camada por cima).
(fonte) => {
  const app = document.querySelector('[data-wf]');
  const R = app.getBoundingClientRect();
  const st = document.createElement('style');
  st.textContent = `@font-face { font-family: Mao; src: url(data:font/woff2;base64,${fonte}) format('woff2'); font-weight: 400 700; }
    [data-wf] input::placeholder { color: transparent !important; }`;
  document.head.append(st);
  const linha = '#6c7078', traco = '#7d8188', barra = '#5f636b';
  // estilo inline com !important ganha das camadas do Tailwind
  for (const e of [app, ...app.querySelectorAll('*')]) {
    const s = e.style, set = (k, v) => s.setProperty(k, v, 'important');
    if (e instanceof SVGElement) {
      if (e.tagName.toLowerCase() === 'svg') set('color', traco);
      else { set('stroke', traco); set('fill', 'none'); }
      continue;
    }
    set('background', e === app ? '#1b1d22' : 'transparent'); set('box-shadow', 'none'); set('color', 'transparent');
    set('text-shadow', 'none'); set('border-color', linha); set('caret-color', 'transparent');
  }
  const ov = document.createElement('div');
  Object.assign(ov.style, { position: 'fixed', left: R.x + 'px', top: R.y + 'px', width: R.width + 'px', height: R.height + 'px',
    pointerEvents: 'none', zIndex: 99999 });
  document.body.append(ov);
  const caixa = (x, y, w, h, css) => { const d = document.createElement('div');
    Object.assign(d.style, { position: 'absolute', boxSizing: 'border-box', left: (x - R.x) + 'px', top: (y - R.y) + 'px', width: w + 'px', height: h + 'px' }, css); ov.append(d); return d; };
  const xis = '<svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100"><path d="M0 0L100 100M100 0L0 100" stroke="#7d8188" stroke-width="1.2" vector-effect="non-scaling-stroke" fill="none"/></svg>';
  // gráficos grandes -> caixa com X (e o texto de dentro deles não vira barra)
  const grandes = [...app.querySelectorAll('svg')].filter(s => { const r = s.getBoundingClientRect(); return r.width >= 120 && r.height >= 80; });
  for (const s of grandes) { const r = s.getBoundingClientRect(); s.style.visibility = 'hidden';
    caixa(r.x, r.y, r.width, r.height, { border: '1.5px solid ' + traco, borderRadius: '4px' }).innerHTML = xis; }
  // o logo (primeiro svg) vira um círculo com X, como um avatar de rascunho
  const logo = app.querySelector('svg'); if (logo && !grandes.includes(logo)) { const r = logo.getBoundingClientRect(); logo.style.visibility = 'hidden';
    caixa(r.x, r.y, r.width, r.height, { border: '1.5px solid ' + traco, borderRadius: '50%', overflow: 'hidden' }).innerHTML = xis; }
  // texto -> barras (pula cópias de leitor de tela e o que está dentro dos gráficos)
  const tw = document.createTreeWalker(app, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode()); ) {
    const p = n.parentElement; if (!n.textContent.trim() || !p) continue;
    if (p.closest('.sr-only') || grandes.some(s => s.contains(p)) || p.closest('svg') === logo) continue;
    const cs = getComputedStyle(p); if (cs.position === 'absolute' && cs.clip !== 'auto') continue;
    const g = document.createRange(); g.selectNodeContents(n);
    for (const r of g.getClientRects()) {
      if (r.width < 3 || r.height < 3) continue;
      const h = Math.max(4, r.height * 0.5);
      caixa(r.x, r.y + (r.height - h) / 2, r.width, h, { background: barra, borderRadius: '2px' });
    }
  }
  return { w: R.width, h: R.height };
}
