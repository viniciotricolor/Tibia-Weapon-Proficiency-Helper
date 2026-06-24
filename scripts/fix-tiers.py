import json, subprocess, hashlib, time, re, sys

WIKI_API = "https://tibiawiki.com.br/api.php"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

TYPE_MAP = {
    "Espadas": "sword", "Machados": "axe", "Clavas": "club",
    "Rods": "rod", "Wands": "wand", "Distancia": "distance", "Punhos": "fist",
}

def compute_md5(s):
    return hashlib.md5(s.encode()).hexdigest()

def slugify(n):
    return re.sub(r'[^a-z0-9\s-]', '', n.lower()).replace(' ', '-').strip('-')

def fetch_wikitext(title):
    params = "action=parse&page={}&prop=wikitext&format=json".format(title.replace(' ', '_'))
    result = subprocess.run(
        ["curl", "-s", "-H", "User-Agent: " + UA, WIKI_API + "?" + params],
        capture_output=True, text=True, timeout=30
    )
    try:
        data = json.loads(result.stdout)
        return data.get("parse", {}).get("wikitext", {}).get("*", "")
    except:
        return ""

def get_field(wt, field):
    pattern = r'^\|\s*' + re.escape(field) + r'\s*=\s*([^\n]*?)$'
    m = re.search(pattern, wt, re.MULTILINE)
    if m:
        return m.group(1).strip()
    return ""

def parse_perks(wikitext):
    perks = []
    for i in range(1, 15):
        perk_field = get_field(wikitext, "perk" + str(i))
        if not perk_field:
            continue
        perk_texts = []
        for m in re.finditer(r'\{\{Weapon Perk\|[^|]*\|[^|]*\|([^}]+)\}\}', perk_field):
            perk_texts.append(m.group(1).strip())
        if not perk_texts:
            for m in re.finditer(r'\{\{Weapon Perk\|[^|]*\|([^}]+)\}\}', perk_field):
                perk_texts.append(m.group(1).strip())
        if perk_texts:
            perks.append({"tier": i, "perks": perk_texts})
    return perks

def parse_weapon(wikitext, name, category):
    has_perks = bool(re.search(r'perk\d', wikitext))
    if not has_perks:
        return None

    level = int(get_field(wikitext, "levelrequired") or "0")
    voc_raw = get_field(wikitext, "vocrequired")
    vocation = []
    for v, label in [("knight", "Knight"), ("paladin", "Paladin"), ("sorcerer", "Sorcerer"), ("druid", "Druid"), ("monk", "Monk")]:
        if label in voc_raw:
            vocation.append(v)

    hands = get_field(wikitext, "hands")
    hand = "two-handed" if "Duas" in hands else "one-handed"
    attack_str = get_field(wikitext, "attack") or get_field(wikitext, "damage") or "0"
    attack = int(re.sub(r'[^\d]', '', attack_str) or "0")

    elem_attack = get_field(wikitext, "elementattack")
    attack_element = None
    em = re.search(r'(\d+)\s+(.+)', elem_attack)
    if em:
        attack_element = re.sub(r'\[\[.*?\|?(.*?)\]\]', r'\1', em.group(2)).strip()

    perks = parse_perks(wikitext)

    img_match = re.search(r'\[\[Imagem:([^\]|]+)', wikitext, re.IGNORECASE)
    image_name = img_match.group(1).replace(" ", "_") if img_match else name.replace(" ", "_") + ".gif"
    md5 = compute_md5(image_name)
    image = "https://www.tibiawiki.com.br/images/{}/{}//{}".format(md5[0], md5[:2], image_name)

    source_raw = get_field(wikitext, "droppedby")
    source = re.sub(r'\[\[.*?\|?(.*?)\]\]', r'\1', source_raw).replace(".", "").strip()

    return {
        "id": slugify(name),
        "name": name,
        "type": TYPE_MAP.get(category, category.lower()),
        "vocation": vocation,
        "attack": attack,
        "attackElement": attack_element,
        "level": level,
        "image": image,
        "hand": hand,
        "perks": perks,
        "source": source,
    }

# Load existing weapons
with open("data/weapons.json") as f:
    weapons = json.load(f)

existing = {w["id"]: w for w in weapons}
categories = ["Espadas", "Machados", "Clavas", "Rods", "Wands", "Distancia", "Punhos"]

updated = 0
errors = 0

for category in categories:
    params = "action=query&list=categorymembers&cmtitle=Category:{}&cmlimit=500&cmtype=page&format=json".format(category)
    result = subprocess.run(
        ["curl", "-s", "-H", "User-Agent: " + UA, WIKI_API + "?" + params],
        capture_output=True, text=True, timeout=30
    )
    try:
        data = json.loads(result.stdout)
        members = [p["title"].replace("_", " ") for p in data.get("query", {}).get("categorymembers", [])]
    except:
        continue

    for name in members:
        wid = slugify(name)
        if wid not in existing:
            continue

        wikitext = fetch_wikitext(name)
        if not wikitext:
            errors += 1
            continue

        new_weapon = parse_weapon(wikitext, name, category)
        if not new_weapon:
            continue

        old_tiers = len(existing[wid]["perks"])
        new_tiers = len(new_weapon["perks"])

        if old_tiers != new_tiers:
            existing[wid]["perks"] = new_weapon["perks"]
            existing[wid]["image"] = new_weapon["image"]
            updated += 1
            print("FIXED: {} {} -> {} tiers".format(name, old_tiers, new_tiers))

        time.sleep(0.1)

weapons = list(existing.values())
with open("data/weapons.json", "w") as f:
    json.dump(weapons, f, indent=2, ensure_ascii=False)

print("\nUpdated: {} | Errors: {} | Total: {}".format(updated, errors, len(weapons)))
