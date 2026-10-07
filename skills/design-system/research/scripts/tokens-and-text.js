(() => {
  const cs = (el) => getComputedStyle(el);
  const r = (n) => Math.round(n * 100) / 100;
  const rect = (el) => { const b = el.getBoundingClientRect(); return { x: r(b.x), y: r(b.y), w: r(b.width), h: r(b.height) }; };
  const visible = (el) => { const b = el.getBoundingClientRect(); const s = cs(el); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; };
  const PROPS = ['color','backgroundColor','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textTransform','borderRadius','borderWidth','borderColor','borderStyle','boxShadow','padding','margin','gap','height','width','minHeight','opacity','transition','animation','cursor','outline','outlineOffset','backdropFilter','textDecoration'];
  const pick = (el, props = PROPS) => { const s = cs(el); const o = {}; for (const p of props) { const v = s[p]; if (v && v !== 'none' && v !== 'normal' && v !== '0px' && v !== 'auto' && v !== 'rgba(0, 0, 0, 0)') o[p] = v; } return o; };
  const cls = (el) => (typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '')).trim().slice(0, 400);

  // 1. custom properties from stylesheets + computed values
  const vars = {};
  for (const sh of document.styleSheets) {
    let rules; try { rules = sh.cssRules; } catch { continue; }
    const walk = (rs) => { for (const rule of rs) { if (rule.cssRules) walk(rule.cssRules); if (!rule.style) continue; for (const p of rule.style) if (p.startsWith('--')) { (vars[p] ||= {}); const sel = rule.selectorText || rule.parentRule?.cssText?.slice(0, 40) || '?'; vars[p][sel] = rule.style.getPropertyValue(p).trim(); } } };
    walk(rules);
  }
  const html = document.documentElement;
  const computedVars = {}; for (const p of Object.keys(vars)) computedVars[p] = cs(html).getPropertyValue(p).trim();

  // 2. text style clusters
  const clusters = {};
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const txt = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
    if (!txt) continue;
    const s = cs(el);
    const key = [s.fontFamily.split(',')[0], s.fontSize, s.fontWeight, s.lineHeight, s.letterSpacing, s.textTransform, s.color].join('|');
    const c = (clusters[key] ||= { count: 0, samples: [], tags: {} });
    c.count++; if (c.samples.length < 4) c.samples.push(txt.slice(0, 40)); c.tags[el.tagName.toLowerCase()] = (c.tags[el.tagName.toLowerCase()] || 0) + 1;
  }
  const textStyles = Object.entries(clusters).map(([k, v]) => { const [family, size, weight, lh, ls, tt, color] = k.split('|'); return { family, size, weight, lh, ls, tt, color, ...v }; }).sort((a, b) => b.count - a.count);

  // 3. regions
  const regions = {};
  const cand = { sidebar: 'aside, nav, [data-sidebar], [class*="sidebar"]', header: 'header, [class*="topbar"], [class*="breadcrumb"]', main: 'main, [role=main]' };
  for (const [name, sel] of Object.entries(cand)) { const els = Array.from(document.querySelectorAll(sel)).filter(visible).slice(0, 4); regions[name] = els.map(el => ({ tag: el.tagName.toLowerCase(), cls: cls(el), rect: rect(el), style: pick(el, ['backgroundColor','borderWidth','borderColor','padding','width','height','gap','boxShadow','transition']) })); }

  // 4. components
  const comps = {};
  const sels = { link: 'a', button: 'button', input: 'input, textarea', tab: '[role=tab]', th: 'th', td: 'td', heading: 'h1,h2,h3,h4,h5,h6', kbd: 'kbd', badge: '[class*="badge"], [class*="Badge"]', card: '[class*="card"], [class*="Card"]', separator: 'hr, [role=separator]', avatar: '[class*="avatar"], [class*="Avatar"]', svg: 'svg', scroll: '[class*="overflow-y-auto"], [class*="overflow-auto"]' };
  for (const [name, sel] of Object.entries(sels)) {
    const seen = {}; const out = [];
    for (const el of document.querySelectorAll(sel)) {
      if (!visible(el)) continue; const c = cls(el); const key = name === 'svg' ? `${rect(el).w}x${rect(el).h}|${cs(el).strokeWidth}|${cs(el).color}` : c;
      if (seen[key]) { seen[key].n++; continue; }
      const item = { n: 1, cls: c, text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim().slice(0, 40), rect: rect(el), style: pick(el), attrs: {} };
      for (const a of ['data-state','aria-current','aria-selected','data-active','href','type','placeholder']) { const v = el.getAttribute(a); if (v) item.attrs[a] = v.slice(0, 80); }
      if (name === 'svg') item.style.strokeWidth = cs(el).strokeWidth;
      seen[key] = item; out.push(item);
    }
    comps[name] = out.slice(0, 60);
  }

  // 5. keyframes + transitions declared
  const keyframes = {}; const transitions = new Set(); const animations = new Set();
  for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; } for (const rule of rules) { if (rule.type === 7) keyframes[rule.name] = rule.cssText.slice(0, 300); if (rule.style) { if (rule.style.transition) transitions.add(rule.style.transition); if (rule.style.animation) animations.add(rule.style.animation); } } }

  // 6. scrollbar / selection / focus rules
  const misc = []; for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; } for (const rule of rules) { const t = rule.selectorText || ''; if (/scrollbar|::selection|focus-visible|prefers-reduced-motion/.test(t) || /reduced-motion/.test(rule.cssText.slice(0, 80))) misc.push(rule.cssText.slice(0, 240)); } }

  return { url: location.href, theme: { htmlClass: html.className, colorScheme: cs(html).colorScheme, bodyBg: cs(document.body).backgroundColor, bodyColor: cs(document.body).color, bodyFont: cs(document.body).fontFamily, bodySize: cs(document.body).fontSize, bodyLh: cs(document.body).lineHeight }, fontsLoaded: Array.from(document.fonts).filter(f => f.status === 'loaded').map(f => `${f.family} ${f.weight} ${f.style}`), vars, computedVars, textStyles, regions, comps, keyframes, transitions: [...transitions], animations: [...animations], misc: misc.slice(0, 40), viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio } };
})()
