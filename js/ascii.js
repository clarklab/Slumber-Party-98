/** Period VGA / BBS intro mark — same art as img/og-image.png */

export const ASCII_INTRO = String.raw`
      ░▒▓█▓▒░  millhaven bbs  node 4  14.4k  ░▒▓█▓▒░
           sun oct 18 1998 · no adults after 9:47pm

███████╗██╗     ██╗   ██╗███╗   ███╗██████╗ ███████╗██████╗
██╔════╝██║     ██║   ██║████╗ ████║██╔══██╗██╔════╝██╔══██╗
███████╗██║     ██║   ██║██╔████╔██║██████╔╝█████╗  ██████╔╝
╚════██║██║     ██║   ██║██║╚██╔╝██║██╔══██╗██╔══╝  ██╔══██╗
███████║███████╗╚██████╔╝██║ ╚═╝ ██║██████╔╝███████╗██║  ██║
╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝
     ██████╗  █████╗ ██████╗ ████████╗██╗   ██╗
     ██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝╚██╗ ██╔╝
     ██████╔╝███████║██████╔╝   ██║    ╚████╔╝
     ██╔═══╝ ██╔══██║██╔══██╗   ██║     ╚██╔╝
     ██║     ██║  ██║██║  ██║   ██║      ██║
     ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝      ╚═╝
                  █████╗  █████╗
                 ██╔══██╗██╔══██╗
                 ╚██████║╚█████╔╝
                  ╚═══██║██╔══██╗
                  █████╔╝╚█████╔╝
                  ╚════╝  ╚════╝

     ── a homesoft 98 production · you had to be there ──
              * don't look at the ninth print *
`.trim();

export function asciiIntroHtml() {
  const lines = ASCII_INTRO.split("\n");
  const painted = lines.map((line, i) => {
    let cls = "a-dim";
    if (i <= 1) cls = "a-yel";
    else if (i >= 3 && i <= 8) cls = "a-cyan";
    else if (i >= 9 && i <= 14) cls = "a-mag";
    else if (i >= 15 && i <= 20) cls = "a-gold";
    else if (i === lines.length - 2) cls = "a-green";
    else if (i === lines.length - 1) cls = "a-red";
    return `<span class="${cls}">${esc(line) || "&nbsp;"}</span>`;
  });
  return painted.join("\n");
}

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
