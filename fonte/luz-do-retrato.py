# Reluz o retrato como se estivesse na cena do hero: pouca luz no corpo, rosto como foco, contraluz vermelha pela
# direita só nas bordas viradas para ela, azul fraco nas sombras da esquerda. A luz sempre multiplica a cor da
# superfície (pele reflete muito, malha azul-marinho reflete pouco), por isso não vira uma faixa pintada.
import numpy as np
from PIL import Image, ImageFilter
c = Image.open('foto/natural.png').convert('RGBA')
W, H = c.size
a = np.asarray(c).astype(np.float32) / 255
rgb, al = a[..., :3] ** 2.2, a[..., 3]          # trabalha em luz linear
Y, X = np.mgrid[0:H, 0:W].astype(np.float32)
y, x = Y / H, X / W

def blur(arr, r):
    # gaussiana separável em numpy (o PIL não borra imagens em ponto flutuante)
    k = np.arange(-int(3 * r), int(3 * r) + 1, dtype=np.float32)
    k = np.exp(-(k ** 2) / (2 * r * r)); k /= k.sum()
    p = len(k) // 2
    t = np.pad(arr, ((0, 0), (p, p)), mode='edge')
    t = sum(k[i] * t[:, i:i + arr.shape[1]] for i in range(len(k)))
    t = np.pad(t, ((p, p), (0, 0)), mode='edge')
    return sum(k[i] * t[i:i + arr.shape[0], :] for i in range(len(k)))

# 1. exposição: o rosto fica, o corpo vai descendo para o preto (como a foto some no fundo do hero)
queda = np.clip((y - 0.40) / 0.55, 0, 1) ** 1.3          # 0 até o queixo, 1 no pé
lado = np.clip(np.abs(x - 0.47) / 0.5, 0, 1) ** 2         # bordas laterais um pouco mais escuras
expo = 0.80 * (1 - 0.78 * queda) * (1 - 0.25 * lado)
base = rgb * expo[..., None]
# tira um pouco da saturação do azul da malha para ela ler como preta, sem mexer na pele
lum = (base @ np.array([0.2126, 0.7152, 0.0722], np.float32))[..., None]
azulado = np.clip((base[..., 2:3] - base[..., 0:1]) * 30, 0, 1)
base = base + (lum - base) * 0.55 * azulado

# 2. contraluz vermelha: só onde a borda do recorte está virada para a direita
ab = blur(al, 6)
gx = np.zeros_like(ab); gx[:, 1:-1] = (ab[:, :-2] - ab[:, 2:]) / 2  # >0 onde o alfa cai para a direita
direita = np.clip(blur(np.clip(gx * 14, 0, 1), 10) * 2.2, 0, 1)
fina = np.clip((al - blur(al, 9)) * 3.0, 0, 1)                       # faixa fina dentro da borda
alto = (1 - np.clip((y - 0.55) / 0.35, 0, 1)) * (1 + 0.9 * (1 - np.clip((y - 0.36) / 0.12, 0, 1)))  # cabeça > ombro
contra = (fina * direita * alto)[..., None]
vermelho = np.array([1.0, 0.13, 0.07], np.float32)
albedo = rgb / (rgb.max(axis=2, keepdims=True) + 0.04)                # cor da superfície
reflete = 0.25 + 0.75 * (rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32))[..., None] ** 0.5
base = base + contra * vermelho * reflete * 1.15 * (0.6 + 0.4 * albedo[..., 0:1])

# 3. o vermelho da página batendo de leve no lado direito do rosto (luz suave, multiplicada pela pele)
rosto = np.exp(-(((x - 0.55) / 0.20) ** 2 + ((y - 0.30) / 0.20) ** 2))
lado_dir = np.clip((x - 0.45) / 0.25, 0, 1)
banho = (rosto * lado_dir)[..., None]
base = base * (1 - 0.30 * banho) + rgb * vermelho * 0.85 * banho

# 3b. volume: o lado esquerdo do rosto e do pescoço perde um pouco de luz
rosto_esq = np.exp(-(((x - 0.38) / 0.16) ** 2 + ((y - 0.32) / 0.22) ** 2))[..., None]
base = base * (1 - 0.32 * rosto_esq)

# 4. azul fraco no lado esquerdo, só nas sombras
esq = np.clip((0.5 - x) / 0.5, 0, 1)[..., None]
sombra = 1 - np.clip(lum / 0.25, 0, 1)
azul = np.array([0.55, 0.75, 1.0], np.float32)
base = base * (1 - 0.35 * esq * sombra) + base * azul * 0.35 * esq * sombra * 1.4

out = np.clip(base, 0, 1) ** (1 / 2.2)
Image.fromarray((np.dstack([out, al]) * 255).round().astype(np.uint8), 'RGBA').save('foto/luz3.png')
for n in ('luz2', 'luz3'):
    p = Image.open(f'foto/{n}.png'); bg = Image.new('RGBA', p.size, (11, 9, 9, 255)); bg.alpha_composite(p)
    bg.convert('RGB').save(f'foto/full-{n}.jpg', quality=90)
# lado a lado: antes | depois, e zoom no ombro e no rosto
A = Image.open('foto/full-luz2.jpg'); B = Image.open('foto/full-luz3.jpg')
s = Image.new('RGB', (900, 570)); s.paste(A.resize((450, 570)), (0, 0)); s.paste(B.resize((450, 570)), (450, 0)); s.save('foto/cmp.jpg', quality=88)
z = Image.new('RGB', (760, 400)); box = (420, 80, 800, 480)
z.paste(A.crop(box), (0, 0)); z.paste(B.crop(box), (380, 0)); z.save('foto/cmp-rosto.jpg', quality=90)
z = Image.new('RGB', (760, 400)); box = (520, 560, 900, 960)
z.paste(A.crop(box), (0, 0)); z.paste(B.crop(box), (380, 0)); z.save('foto/cmp-ombro.jpg', quality=90)
