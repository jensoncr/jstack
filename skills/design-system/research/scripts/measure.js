// Geometry + computed-style dump for named targets. Edit TARGETS per site, then run:
//   agent-browser eval --stdin < measure.js > geom-<theme>.json
// Each target is a CSS selector or a JS function returning an element. `children: true` also
// dumps the direct children (for anatomy: icon / label / badge sizes).
(() => {
  const TARGETS = {
    layout: { fn: () => document.body, walk: 6 },          // top-level layout tree (wide/tall boxes only)
    sidebar: { sel: 'aside, nav[aria-label], [class*="sidebar"]', children: true },
    navItem: { sel: 'aside a, nav a', children: true },
    navActive: { fn: () => Array.from(document.querySelectorAll('aside a, nav a')).find(a => a.getAttribute('aria-current') || getComputedStyle(a).fontWeight >= 500) },
    input: { sel: 'input:not([type=hidden]), textarea', parent: 2 },
    buttons: { sel: 'button, a[role=button]', all: 30 },
    headings: { sel: 'h1, h2, h3, h4', all: 12 },
    card: { sel: '[class*="card"], [class*="rounded"][class*="border"]', all: 12, children: true },
    table: { sel: 'table', children: true },
    th: { sel: 'th, thead td', all: 6 },
    td: { sel: 'tbody td', all: 6 },
    tab: { sel: '[role=tab], [data-state][class*="tab"]', all: 6, children: true },
    badge: { sel: '[class*="badge"], [class*="uppercase"][class*="tracking"]', all: 10 },
    avatar: { sel: '[class*="avatar"], [class*="rounded-full"]', all: 8 },
    kbd: { sel: 'kbd', all: 6 },
    icons: { sel: 'svg', all: 40, icon: true },
  };

  const cs = (el) => getComputedStyle(el);
  const r = (n) => Math.round(n * 100) / 100;
  const rect = (el) => { const b = el.getBoundingClientRect(); return [r(b.x), r(b.y), r(b.width), r(b.height)]; };
  const visible = (el) => { const b = el.getBoundingClientRect(); const s = cs(el); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const cls = (el) => (typeof el.className === 'string' ? el.className : (el.getAttribute && el.getAttribute('class')) || '').trim().slice(0, 240);
  const box = (el) => { const s = cs(el); return { tag: el.tagName.toLowerCase(), t: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim().slice(0, 40).replace(/\n/g, ' / '), rect: rect(el), cls: cls(el), bg: s.backgroundColor, color: s.color, border: `${s.borderTopWidth}/${s.borderRightWidth}/${s.borderBottomWidth}/${s.borderLeftWidth} ${s.borderColor}`, radius: s.borderRadius, pad: s.padding, gap: s.gap, font: `${s.fontSize}/${s.lineHeight} ${s.fontWeight} ${s.fontFamily.split(',')[0]} ls${s.letterSpacing} ${s.textTransform}`, shadow: s.boxShadow, transition: s.transition, animation: s.animation, opacity: s.opacity, transform: s.transform, display: `${s.display}/${s.flexDirection}/${s.alignItems}`, overflow: s.overflow, position: s.position, z: s.zIndex, attrs: Object.fromEntries(['data-state', 'aria-current', 'aria-selected', 'aria-expanded', 'href', 'type', 'role'].map(a => [a, el.getAttribute(a)]).filter(([, v]) => v)) }; };
  const iconBox = (el) => ({ rect: rect(el), viewBox: el.getAttribute('viewBox'), strokeWidth: el.getAttribute('stroke-width') || cs(el).strokeWidth, fill: el.getAttribute('fill'), stroke: el.getAttribute('stroke'), color: cs(el).color, cls: cls(el).slice(0, 80) });

  const out = {};
  for (const [name, t] of Object.entries(TARGETS)) {
    if (t.walk) { const layout = []; const walk = (el, depth, path) => { if (depth > t.walk) return; for (const c of el.children) { const b = c.getBoundingClientRect(); if (b.width >= 100 && b.height >= 40) { layout.push({ path: `${path}>${c.tagName.toLowerCase()}${c.id ? '#' + c.id : ''}`, ...box(c) }); walk(c, depth + 1, `${path}>${c.tagName.toLowerCase()}`); } } }; walk(t.fn(), 0, 'body'); out[name] = layout.slice(0, 80); continue; }
    let els = t.fn ? [t.fn()].filter(Boolean) : Array.from(document.querySelectorAll(t.sel)).filter(visible);
    if (t.icon) { out[name] = els.slice(0, t.all || 40).map(iconBox); continue; }
    const seen = new Set(); const items = [];
    for (const el of els) { const key = cls(el) + '|' + rect(el)[3]; if (!t.fn && seen.has(key)) continue; seen.add(key); const item = box(el); if (t.children) item.children = Array.from(el.children).filter(visible).slice(0, 10).map(box); if (t.parent) { let p = el; item.ancestors = []; for (let i = 0; i < t.parent && p.parentElement; i++) { p = p.parentElement; item.ancestors.push(box(p)); } } items.push(item); if (items.length >= (t.all || 3)) break; }
    out[name] = items;
  }
  out.viewport = { w: innerWidth, h: innerHeight, dpr: devicePixelRatio, theme: document.documentElement.className, scheme: cs(document.documentElement).colorScheme };
  return out;
})()
