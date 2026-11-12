# Guia do projeto — Kairo

(Salve como `CLAUDE.md` na raiz do projeto se você usa o Claude Code, ou como `AGENTS.md` se usa o Codex, o Cursor ou outro agente. O conteúdo é o mesmo.)

Portfólio do Kairo, um engenheiro de IA e automação fictício. Vite sem framework, GSAP, Anton, Caveat e Manrope pelo Fontsource. **O site se monta na frente de quem visita:** um enxame de cursores coloridos, como colegas num editor multiplayer, desenha cada bloco (caixa azul com a medida → esboço cinza → conteúdo), copia itens de lista, arrasta elementos até encaixar e testa os componentes. O conteúdo é HTML de verdade desde o início (bom para SEO e para trocar texto sem mexer no motion): o enxame só lê os atributos. A régua é site de premiação: se uma animação parece "ok", ainda não está pronta.

## Arquitetura
- **Uma seção por arquivo.** O `index.html` só tem as marcas `<!-- @secao nome -->`; o plugin `secoes` do `vite.config.js` troca cada uma pelo conteúdo de `src/sections/<nome>.html`, no dev e no build. Seções: `icones` (o sprite: logos das ferramentas `i-*`, da Simple Icons, licença CC0, e ícones de interface `u-*`, usados com `<use href="#...">`), `nav`, `hero`, `projetos` (inclui a faixa das ferramentas e o bastidor com o comparador), `sobre`, `trajetoria`, `contato` e `barra`. O CSS de cada uma é importado em `src/main.js`.
- **Duas escalas** (`src/styles/tokens.css`):
  - o hero está na escala de cena, `--u`: 1 px num quadro de 1440 × 900, que cabe inteiro na primeira tela (em tela larga e baixa não encolhe abaixo de 80% do que a largura pede);
  - as outras seções estão na escala de site, `--su`: 1 px a partir de 1280 de largura, que só encolhe abaixo disso (no celular, a base é 390). Contêiner de 1280. Os tamanhos saem dos tokens (`--s-h2` 64, `--s-h2-grot` 48, `--s-fecho` 80, `--s-corpo` 18...), nunca de px soltos.
- **O enxame** (`src/motion/`), guiado só por atributos no HTML:
  - `data-camada` marca cada bloco que os agentes montam: `quadro` (um fundo inteiro; acende depois do título), `titulo` (acende letra por letra, como neon), `texto` (digitado letra a letra), `bloco` (caixa que aparece; se tiver camadas dentro, só o fundo e a borda dela) e `foto` (entra em preto e branco e ganha cor).
  - `data-montagem` agrupa as camadas numa montagem, que começa quando o topo passa de 62% da tela; `data-parte` divide o hero em três montagens no celular; `data-reforco="N"` traz N agentes novos quando a seção começa.
  - `data-duplica` numa lista: o primeiro filho nasce do zero; cada um dos outros sai de uma cópia arrastada de um item pronto, e o conteúdo é trocado. `data-ajusta="dx,dy"`: o elemento nasce deslocado (metade no celular) e um agente o arrasta de volta, com a linha-guia. Só em camadas sem camadas dentro.
  - `data-teste="1,0"` num grupo de botões: depois de montado, um agente clica no botão 1 e volta ao 0; `data-teste="arraste"` no comparador: o agente arrasta a alça. `data-tocado` (posto quando a pessoa mexe) cancela o teste.
  - `data-fecho` na última seção e `data-alvo` dentro dela: com ela na tela (ou com a página toda montada), os agentes formam a fila que dá voltas.
  - Módulos: `enxame.js` (a fila de tarefas, a vida de cada agente, abertura, duplicar, ajustar, testes, Tour, fila do fim), `agentes.js` (os cursores, as cores, o movimento em curva), `caixas.js` (a seleção com a medida e o esboço), `digita.js` (texto letra a letra em `<x-l>`, que nenhuma regra de `span` pega), `barra.js` (a barra do pé), `interface.js` (filtro e busca, faixa das ferramentas, comparador, sanfona, formulário, replay), `nav.js` (o ponto da seção na tela, o hover desligado enquanto rola).
  - O `<script>` do `index.html` decide `monta` ou `pronto` (`?pronto`, movimento reduzido, ou o motion não subiu em 5 s) e lê o `?reel`. `src/estilo.js` e o `<style>` do `index.html` escondem o body até o CSS chegar no dev.
- **Imagens** em `public/img/` (WebP): `kairo-perfil.webp` (o retrato recortado, com alfa, 900 × 1140), `proj-balcao`, `proj-cobranca`, `proj-custo` (as telas dos projetos, 1280 × 800, modo escuro) e `wire-balcao` (o wireframe da primeira, no mesmo enquadramento). `public/favicon.svg` é o símbolo.

## Design system
- Tokens em `src/styles/tokens.css`, nunca cores soltas no CSS das seções: `--pagina #0b0909`; `--vermelho #e8261c` (blocos) e `--vermelho-texto #ff4a3d` (números e palavras); `--titulo-topo` e `--titulo-pe` (o degradê do PORTFÓLIO); `--card-topo` e `--card-pe`; `--texto`, `--texto-2`, `--texto-3`; `--branco` (letra sobre vermelho); `--fio`, `--fio-forte`; a ferramenta dos agentes (`--sel`, `--sel-etiqueta`, `--marcador`, `--marcador-grande`, `--marcador-quadro`).
- **Tipos:** Anton (o PORTFÓLIO, o nome, `.titulo-cond`, os números), Caveat variável 600 (a saudação e a assinatura) e Manrope variável (o resto; `.titulo-grot` em 800, tracking −0,06em). Só pelo Fontsource, importados em `src/main.js`.
- **Peças comuns** (`src/styles/secao.css`): `.secao__rotulo` ("01 / ..."), `.titulo-cond` e `.titulo-grot`, `.vermelho`, `.pq` (o ponto final quadrado vermelho), `.link-seta`, `.abas`/`.aba`, `.tags`, `.anel` (ícone num anel vermelho). Hover e foco na linguagem dos agentes: `.sel` desenha a seleção do editor em volta do clicável.

## Regras de motion
- O enxame usa só GSAP (`gsap.globalTimeline.timeScale` é a velocidade 1×/2×/4× da barra). Nada fica preso à rolagem, sem pin.
- Toda peça nova que deva ser montada ganha `data-camada` do tipo certo; uma lista nova que se repete ganha `data-duplica`. Uma peça sem `data-camada` aparece desde o começo (por isso os fios das linhas de números e do pé do hero têm regra própria em `enxame.css`).
- Elemento que se transforma no ajuste (`data-ajusta`) não pode ser `inline`: use `inline-block` ou bloco.
- Texto dentro de um botão ou link `flex` com `gap`: embrulhe o texto num `<span>`, senão cada letra digitada vira um item e sai espaçada.
- Tela branca estoura quando alguém grava o site com o celular: telas de projeto em modo escuro.
- `prefers-reduced-motion`: a página abre montada, sem agentes e sem barra.

## Celular (regras que nunca quebram)
O corte é em 760 px. Oito cursores; o hero vira coluna em três montagens (`data-parte`); os cards dos projetos viram um trilho lateral com encaixe; a faixa das ferramentas encolhe. Ao personalizar, estas regras continuam valendo:
1. **Nada rola para o lado**, em nenhuma altura e em nenhum momento da montagem. `main { overflow-x: clip }` segura os deslocamentos dos agentes; trilho lateral de propósito fica dentro do próprio contêiner com `overflow-x: auto`.
2. **O script nunca briga com o dedo.** Rolagem nativa; o Tour para com qualquer toque.
3. **Imagens leves:** WebP, telas de 1280 de largura, retrato de 900.
4. Títulos em no máximo duas linhas, alvos de toque de 44 px, campos com fonte de 16 px.

## Como checar
1. `npm run dev` (porta 5300); olhar a 1456 × 840 e a 390 × 844, no Chrome e no Safari. Para o celular de verdade, `npm run dev -- --host`.
2. Com `?pronto`: cada seção igual ao print de `arquivos/conceito/` (ou ao novo desenho, depois de personalizar).
3. Sem `?pronto`: a abertura com o símbolo e os cursores, o hero montado em ~7 s, a foto e os títulos encaixando com a linha-guia, os números saindo de cópias.
4. **Tour** na barra: rola sozinho, para em cada seção, espera cada montagem e termina com "Montada por N agentes em N s" e a fila dando voltas. Velocidade 2× e 4×; "montar de novo" volta ao começo.
5. Rolar rápido no meio da montagem: tudo fecha na hora, nenhum cursor sobe atrás do que passou.
6. Filtro e busca dos projetos, faixa das ferramentas (pausa, setas, ver todas), comparador (arrastar e setas), sanfona, formulário, o play do card de replay.
7. Celular: nada rola para o lado em nenhuma altura, o trilho dos cards encaixa. Movimento reduzido; Tab com foco visível; console sem erros; `npm run build` passa.

## Personalizar

O site chega como a demo do Kairo, uma pessoa inventada. Esta seção vale sempre que a pessoa pedir uma mudança, hoje ou daqui a meses: trocar o nome, um texto, um projeto, a foto, ou levar uma peça para outro site.

### Antes de mexer
- Se ainda não sabe o objetivo, pergunte qual destes é (uma pergunta por vez, em linguagem simples):
  1. **Ver a demo funcionando** como está, para trocar depois.
  2. **O meu portfólio**, com esta estrutura e esta montagem.
  3. **Só algumas peças** (o enxame, o hero, os cards, o comparador, a trajetória) para um site que já existe.
- Para o caminho 2, pergunte o que ainda não sabe: nome, o que faz numa frase, para quem, os números reais, três projetos (nome, categoria, ano, uma frase, link), a trajetória, as ferramentas, o contato e as redes, e **que material já tem** (foto, prints dos projetos, um wireframe). Não peça tudo de uma vez.
- Para o caminho 3, pergunte quais peças e onde fica o site de destino. Leia o código do destino antes. O enxame funciona em qualquer HTML: copie `src/motion/` (menos `interface.js`, que é desta página), `src/styles/enxame.css` e os tokens da ferramenta, marque os blocos com `data-camada` e as montagens com `data-montagem`, e chame `enxame(barra())` como em `src/main.js`. Em React ou Next, rode o enxame num `useEffect` depois que o conteúdo estiver na página.
- Diga com clareza, sem rodeio: **a foto é de uma pessoa que não existe**, **as telas dos projetos são imagens geradas** e **o wireframe só serve para o primeiro projeto da demo**.

### O que muda e onde
| o quê | onde | precisa de material novo? |
|---|---|---|
| Nome, `<title>` e `description` | `index.html`; "KAIRO" em `nav.html`, `hero.html` (o `h1`), `contato.html` (rodapé e card de replay) | não |
| Símbolo e favicon | o `<path>` em `nav.html` **e** no `innerHTML` do logo da abertura em `src/motion/enxame.js` (função `intro`); `public/favicon.svg` | o SVG da marca, se houver |
| PORTFÓLIO, papel, status, saudação, cargo, texto, botão, local | `src/sections/hero.html` | não |
| Números do hero | `hero.html` (`.hero__numeros`) | não, mas só números reais |
| Foto do hero | `public/img/kairo-perfil.webp` (com alfa) e os `width`/`height` do `<img>` em `hero.html` | sim: a foto da pessoa, recortada (abaixo) |
| Projetos | `src/sections/projetos.html`: imagem, `alt`, etiqueta, número, nome, categoria/ano, `data-tipo` (a aba que o mostra) e `data-busca` (palavras da busca); as abas em `.filtro` | sim: os prints dos projetos (abaixo) |
| Ferramentas | os `<li>` da `.ferramentas__trilho` em `projetos.html`, o "Ver todas (N)" e o texto em `src/motion/interface.js`; logos novos como `<symbol id="i-...">` em `icones.html` (Simple Icons, CC0) | não |
| Comparador (bastidor) | a segunda `<section>` de `projetos.html`; imagens `proj-balcao.webp` e `wire-balcao.webp` | sim: o wireframe e a tela final do mesmo projeto (abaixo) |
| Sobre | `src/sections/sobre.html` (bio, formação, tags, ícones, passos, frase e assinatura do card) | não |
| Trajetória | `src/sections/trajetoria.html` (cada item: ano, cargo, empresa e o texto no `sanfona__corpo`; os marcos) | não |
| Contato, canais, formulário, rodapé | `src/sections/contato.html`; o e-mail do formulário também em `src/motion/interface.js` (`formulario`) | não |
| Cores e tipos | `src/styles/tokens.css`; fontes em `src/main.js`, no `package.json` e nos `document.fonts.load` da função `carregado` em `enxame.js` | não |
| Tirar uma seção | a marca no `index.html`, o import do CSS em `src/main.js` e o link dela na nav | não |

### Material da pessoa
Para cada peça visual, ofereça estes caminhos, do mais simples para o mais trabalhoso, e deixe a pessoa escolher:

**A foto do hero** (é ela que fica na frente do PORTFÓLIO)
1. **Uma foto dela, recortada** (o melhor): de perfil ou de três quartos, olhando para a esquerda, cabeça e ombros, fundo liso. No Mac, `swift fonte/recorta.swift fonte/foto.png fonte/foto-recorte.png` recorta o fundo de graça (macOS 14 ou mais novo); fora do Mac, qualquer removedor de fundo. Converta para WebP com alfa, 900 px de largura (`cwebp -resize 900 0 fonte/foto-recorte.png -o public/img/kairo-perfil.webp`, ou o conversor que tiver), e ajuste o `width`/`height` do `<img>` à proporção nova.
2. **Gerar no mesmo estilo** com `arquivos/receitas/retrato.prompt.txt`, anexando uma foto dela de frente como referência, e recortar como acima.
3. **Sem foto ainda:** manter a da demo e listar como pendente. Pessoa que não existe não fica num portfólio publicado.

**As telas dos projetos**
1. **O print de verdade** de cada projeto, em modo escuro, 16:10 (tire em 1600 × 1000 e salve como WebP 1280 × 800). Se o projeto só existe claro, avise que estoura na gravação com o celular e prefira um trecho escuro dele.
2. **Gerar** com as receitas `tela-projeto-*.prompt.txt`, trocando o produto e os textos.
3. Mais ou menos de três projetos: a grade é de três colunas; com dois, mude o `grid-template-columns` em `projetos.css`; com seis, ela quebra em duas linhas sozinha. O primeiro card nasce do zero e os outros são cópias (`data-duplica`).

**O comparador "Do rascunho. Ao ar."**
1. **O wireframe de verdade e a tela final** do mesmo projeto, no mesmo enquadramento (sobreponha os dois e confira que as caixas batem), em modo escuro.
2. **Gerar o wireframe** a partir da tela final com `arquivos/receitas/wireframe.prompt.txt`, anexando a tela como referência.
3. **Sem wireframe:** tire a segunda `<section>` de `projetos.html` e o link "Ver um caso por dentro" do pé do hero (`hero.html`).

### Regras ao trocar
- Toda peça nova ganha `data-camada`; lista repetida, `data-duplica`; nada de copiar um bloco sem os atributos (ele aparece antes da montagem).
- Nada de número, nota, cliente, projeto ou depoimento inventado como se fosse da pessoa: o que ela não informou fica `[preencher]` e entra na lista do fim. "120 projetos", "nota 4,9" e "26 agentes no ar" só ficam se forem reais.
- Nada de cidade se a pessoa não quiser; "Remoto" é uma saída honesta.
- Depois de cada troca, rode o "Como checar" de novo (com e sem `?pronto`, e o Tour) e, no fim, liste para a pessoa o que ainda é da demo (foto, telas, wireframe, números, textos) e o que falta ela mandar.
