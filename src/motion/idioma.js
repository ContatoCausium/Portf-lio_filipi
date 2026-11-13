// Duas línguas: a página em /en/ tem <html lang="en">. Os textos que o JS escreve (barra, faixa das ferramentas,
// formulário) saem daqui; os do HTML ficam em src/sections/ e src/sections/en/.
export const ingles = document.documentElement.lang.toLowerCase().startsWith('en');
export const local = ingles ? 'en-US' : 'pt-BR';
export const t = (pt, en) => (ingles ? en : pt);
