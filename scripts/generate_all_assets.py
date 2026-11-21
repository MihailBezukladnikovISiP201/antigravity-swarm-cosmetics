import os
import math
import re
from PIL import Image, ImageDraw, ImageFont

# Ensure output directory exists
ASSETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets')
os.makedirs(ASSETS_DIR, exist_ok=True)

# Colors
def hex2rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def hex2rgba(h, alpha=255):
    if h.startswith('rgba'):
        parts = h[5:-1].split(',')
        return (int(parts[0]), int(parts[1]), int(parts[2]), int(float(parts[3]) * 255))
    rgb = hex2rgb(h)
    return (rgb[0], rgb[1], rgb[2], alpha)

HUE = {'coordinator': 46}
HUE_LIST = [12, 150, 262, 330, 196, 228, 96, 28, 290, 175, 350, 60]

def hash_str(s):
    a = 7
    for c in s:
        a = ((a * 31) + ord(c)) & 0xFFFFFFFF
    return a

def hue_of(name):
    if name in HUE:
        return HUE[name]
    return HUE_LIST[hash_str(str(name)) % 12]

def shift_hue(h, target, amt):
    d = ((target - h + 540) % 360) - 180
    return h + d * amt

def hsl2rgb(h, s, l):
    h = ((h % 360) + 360) % 360
    s /= 100.0
    l /= 100.0
    def k(n):
        return (n + h / 30.0) % 12
    a = s * min(l, 1.0 - l)
    def f(n):
        return int(round((l - a * max(-1.0, min(k(n) - 3.0, min(9.0 - k(n), 1.0)))) * 255.0))
    return (f(0), f(8), f(4))

def ramp(name):
    h = hue_of(name)
    return {
        'spec': hsl2rgb(shift_hue(h, 55, 0.28), 96, 90),
        'hi': hsl2rgb(shift_hue(h, 55, 0.18), 90, 74),
        'mid': hsl2rgb(h, 78, 60),
        'sh': hsl2rgb(shift_hue(h, 265, 0.22), 58, 44),
        'ol': hsl2rgb(shift_hue(h, 265, 0.35), 42, 19),
        'skh': hsl2rgb(shift_hue(h, 265, 0.15), 20, 30),
        'sk': hsl2rgb(shift_hue(h, 265, 0.3), 24, 18),
        'skd': hsl2rgb(shift_hue(h, 265, 0.45), 32, 10),
    }

def get_hat_type(name):
    n = str(name).lower()
    if n == 'coordinator' or 'queen' in n:
        return 'crown'
    if re.search(r'verifier|review|qa|test|audit|lint|check', n):
        return 'mortarboard'
    if re.search(r'builder|author|dev|code|parser|impl|worker|fix|patch|engineer', n):
        return 'hardhat'
    if re.search(r'research|scout|investig|search|doc|read|explore|analyst', n):
        return 'tophat'
    if re.search(r'narrator|story|scribe|log|write|history', n):
        return 'beret'
    if re.search(r'monitor|guard|watch|stall|dispatch|ping', n):
        return 'police'
    if re.search(r'wizard|magic|ai|model|prompt|llm|synth|brain', n):
        return 'wizard'
    if re.search(r'pirate|sec|security|hack|pentest|redteam|exploit', n):
        return 'pirate'
    if re.search(r'chef|cook|data|pipeline|etl|feed|clean|prep', n):
        return 'chef'
    if re.search(r'viking|stress|bench|perf|load|speed|opt|heavy', n):
        return 'viking'
    return 'default'

def draw_bee_sprite(name, state='flight', frame=0, forced_hat=None):
    W, H = 22, 18
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    pixels = img.load()

    R = ramp(name)
    queen = (name == 'coordinator')
    landed = (state in ('parked', 'landed'))
    asleep = (state == 'parked')

    def P(x, y, col):
        if x < 0 or y < 0 or x >= W or y >= H:
            return
        if isinstance(col, str):
            col = hex2rgba(col)
        elif len(col) == 3:
            col = (col[0], col[1], col[2], 255)
        src_a = col[3] / 255.0
        dst = pixels[x, y]
        dst_a = dst[3] / 255.0
        out_a = src_a + dst_a * (1.0 - src_a)
        if out_a > 0:
            out_r = int((col[0] * src_a + dst[0] * dst_a * (1.0 - src_a)) / out_a)
            out_g = int((col[1] * src_a + dst[1] * dst_a * (1.0 - src_a)) / out_a)
            out_b = int((col[2] * src_a + dst[2] * dst_a * (1.0 - src_a)) / out_a)
            pixels[x, y] = (out_r, out_g, out_b, int(out_a * 255))

    cx, cy = 11.0, 10.5
    rx, ry = 7.3, 4.8
    def inside(x, y):
        nx = (x + 0.5 - cx) / rx
        ny = (y + 0.5 - cy) / ry
        return nx * nx + ny * ny <= 1.0

    L = [-0.42, -0.62, 0.66]
    Ln = math.hypot(*L)
    L = [v / Ln for v in L]

    N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]]
    def rows(spec):
        pts = []
        for y, x0, x1 in spec:
            for x in range(x0, x1 + 1):
                pts.append((x, y))
        return pts

    def draw_wing(pts, glint):
        pts_set = set(pts)
        for x, y in pts:
            edge = any((x + dx, y + dy) not in pts_set for dx, dy in N4)
            P(x, y, (140, 160, 192, 230) if edge else (255, 255, 255, 184))
        if glint:
            interior = [p for p in pts if all((p[0] + dx, p[1] + dy) in pts_set for dx, dy in N4)]
            if interior:
                interior.sort(key=lambda p: (p[1], p[0]))
                P(interior[0][0], interior[0][1], (255, 255, 255, 255))

    back = None
    if landed:
        front = rows([[5, 14, 17], [6, 13, 18]])
    elif frame == 0:
        back = rows([[1, 16, 17], [2, 16, 18], [3, 15, 18], [4, 15, 17], [5, 15, 16]])
        front = rows([[0, 13, 14], [1, 12, 15], [2, 11, 15], [3, 11, 14], [4, 11, 13], [5, 11, 12]])
    else:
        back = rows([[3, 16, 18], [4, 15, 19], [5, 16, 18]])
        front = rows([[3, 13, 16], [4, 12, 17], [5, 12, 17], [6, 13, 15]])

    if back:
        draw_wing(back, False)

    def stripe(x, y):
        ny = (y + 0.5 - cy) / ry
        u = x + 0.5 + 1.15 * ny * ny
        return (10.6 < u < 12.5) or (14.3 < u < 16.1) or (u > 17.9)

    for y in range(H):
        for x in range(W):
            if not inside(x, y):
                continue
            nx = (x + 0.5 - cx) / rx
            ny = (y + 0.5 - cy) / ry
            rr = min(1.0, nx * nx + ny * ny)
            nz = math.sqrt(1.0 - rr)
            I = nx * L[0] + ny * L[1] + nz * L[2]
            if stripe(x, y):
                col = R['skh'] if I > 0.80 else (R['sk'] if I > 0.30 else R['skd'])
            else:
                col = R['spec'] if I > 0.965 else (R['hi'] if I > 0.78 else (R['mid'] if I > 0.26 else R['sh']))
            P(x, y, col)

    for y in range(H):
        for x in range(W):
            if inside(x, y):
                continue
            nbs = [[dx, dy] for dx, dy in N4 if inside(x + dx, y + dy)]
            if not nbs:
                continue
            nx = (x + 0.5 - cx) / rx
            ny = (y + 0.5 - cy) / ry
            n = math.hypot(nx, ny)
            d = (nx / n) * L[0] + (ny / n) * L[1]
            nextToStripe = any(stripe(x + dx, y + dy) for dx, dy in nbs)
            col = R['sh'] if (d > 0.5 and not nextToStripe) else R['ol']
            P(x, y, col)

    P(19, 10, R['ol'])
    P(20, 10, R['ol'])

    if asleep:
        P(6, 10, R['ol'])
        P(7, 10, R['ol'])
    else:
        P(6, 9, '#FFFFFF')
        P(7, 9, R['skd'])
        P(6, 10, R['skd'])
        P(7, 10, R['skd'])

    P(5, 11, 'rgba(255,128,150,0.55)')
    P(4, 11, 'rgba(255,128,150,0.35)')

    hat = forced_hat if forced_hat else get_hat_type(name)

    if hat == 'crown':
        g1, g2, g3 = '#F7CE5B', '#FFE9A6', '#C98A2B'
        for x in [5, 6, 7, 8, 9]:
            P(x, 5, g1)
        P(5, 4, g2); P(7, 4, g2); P(9, 4, g2); P(7, 3, g2)
        P(5, 5, g3); P(9, 5, g3); P(7, 5, '#E4566A')
    elif hat == 'hardhat':
        hy, hyl, hyd, hyol = '#FFC72C', '#FFE082', '#C69200', '#8C6500'
        for x in range(3, 11):
            P(x, 5, hyd)
        P(3, 5, hyol); P(10, 5, hyol)
        for x in range(4, 10):
            P(x, 4, hy)
        for x in range(5, 9):
            P(x, 3, hy)
        for x in [6, 7]:
            P(x, 2, hyl)
        P(6, 3, hyl); P(6, 4, hyl); P(9, 4, hyd); P(8, 3, hyd)
    elif hat == 'mortarboard':
        mb, mbh, mbt = '#1E1E24', '#42424D', '#F59E0B'
        for x in [6, 7, 8, 9]:
            P(x, 5, mb)
        for x in range(3, 12):
            P(x, 4, mb)
        for x in range(4, 11):
            P(x, 3, mbh)
        P(7, 2, mbt); P(6, 3, mbt); P(5, 4, mbt); P(4, 5, mbt); P(4, 6, mbt)
    elif hat == 'tophat':
        th, thh, thb = '#27272A', '#52525B', '#DC2626'
        for x in range(4, 11):
            P(x, 5, th)
        for x in range(5, 10):
            P(x, 4, thb)
        for x in range(5, 10):
            P(x, 3, th); P(x, 2, th); P(x, 1, th)
        P(5, 1, thh); P(5, 2, thh); P(5, 3, thh)
    elif hat == 'beret':
        br, brl, ft, ftb = '#7C3AED', '#A78BFA', '#FFFFFF', '#38BDF8'
        for x in range(5, 10):
            P(x, 5, br)
        for x in range(4, 11):
            P(x, 4, br)
        for x in range(5, 10):
            P(x, 3, brl)
        P(6, 2, brl); P(9, 3, ftb); P(10, 2, ft); P(11, 1, ft); P(12, 0, ft)
    elif hat == 'police':
        pc, pcl, pcv, gd = '#1E3A8A', '#3B82F6', '#09090B', '#FBBF24'
        for x in [4, 5, 6, 7]:
            P(x, 5, pcv)
        for x in range(5, 10):
            P(x, 4, pc)
        P(6, 4, gd)
        for x in range(4, 11):
            P(x, 3, pcl)
        for x in range(5, 10):
            P(x, 2, pc)
    elif hat == 'wizard':
        wz, wzl, st = '#312E81', '#6366F1', '#FBBF24'
        for x in range(3, 11):
            P(x, 5, wz)
        for x in range(5, 10):
            P(x, 4, wz)
        for x in [6, 7, 8]:
            P(x, 3, wz)
        for x in [7, 8]:
            P(x, 2, wzl)
        P(8, 1, wzl); P(9, 0, st); P(6, 4, st)
    elif hat == 'pirate':
        pt, ptl, skull, eye = '#18181B', '#3F3F46', '#F4F4F5', '#000000'
        for x in range(3, 11):
            P(x, 5, pt)
        for x in range(4, 10):
            P(x, 4, pt)
        for x in range(5, 9):
            P(x, 3, ptl)
        P(7, 4, skull); P(6, 9, eye); P(5, 8, pt); P(7, 10, pt)
    elif hat == 'chef':
        cf, cfs, cfd = '#FFFFFF', '#CBD5E1', '#94A3B8'
        for x in range(5, 10):
            P(x, 5, cfs)
        for x in range(5, 10):
            P(x, 4, cf)
        for x in range(4, 11):
            P(x, 3, cf); P(x, 2, cf)
        for x in range(5, 10):
            P(x, 1, cfd)
        P(4, 2, cfs); P(10, 2, cfs)
    elif hat == 'viking':
        vk, vkl, hr, hrt = '#52525B', '#A1A1AA', '#FEF08A', '#FDE047'
        for x in range(5, 10):
            P(x, 5, vk); P(x, 4, vk)
        for x in [6, 7, 8]:
            P(x, 3, vkl)
        P(4, 4, hr); P(3, 3, hr); P(2, 2, hrt)
        P(10, 4, hr); P(11, 3, hr); P(12, 2, hrt)
    else:
        for x, y in [[7, 5], [6, 4], [5, 3]]:
            P(x, y, R['ol'])
        P(4, 3, R['sk'])
        for x, y in [[9, 5], [9, 4], [9, 3]]:
            P(x, y, R['ol'])
        P(8, 2, R['sk'])

    draw_wing(front, True)

    if asleep:
        z = '#8C90A6'
        for x, y in [[0, 0], [1, 0], [2, 0], [3, 0], [2, 1], [1, 2], [0, 3], [1, 3], [2, 3], [3, 3]]:
            P(x, y, z)

    return img

def render_bee(name, state='flight', frame=0, forced_hat=None, scale=6):
    raw = draw_bee_sprite(name, state, frame, forced_hat)
    target_w = int(round(raw.width * scale))
    target_h = int(round(raw.height * scale))
    return raw.resize((target_w, target_h), Image.Resampling.NEAREST)

# Font loading helpers
def get_font(size, bold=False, mono=False):
    try:
        if mono:
            return ImageFont.truetype(r"C:\Windows\Fonts\consola.ttf", size)
        elif bold:
            return ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", size)
        else:
            return ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", size)
    except:
        return ImageFont.load_default()

# -------------------------------------------------------------
# 1. GENERATE BANNER (assets/banner.png)
# -------------------------------------------------------------
def generate_banner():
    W, H = 1200, 400
    banner = Image.new('RGBA', (W, H), (15, 17, 23, 255))
    draw = ImageDraw.Draw(banner)

    # Draw subtle background hex pattern
    hex_color = (28, 32, 45, 180)
    for row in range(-1, 10):
        for col in range(-1, 20):
            cx = col * 70 + (35 if row % 2 else 0)
            cy = row * 45
            # Draw hexagon outlines
            r = 24
            pts = []
            for a in range(6):
                ang = math.pi / 3 * a + math.pi / 6
                pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
            draw.polygon(pts, outline=hex_color, fill=None)

    # Dark overlay gradient to soften edges
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    # Right-side glowing radial
    for r in range(400, 0, -10):
        alpha = int(35 * (1.0 - r / 400.0))
        glow_draw.ellipse([850 - r, 200 - r, 850 + r, 200 + r], fill=(120, 80, 240, alpha))
    for r in range(350, 0, -10):
        alpha = int(45 * (1.0 - r / 350.0))
        glow_draw.ellipse([920 - r, 180 - r, 920 + r, 180 + r], fill=(255, 199, 44, alpha))
    banner = Image.alpha_composite(banner, glow)
    draw = ImageDraw.Draw(banner)

    # Badge Pill: ANTIGRAVITY PLUGIN
    pill_x, pill_y = 60, 52
    draw.rounded_rectangle([pill_x, pill_y, pill_x + 210, pill_y + 30], radius=15, fill=(35, 39, 54, 230), outline=(99, 102, 241, 200), width=1)
    badge_font = get_font(13, bold=True)
    draw.text((pill_x + 16, pill_y + 6), "GOOGLE ANTIGRAVITY", fill=(255, 200, 60), font=badge_font)
    draw.text((pill_x + 152, pill_y + 6), "PLUGIN", fill=(190, 195, 220), font=badge_font)

    # Main Title
    title_font = get_font(44, bold=True)
    draw.text((60, 95), "Swarm Cosmetics", fill=(255, 255, 255), font=title_font)

    # Subtitle
    sub_font = get_font(20, bold=False)
    draw.text((60, 155), "Procedural Pixel-Art Hats for Agent Bees", fill=(255, 199, 44), font=sub_font)

    # Description
    desc_font = get_font(14, bold=False)
    desc_lines = [
        "Instantly distinguish coordinators, builders, verifiers, researchers,",
        "and specialists buzzing inside native Antigravity Swarm mode.",
        "Deterministic role-based sprites, fully responsive in dark and light themes."
    ]
    dy = 195
    for l in desc_lines:
        draw.text((60, dy), l, fill=(160, 166, 188), font=desc_font)
        dy += 22

    # Feature tags
    tags = ["10 Custom Hats", "22x18 Pixel Sprites", "Hook Persistence", "Zero Overhead"]
    tx = 60
    tag_font = get_font(12, bold=True)
    for t in tags:
        tw = int(tag_font.getlength(t)) + 24
        draw.rounded_rectangle([tx, 290, tx + tw, 318], radius=6, fill=(28, 31, 44), outline=(50, 56, 78))
        draw.text((tx + 12, 296), t, fill=(220, 225, 240), font=tag_font)
        tx += tw + 10

    # Right side: Swarm formation of bees with different hats
    bees_spec = [
        ('coordinator', 'flight', 0, 850, 150, 7.5, "Queen Coordinator"),
        ('builder-1', 'flight', 1, 710, 110, 6.0, "Builder"),
        ('verifier-1', 'flight', 0, 1000, 120, 6.0, "Verifier"),
        ('wizard-1', 'flight', 1, 730, 240, 6.0, "Wizard"),
        ('researcher-1', 'flight', 0, 980, 250, 6.0, "Researcher"),
        ('pirate-1', 'flight', 1, 860, 290, 5.5, "Security"),
    ]

    # Draw bees
    for name, st, frame, bx, by, scale, label in bees_spec:
        bee = render_bee(name, st, frame, scale=int(scale))
        # subtle shadow underneath
        sh_w, sh_h = bee.width, int(bee.height * 0.4)
        sh_img = Image.new('RGBA', (sh_w, sh_h), (0, 0, 0, 0))
        sh_draw = ImageDraw.Draw(sh_img)
        sh_draw.ellipse([0, 0, sh_w, sh_h], fill=(0, 0, 0, 80))
        banner.paste(sh_img, (bx - bee.width // 2, by + bee.height // 2 - 10), sh_img)
        # paste bee
        banner.paste(bee, (bx - bee.width // 2, by - bee.height // 2), bee)

    banner_path = os.path.join(ASSETS_DIR, 'banner.png')
    banner.save(banner_path, 'PNG')
    print("Saved banner:", banner_path)

# -------------------------------------------------------------
# 2. GENERATE ROLES SHOWCASE (assets/roles-showcase.png)
# -------------------------------------------------------------
def generate_roles_showcase():
    W, H = 1200, 920
    img = Image.new('RGBA', (W, H), (17, 19, 26, 255))
    draw = ImageDraw.Draw(img)

    # Top Header
    title_font = get_font(32, bold=True)
    draw.text((60, 40), "Headgear & Role Catalog", fill=(255, 255, 255), font=title_font)
    sub_font = get_font(16, bold=False)
    draw.text((60, 82), "Each worker bee automatically receives headgear matching its assigned name and role in the swarm.", fill=(150, 156, 175), font=sub_font)

    # Catalog items: (Role Title, Hat Name, Name Pattern, Description, Sample Name)
    catalog = [
        ("Coordinator", "Crown with Ruby", "coordinator", "Queen bee / swarm lead. Coordinates all workers.", "coordinator"),
        ("Builder / Dev", "Yellow Hard Hat", "builder, dev, fix, code", "Authors writing code, implementing features & fixes.", "builder-1"),
        ("Verifier / QA", "Academic Mortarboard", "verifier, qa, test, check", "Validates diffs, runs test suites, quality assurance.", "verifier-1"),
        ("Researcher", "Top Hat with Ribbon", "research, scout, doc", "Codebase exploration, architectural discovery.", "researcher-1"),
        ("Narrator", "Beret with Quill", "narrator, story, log", "System agent logging high-level project timeline.", "narrator"),
        ("Monitor", "Peaked Officer Cap", "monitor, guard, watch", "Anti-stall watchdog and swarm activity monitor.", "monitor"),
        ("Wizard / AI", "Pointed Star Hat", "wizard, ai, model, llm", "Prompt engineering, LLM synthesis, neural tasks.", "wizard-1"),
        ("Pirate / Security", "Tricorn & Eyepatch", "pirate, sec, pentest", "Security audits, vulnerability research, pentest.", "pirate-1"),
        ("Chef / Data", "Puffed Chef Toque", "chef, data, etl, clean", "ETL pipelines, data parsing, dataset curation.", "chef-1"),
        ("Viking / Stress", "Horned Helmet", "viking, stress, bench", "Performance benchmarks, stress & load testing.", "viking-1"),
        ("Standard Worker", "Natural Antennae", "(Default / unassigned)", "General-purpose parallel worker tasks.", "worker-99")
    ]

    card_w = 346
    card_h = 160
    start_x = 60
    start_y = 135
    cols = 3

    lbl_role_font = get_font(18, bold=True)
    lbl_hat_font = get_font(14, bold=True)
    mono_font = get_font(11, mono=True)
    desc_font = get_font(12, bold=False)

    for i, (role, hat, pattern, desc, sample_name) in enumerate(catalog):
        row = i // cols
        col = i % cols
        cx = start_x + col * (card_w + 20)
        cy = start_y + row * (card_h + 20)

        # Card container
        draw.rounded_rectangle([cx, cy, cx + card_w, cy + card_h], radius=10, fill=(24, 27, 38), outline=(40, 45, 62), width=1)

        # Avatar circle background
        avatar_r = 38
        acx, acy = cx + 54, cy + 62
        draw.ellipse([acx - avatar_r, acy - avatar_r, acx + avatar_r, acy + avatar_r], fill=(32, 36, 52), outline=(52, 58, 82), width=1)

        # Render Bee
        bee = render_bee(sample_name, 'flight', (i % 2), scale=3)
        img.paste(bee, (acx - bee.width // 2, acy - bee.height // 2), bee)

        # Text Details
        tx = cx + 110
        draw.text((tx, cy + 18), role, fill=(255, 255, 255), font=lbl_role_font)
        draw.text((tx, cy + 42), hat, fill=(255, 199, 44), font=lbl_hat_font)

        # Pattern badge
        pat_w = int(mono_font.getlength(pattern)) + 12
        draw.rounded_rectangle([tx, cy + 68, tx + pat_w, cy + 86], radius=4, fill=(35, 39, 56), outline=(60, 66, 92))
        draw.text((tx + 6, cy + 71), pattern, fill=(140, 190, 255), font=mono_font)

        # Description
        words = desc.split()
        l1, l2 = [], []
        curr = l1
        for w in words:
            if len(" ".join(curr + [w])) < 28:
                curr.append(w)
            else:
                curr = l2
                curr.append(w)
        draw.text((tx, cy + 96), " ".join(l1), fill=(160, 166, 185), font=desc_font)
        if l2:
            draw.text((tx, cy + 114), " ".join(l2), fill=(160, 166, 185), font=desc_font)

    # Footer note
    foot_font = get_font(13, bold=False)
    draw.text((60, H - 40), "Role names are matched automatically by substring regex inside Antigravity Swarm Board.", fill=(110, 116, 135), font=foot_font)

    showcase_path = os.path.join(ASSETS_DIR, 'roles-showcase.png')
    img.save(showcase_path, 'PNG')
    print("Saved roles showcase:", showcase_path)

# -------------------------------------------------------------
# 3. GENERATE SWARM UI PREVIEW (assets/swarm-preview.png)
# -------------------------------------------------------------
def generate_swarm_preview():
    W, H = 1200, 750
    ui = Image.new('RGBA', (W, H), (20, 22, 30, 255))
    draw = ImageDraw.Draw(ui)

    # IDE Auxiliary Pane Window Frame
    draw.rounded_rectangle([30, 30, W - 30, H - 30], radius=12, fill=(15, 17, 23), outline=(45, 50, 70), width=1)

    # Window Titlebar / Header
    header_h = 56
    draw.rounded_rectangle([30, 30, W - 30, 30 + header_h], radius=12, fill=(22, 25, 35))
    draw.rectangle([30, 30 + header_h - 10, W - 30, 30 + header_h], fill=(22, 25, 35))
    draw.line([30, 30 + header_h, W - 30, 30 + header_h], fill=(40, 45, 65), width=1)

    # Title & Live Dot
    title_font = get_font(18, bold=True)
    draw.text((54, 46), "Swarm", fill=(255, 255, 255), font=title_font)

    # Live Badge
    draw.ellipse([124, 52, 134, 62], fill=(34, 197, 94))
    live_font = get_font(13, bold=True)
    draw.text((142, 48), "Live", fill=(34, 197, 94), font=live_font)

    # Subtitle / Conv ID
    meta_font = get_font(12, mono=True)
    draw.text((185, 50), "| Conv: 4c2f696e | 6 Active Workers", fill=(130, 135, 155), font=meta_font)

    # Tabs (Overview, Board, Members, Graph, Raw)
    tabs = [("Overview", False), ("Board (6)", True), ("Members (8)", False), ("Graph", False), ("Raw", False)]
    tx = W - 490
    tab_font = get_font(13, bold=True)
    for tname, active in tabs:
        tw = int(tab_font.getlength(tname)) + 24
        if active:
            draw.rectangle([tx, 30 + header_h - 3, tx + tw, 30 + header_h], fill=(255, 199, 44))
            draw.text((tx + 12, 48), tname, fill=(255, 199, 44), font=tab_font)
        else:
            draw.text((tx + 12, 48), tname, fill=(140, 145, 165), font=tab_font)
        tx += tw + 10

    # Content Area Split: Left Hive Grid (400px), Right Board Feed (remaining)
    split_x = 450
    draw.line([split_x, 30 + header_h, split_x, H - 30], fill=(38, 42, 60), width=1)

    # LEFT PANEL: Swarm Members / Hex Honeycomb
    left_font = get_font(14, bold=True)
    draw.text((54, 106), "ROSTER & STATES", fill=(170, 176, 200), font=left_font)

    members = [
        ("coordinator", "Queen Coordinator", "working", "Assigning tasks"),
        ("builder-1", "Builder (Auth)", "working", "Building patch.js"),
        ("builder-2", "Builder (UI)", "working", "Aux pane UI tab"),
        ("verifier-1", "Verifier", "needs_you", "Tests pass (14/14)"),
        ("researcher-1", "Researcher", "parked", "Indexed codebase"),
        ("wizard-1", "Wizard", "working", "Optimizing prompt"),
    ]

    my = 140
    for name, title, state, last_action in members:
        draw.rounded_rectangle([50, my, split_x - 20, my + 68], radius=8, fill=(24, 27, 38), outline=(38, 43, 62), width=1)
        # Bee avatar
        bee = render_bee(name, 'landed' if state == 'parked' else 'flight', 0, scale=2.5)
        ui.paste(bee, (60, my + 12), bee)

        # Title & name
        draw.text((125, my + 10), title, fill=(255, 255, 255), font=get_font(14, bold=True))
        draw.text((125, my + 28), f"@{name}", fill=(130, 136, 158), font=get_font(12, mono=True))
        draw.text((125, my + 46), f"Status: {last_action}", fill=(170, 175, 195), font=get_font(11, bold=False))

        # Status Badge on right
        st_color = (34, 197, 94) if state == 'working' else ((245, 158, 11) if state == 'needs_you' else (140, 145, 165))
        st_text = state.replace('_', ' ')
        draw.rounded_rectangle([split_x - 110, my + 14, split_x - 30, my + 34], radius=4, fill=(28, 32, 46), outline=st_color)
        draw.text((split_x - 104, my + 17), st_text, fill=st_color, font=get_font(10, bold=True))

        my += 78

    # RIGHT PANEL: Live Board Task Feed
    draw.text((split_x + 30, 106), "LIVE BOARD FEED", fill=(170, 176, 200), font=left_font)

    feed = [
        ("coordinator", "@coordinator", "2m ago", "Launched cosmetic patch task. Spawning builder-1 and verifier-1 for execution.", (255, 200, 60)),
        ("builder-1", "@builder-1", "1m ago", "@coordinator Implemented 10 procedural headgear shaders into hive.js canvas pipeline.", (100, 200, 255)),
        ("wizard-1", "@wizard-1", "45s ago", "@coordinator Verified pixel alignment and contrast ratios across light and dark backgrounds.", (180, 130, 255)),
        ("verifier-1", "@verifier-1", "20s ago", "@coordinator Ran full integration test suite. Cache busting verified. All 14 tests passed.", (34, 197, 94)),
        ("builder-2", "@builder-2", "Just now", "Generated ultra-crisp showcase graphic assets for GitHub documentation.", (255, 160, 60))
    ]

    fy = 140
    for name, author, time_str, message, col in feed:
        draw.rounded_rectangle([split_x + 30, fy, W - 50, fy + 80], radius=8, fill=(22, 25, 36), outline=(36, 40, 58), width=1)
        # Bee avatar
        bee = render_bee(name, 'flight', 1, scale=2.2)
        ui.paste(bee, (split_x + 42, fy + 16), bee)

        # Header: Author & Time
        draw.text((split_x + 105, fy + 12), author, fill=col, font=get_font(14, bold=True))
        draw.text((split_x + 280, fy + 14), time_str, fill=(120, 125, 145), font=get_font(11, bold=False))

        # Message
        draw.text((split_x + 105, fy + 38), message, fill=(210, 215, 230), font=get_font(13, bold=False))

        fy += 92

    preview_path = os.path.join(ASSETS_DIR, 'swarm-preview.png')
    ui.save(preview_path, 'PNG')
    print("Saved swarm preview:", preview_path)

# -------------------------------------------------------------
# 4. GENERATE ANIMATED DEMO GIF (assets/demo.gif)
# -------------------------------------------------------------
def generate_demo_gif():
    # 4 frames animated loop of bees buzzing and flapping
    W, H = 640, 240
    frames = []

    # Hats showcase in demo
    showcase_bees = [
        ('coordinator', 'Coordinator', 70, 110),
        ('builder-1', 'Builder', 180, 110),
        ('verifier-1', 'Verifier', 290, 110),
        ('wizard-1', 'Wizard', 400, 110),
        ('viking-1', 'Viking', 510, 110),
    ]

    for f in range(6):
        frame_img = Image.new('RGBA', (W, H), (15, 17, 24, 255))
        draw = ImageDraw.Draw(frame_img)

        # Title
        draw.text((20, 18), "LIVE PIXEL HEADGEAR PREVIEW", fill=(255, 199, 44), font=get_font(13, bold=True))
        draw.ellipse([W - 145, 23, W - 137, 31], fill=(34, 197, 94))
        draw.text((W - 130, 18), "ANIMATED", fill=(34, 197, 94), font=get_font(12, bold=True))
        draw.line([20, 42, W - 20, 42], fill=(35, 40, 58), width=1)

        # Draw bees with sinusoidal bobbing
        wing_frame = 0 if (f % 2 == 0) else 1
        for i, (name, lbl, bx, by) in enumerate(showcase_bees):
            # calculate bobbing
            bob = int(math.sin((f + i * 1.2) * math.pi / 3) * 6)
            cur_y = by + bob

            # Shadow on floor
            sh_w = 60
            sh_h = 16
            draw.ellipse([bx - sh_w // 2, 175 - bob // 2, bx + sh_w // 2, 175 + sh_h - bob // 2], fill=(10, 12, 18, 160))

            # Bee
            bee = render_bee(name, 'flight', wing_frame, scale=3.8)
            frame_img.paste(bee, (bx - bee.width // 2, cur_y - bee.height // 2), bee)

            # Label
            draw.text((bx - int(get_font(12, bold=True).getlength(lbl)) // 2, 195), lbl, fill=(220, 225, 240), font=get_font(12, bold=True))

        frames.append(frame_img.convert('RGB'))

    demo_path = os.path.join(ASSETS_DIR, 'demo.gif')
    frames[0].save(demo_path, save_all=True, append_images=frames[1:], duration=160, loop=0)
    print("Saved animated demo:", demo_path)

if __name__ == '__main__':
    generate_banner()
    generate_roles_showcase()
    generate_swarm_preview()
    generate_demo_gif()
    print("All assets generated successfully!")
