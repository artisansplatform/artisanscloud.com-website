// Vault hero: animated force graph of the six kinds of knowledge Vault links.
// Drag a node to rearrange, hover to trace its links. No-ops without #vaultGraph.
const HUBS = [
  {
    n: "People & Expertise",
    c: "#f27acf",
    s: ["Process engineer", "QA lead", "Plant manager"],
  },
  {
    n: "Processes",
    c: "#9f7eff",
    s: ["Line changeover", "CAPA", "Onboarding"],
  },
  { n: "Systems", c: "#2ed3e6", s: ["ERP", "MES", "CRM"] },
  { n: "Projects", c: "#f5b04c", s: ["Plant 2 expansion", "Supplier audit"] },
  { n: "Decisions", c: "#b9a4ff", s: ["Supplier switch", "Shift pattern"] },
  { n: "Policies", c: "#3ddc97", s: ["GMP", "Data retention"] },
];
const CROSS = [
  ["Process engineer", "Line changeover"],
  ["Line changeover", "MES"],
  ["QA lead", "CAPA"],
  ["CAPA", "GMP"],
  ["Supplier audit", "Supplier switch"],
  ["Plant 2 expansion", "ERP"],
  ["Plant manager", "Shift pattern"],
  ["Onboarding", "Process engineer"],
];

export function initVaultGraph() {
  const cv = document.getElementById("vaultGraph");
  if (!cv) return;
  const g = cv.getContext("2d");
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const N = [{ n: "Vault", r: 26, hub: -1, core: true }];
  const E = [];
  HUBS.forEach((h, i) => {
    const hi = N.length;
    N.push({ n: h.n, c: h.c, r: 15, hub: i, isHub: true });
    E.push({ a: 0, b: hi });
    h.s.forEach((s) => {
      E.push({ a: hi, b: N.length });
      N.push({ n: s, c: h.c, r: 6, hub: i });
    });
  });
  const id = (n) => N.findIndex((x) => x.n === n);
  CROSS.forEach(([a, b]) => E.push({ a: id(a), b: id(b), cross: true }));
  const adj = N.map(() => new Set());
  E.forEach((e) => {
    adj[e.a].add(e.b);
    adj[e.b].add(e.a);
  });

  let W = 1,
    H = 1,
    S = 1;
  function resize() {
    const dpr = Math.min(devicePixelRatio, 2);
    W = cv.clientWidth;
    H = cv.clientHeight;
    S = Math.min(1, W / 620); // shrink spacing and labels on small screens
    cv.width = W * dpr;
    cv.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener("resize", resize);
  resize();

  N.forEach((n) => {
    if (n.core) {
      n.x = W / 2;
      n.y = H / 2;
    } else {
      const a =
        (n.hub / 6) * 6.283 -
        1.57 +
        (n.isHub ? 0 : (Math.random() - 0.5) * 0.9);
      const R = (n.isHub ? 120 : 210) * S;
      n.x = W / 2 + Math.cos(a) * R;
      n.y = H / 2 + Math.sin(a) * R * 0.8;
    }
    n.vx = n.vy = 0;
  });

  function step() {
    const cx = W / 2,
      cy = H / 2;
    for (let i = 0; i < N.length; i++) {
      const a = N[i];
      for (let j = i + 1; j < N.length; j++) {
        const b = N[j];
        let dx = a.x - b.x,
          dy = a.y - b.y;
        const d2 = dx * dx + dy * dy + 0.01,
          d = Math.sqrt(d2),
          f = (1500 * S * S) / d2;
        dx /= d;
        dy /= d;
        a.vx += dx * f;
        a.vy += dy * f;
        b.vx -= dx * f;
        b.vy -= dy * f;
      }
    }
    E.forEach((e) => {
      const a = N[e.a],
        b = N[e.b];
      const L = (e.cross ? 120 : a.core ? 130 : 70) * S,
        k = e.cross ? 0.004 : 0.02;
      const dx = b.x - a.x,
        dy = b.y - a.y,
        d = Math.hypot(dx, dy) || 1,
        f = (d - L) * k;
      a.vx += (dx / d) * f;
      a.vy += (dy / d) * f;
      b.vx -= (dx / d) * f;
      b.vy -= (dy / d) * f;
    });
    N.forEach((n, i) => {
      if (n.core) {
        n.vx += (cx - n.x) * 0.05;
        n.vy += (cy - n.y) * 0.05;
      }
      n.vx += (cx - n.x) * 0.0009;
      n.vy += (cy - n.y) * 0.0012;
      if (i === drag) return;
      n.vx *= 0.82;
      n.vy *= 0.82;
      n.x = Math.max(n.r + 10, Math.min(W - n.r - 10, n.x + n.vx));
      n.y = Math.max(n.r + 16, Math.min(H - n.r - 16, n.y + n.vy));
    });
  }

  let hover = -1,
    drag = -1,
    ox = 0,
    oy = 0,
    time = 0;
  const pick = (x, y) =>
    N.findIndex((n) => (n.x - x) ** 2 + (n.y - y) ** 2 < (n.r + 10) ** 2);
  const xy = (e) => {
    const r = cv.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  cv.addEventListener("pointerdown", (e) => {
    const [x, y] = xy(e);
    drag = pick(x, y);
    if (drag < 0) return;
    ox = N[drag].x - x;
    oy = N[drag].y - y;
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener("pointermove", (e) => {
    const [x, y] = xy(e);
    if (drag >= 0) {
      N[drag].x = x + ox;
      N[drag].y = y + oy;
    }
    hover = pick(x, y);
    cv.style.cursor = drag >= 0 ? "grabbing" : hover >= 0 ? "grab" : "default";
  });
  cv.addEventListener("pointerup", () => (drag = -1));
  cv.addEventListener("pointerleave", () => (hover = -1));

  for (let k = 0; k < 300; k++) step();

  function draw() {
    g.clearRect(0, 0, W, H);
    E.forEach((e, k) => {
      const a = N[e.a],
        b = N[e.b];
      const hot = hover >= 0 && (e.a === hover || e.b === hover);
      g.lineWidth = hot ? 2 : 1.2;
      g.setLineDash(e.cross ? [4, 6] : []);
      g.strokeStyle = hot
        ? "#fff"
        : e.cross
          ? "rgba(159,126,255,.5)"
          : (a.core ? b.c : a.c) + "88";
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
      g.setLineDash([]);
      if (!e.cross && !RM) {
        const t = (time * 0.006 + k * 0.17) % 1;
        g.fillStyle = "#fff";
        g.beginPath();
        g.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 1.6, 0, 6.28);
        g.fill();
      }
    });
    N.forEach((n, i) => {
      const hot = i === hover || (hover >= 0 && adj[hover].has(i));
      g.textBaseline = "middle";
      if (n.core) {
        const pr = 1 + Math.sin(time * 0.05) * 0.06;
        const gr = g.createRadialGradient(n.x, n.y, 0, n.x, n.y, 70 * pr);
        gr.addColorStop(0, "rgba(159,126,255,.55)");
        gr.addColorStop(1, "rgba(159,126,255,0)");
        g.fillStyle = gr;
        g.beginPath();
        g.arc(n.x, n.y, 70 * pr, 0, 6.28);
        g.fill();
        const g2 = g.createRadialGradient(n.x - 8, n.y - 8, 2, n.x, n.y, n.r);
        g2.addColorStop(0, "#e6dcff");
        g2.addColorStop(1, "#7c5cff");
        g.fillStyle = g2;
        g.shadowColor = "#9f7eff";
        g.shadowBlur = 30;
        g.beginPath();
        g.arc(n.x, n.y, n.r, 0, 6.28);
        g.fill();
        g.shadowBlur = 0;
        g.fillStyle = "#fff";
        g.font = "600 12px Poppins";
        g.textAlign = "center";
        g.fillText("Vault", n.x, n.y + 1);
      } else {
        g.shadowColor = n.c;
        g.shadowBlur = hot ? 26 : n.isHub ? 18 : 8;
        g.fillStyle = n.isHub ? "rgba(10,8,34,.95)" : n.c;
        g.strokeStyle = n.c;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(n.x, n.y, n.r + (hot ? 2 : 0), 0, 6.28);
        g.fill();
        if (n.isHub) g.stroke();
        g.shadowBlur = 0;
        if (n.isHub) {
          g.fillStyle = n.c;
          g.beginPath();
          g.arc(n.x, n.y, 5, 0, 6.28);
          g.fill();
        }
        const fs = Math.round((n.isHub ? 13 : 11) * Math.max(S, 0.8));
        g.font = `${n.isHub ? 600 : 500} ${fs}px Poppins`;
        g.fillStyle = n.isHub ? "#efebff" : "#c9c4e6";
        const right = n.x >= W / 2;
        g.textAlign = right ? "left" : "right";
        g.fillText(n.n, n.x + (right ? 1 : -1) * (n.r + 8), n.y);
      }
    });
  }

  let visible = false;
  new IntersectionObserver((en) => (visible = en[0].isIntersecting)).observe(
    cv,
  );
  function loop() {
    if (visible || time === 0) {
      if (!RM || drag >= 0) step();
      time += 1;
      draw();
    }
    requestAnimationFrame(loop);
  }
  loop();
}
