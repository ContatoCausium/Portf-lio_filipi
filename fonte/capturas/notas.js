// anotações à mão, em azul, como no rascunho da demo: [texto, x, y, seta (caminho relativo)]
({ fonte, notas }) => {
  const app = document.querySelector('[data-wf]'); const R = app.getBoundingClientRect();
  const ov = document.createElement('div');
  Object.assign(ov.style, { position: 'fixed', left: R.x + 'px', top: R.y + 'px', width: R.width + 'px', height: R.height + 'px', pointerEvents: 'none', zIndex: 100000 });
  ov.innerHTML = `<svg width="${R.width}" height="${R.height}" style="position:absolute;inset:0;overflow:visible">${notas.map(n =>
    `<text x="${n.x}" y="${n.y}" font-family="Mao" font-weight="500" font-size="${n.t || 22}" fill="#5aa9ff">${n.txt}</text>
     <path d="${n.seta}" stroke="#5aa9ff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
  document.body.append(ov);
}
