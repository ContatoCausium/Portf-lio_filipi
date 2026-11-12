import sys, base64, json
from playwright.sync_api import sync_playwright
out, fonte_arq = sys.argv[1], sys.argv[2]
WIRE = open(f'{out}/wire.js', encoding='utf-8').read()
NOTAS = open(f'{out}/notas.js', encoding='utf-8').read()
fonte = base64.b64encode(open(fonte_arq, 'rb').read()).decode()
VW = int(sys.argv[3]) if len(sys.argv) > 3 else 1068
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge')
    pg = b.new_page(viewport={'width': VW, 'height': 900}, device_scale_factor=2, bypass_csp=True)
    pg.goto('https://www.causiumtech.com', wait_until='networkidle'); pg.wait_for_timeout(2000)
    pg.evaluate("document.getElementById('panel-overview').scrollIntoView({block:'center'})"); pg.wait_for_timeout(5000)
    pg.evaluate("""(() => { let e = document.getElementById('panel-overview'); for (let i = 0; i < 3; i++) e = e.parentElement;
      e.setAttribute('data-wf', ''); e.style.height = (e.getBoundingClientRect().width / 1.6) + 'px'; [...document.querySelectorAll('body *')].forEach(x => { const s = getComputedStyle(x);
      if (s.position === 'fixed' || s.position === 'sticky') x.style.visibility = 'hidden'; }); })()""")
    pg.click('#tab-overview'); pg.wait_for_timeout(2500)
    app = pg.locator('[data-wf]')
    pg.mouse.move(app.bounding_box()['x'] + 90, app.bounding_box()['y'] + 520); pg.wait_for_timeout(300)
    ativo = lambda: pg.evaluate("document.getElementById('tab-overview').getAttribute('aria-selected')")
    print('aba overview ativa:', ativo())
    bb = app.bounding_box(); print(json.dumps(bb), round(bb['width'] / bb['height'], 3))
    pg.screenshot(path=f'{out}/claro.png', clip=bb)
    pg.evaluate("document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)'"); pg.wait_for_timeout(400)
    pg.screenshot(path=f'{out}/escuro.png', clip=bb)
    pg.evaluate("document.documentElement.style.filter = ''"); pg.wait_for_timeout(200)
    pg.evaluate(WIRE, fonte); pg.wait_for_timeout(300)
    notas = json.load(open(f'{out}/notas.json', encoding='utf-8')) if len(sys.argv) > 4 else []
    print('fonte', pg.evaluate("document.fonts.load('500 23px Mao').then(f => f.length)"))
    if notas: pg.evaluate(NOTAS, {'fonte': fonte, 'notas': notas}); pg.wait_for_timeout(800)
    print('aba overview ativa no fim:', ativo())
    pg.screenshot(path=f'{out}/rascunho.png', clip=bb)
    b.close()
