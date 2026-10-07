(() => {
  const cs = (el) => getComputedStyle(el);
  const r = (n) => Math.round(n * 100) / 100;
  const rect = (el) => { const b = el.getBoundingClientRect(); return [r(b.x), r(b.y), r(b.width), r(b.height)]; };
  const cls = (el) => (typeof el.className === 'string' ? el.className : '').trim().slice(0, 240);
  const box = (el) => { const s = cs(el); return { tag: el.tagName.toLowerCase(), t: (el.innerText || '').trim().slice(0, 40).replace(/\n/g, ' / '), rect: rect(el), cls: cls(el), bg: s.backgroundColor, border: `${s.borderWidth} ${s.borderColor}`, pad: s.padding, gap: s.gap, radius: s.borderRadius, shadow: s.boxShadow, font: `${s.fontSize}/${s.lineHeight} ${s.fontWeight} ${s.fontFamily.split(',')[0]} ls${s.letterSpacing} ${s.textTransform}`, color: s.color, anim: s.animation, trans: s.transition, transform: s.transform, opacity: s.opacity, z: s.zIndex, state: el.getAttribute('data-state'), side: el.getAttribute('data-side'), role: el.getAttribute('role'), backdrop: s.backdropFilter }; };
  const portals = Array.from(document.body.children).filter(c => c.id !== 'root' && c.getBoundingClientRect().width > 0 && !/widget|toast|sonner/.test(c.className));
  const radix = Array.from(document.querySelectorAll('[data-radix-popper-content-wrapper], [role=dialog], [role=menu], [role=listbox], [cmdk-root], [cmdk-dialog], [data-radix-dialog-overlay], [data-state=open][data-side]')).filter(el => el.getBoundingClientRect().width > 0);
  const roots = [...new Set([...portals, ...radix])];
  return roots.slice(0, 8).map(l => {
    const inner = Array.from(l.querySelectorAll('*')).filter(e => { const b = e.getBoundingClientRect(); return b.height > 0 && e.tagName !== 'path' && e.tagName !== 'g'; }).slice(0, 45).map(box);
    return { root: box(l), inlineStyle: l.getAttribute('style')?.slice(0, 200), inner };
  });
})()
