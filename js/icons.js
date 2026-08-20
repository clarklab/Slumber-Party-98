/** Tiny 48×48 Win98-ish glyphs as data URIs. */

function svg(body, size = 48) {
  const raw = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48" shape-rendering="crispEdges">${body}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(raw)}`;
}

export const icons = {
  computer: svg(
    `<rect x="6" y="6" width="36" height="28" fill="#c0c0c0" stroke="#000"/><rect x="10" y="10" width="28" height="18" fill="#000080"/><rect x="18" y="36" width="12" height="4" fill="#c0c0c0" stroke="#000"/><rect x="12" y="40" width="24" height="3" fill="#808080"/>`
  ),
  messenger: svg(
    `<rect x="8" y="10" width="32" height="24" fill="#ffff80" stroke="#000"/><rect x="12" y="14" width="24" height="4" fill="#000"/><rect x="12" y="22" width="18" height="3" fill="#000080"/><circle cx="36" cy="36" r="8" fill="#00a000" stroke="#000"/><circle cx="36" cy="36" r="3" fill="#fff"/>`
  ),
  browser: svg(
    `<rect x="4" y="8" width="40" height="32" fill="#c0c0c0" stroke="#000"/><rect x="8" y="16" width="32" height="20" fill="#fff"/><circle cx="24" cy="26" r="8" fill="#00a0c0" stroke="#000"/><path d="M16 26h16M24 18v16" stroke="#fff"/>`
  ),
  tropicana: svg(
    `<rect x="4" y="6" width="40" height="36" fill="#f0c040" stroke="#000"/><circle cx="24" cy="22" r="10" fill="#208020"/><rect x="22" y="8" width="4" height="10" fill="#6a3"/><ellipse cx="24" cy="38" rx="12" ry="4" fill="#c60"/>`
  ),
  notepad: svg(
    `<rect x="10" y="4" width="28" height="40" fill="#fffef0" stroke="#000"/><rect x="10" y="4" width="28" height="8" fill="#000080"/><path d="M16 18h16M16 24h16M16 30h12" stroke="#000" stroke-width="2"/>`
  ),
  folder: svg(
    `<path d="M6 14h14l4 4h18v22H6z" fill="#e8c44a" stroke="#000"/><path d="M6 18h36" stroke="#c90"/>`
  ),
  recycle: svg(
    `<rect x="16" y="8" width="16" height="6" fill="#c0c0c0" stroke="#000"/><path d="M12 16h24l-4 24H16z" fill="#e0e0e0" stroke="#000"/><path d="M20 22v12M24 22v12M28 22v12" stroke="#808080"/>`
  ),
  photo: svg(
    `<rect x="6" y="10" width="36" height="28" fill="#fff" stroke="#000"/><rect x="10" y="14" width="28" height="20" fill="#68c"/><polygon points="12,32 22,22 28,28 32,24 38,32" fill="#3a3"/><circle cx="18" cy="20" r="3" fill="#ffd200"/>`
  ),
  textfile: svg(
    `<rect x="12" y="6" width="24" height="36" fill="#fff" stroke="#000"/><path d="M16 14h16M16 20h16M16 26h12M16 32h10" stroke="#000"/>`
  ),
  network: svg(
    `<rect x="8" y="24" width="12" height="10" fill="#c0c0c0" stroke="#000"/><rect x="28" y="24" width="12" height="10" fill="#c0c0c0" stroke="#000"/><rect x="18" y="8" width="12" height="10" fill="#c0c0c0" stroke="#000"/><path d="M24 18v6M14 24v-2h20v2" stroke="#000"/>`
  ),
  sticky: svg(
    `<rect x="8" y="8" width="32" height="32" fill="#ffff80" stroke="#000"/><path d="M14 18h20M14 24h20M14 30h14" stroke="#000"/>`
  ),
  dos: svg(
    `<rect x="4" y="6" width="40" height="36" fill="#000" stroke="#c0c0c0"/><text x="8" y="28" fill="#c0c0c0" font-size="10" font-family="monospace">C:\\></text>`
  ),
  help: svg(
    `<circle cx="24" cy="24" r="16" fill="#000080" stroke="#fff"/><text x="19" y="30" fill="#fff" font-size="20" font-family="serif">?</text>`
  ),
  setup: svg(
    `<rect x="8" y="8" width="28" height="22" fill="#c0c0c0" stroke="#000"/><rect x="11" y="11" width="22" height="14" fill="#000080"/><rect x="16" y="32" width="12" height="3" fill="#c0c0c0" stroke="#000"/><circle cx="36" cy="34" r="9" fill="#d0d0d0" stroke="#000"/><circle cx="36" cy="34" r="3" fill="#800000"/><path d="M36 25v18M27 34h18" stroke="#808080"/>`
  ),
  shortcut: svg(
    `<rect x="4" y="6" width="28" height="22" fill="#c0c0c0" stroke="#000"/><rect x="7" y="9" width="22" height="14" fill="#000080"/><path d="M20 28l16-16h-8l10-8-8 10V6z" fill="#ffd200" stroke="#000"/>`
  ),
  info: svg(
    `<circle cx="24" cy="24" r="16" fill="#000080" stroke="#fff"/><text x="20" y="30" fill="#fff" font-size="20" font-family="serif">i</text>`
  ),
  warning: svg(
    `<polygon points="24,4 46,42 2,42" fill="#ffd200" stroke="#000"/><text x="20" y="36" fill="#000" font-size="20" font-family="serif">!</text>`
  ),
  phone: svg(
    `<rect x="14" y="4" width="20" height="40" rx="3" fill="#c0c0c0" stroke="#000"/><rect x="17" y="8" width="14" height="10" fill="#9f9"/><circle cx="24" cy="28" r="5" fill="#800000" stroke="#000"/><rect x="20" y="36" width="8" height="3" fill="#000"/>`
  ),
};

export function img(name, cls = "glyph") {
  return `<img class="${cls}" alt="" src="${icons[name] || icons.textfile}" />`;
}
