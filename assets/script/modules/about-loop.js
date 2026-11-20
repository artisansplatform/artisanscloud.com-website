// About Us hero: a comet circles Vault and lights up each step of the
// Artisans loop in turn; the card below names the active step.
// Click a step to jump to it. No-ops without #aboutLoop.
const ST = [
  {
    k: "Capture",
    p: "Vault",
    c: "#9f7eff",
    d: "Captures knowledge from business systems, documents and people.",
  },
  {
    k: "Prepare",
    p: "Arena",
    c: "#f27acf",
    d: "Teams practise real customer and operational scenarios, grounded in that knowledge.",
  },
  {
    k: "Interact",
    p: "Lumen",
    c: "#2ed3e6",
    d: "Anyone asks in plain language and gets answers that cite their sources.",
  },
  {
    k: "Execute",
    p: "AI agents",
    c: "#f5b04c",
    d: "Agents in Forge and Nexus act on the memory, with people approving what matters.",
  },
];

export function initAboutLoop() {
  const cv = document.getElementById("aboutLoop");
  if (!cv) return;
  const g = cv.getContext("2d");
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const card = {
    k: document.getElementById("aboutLoopK"),
    t: document.getElementById("aboutLoopT"),
    d: document.getElementById("aboutLoopD"),
  };

  let W = 1,
    H = 1,
    active = 0,
    comet = -Math.PI / 2,
    time = 0,
    sparks = [],
    pinned = 0,
    lastSt = -1;
  function resize() {
    const d = Math.min(devicePixelRatio, 2);
    W = cv.clientWidth;
    H = cv.clientHeight;
    cv.width = W * d;
    cv.height = H * d;
    g.setTransform(d, 0, 0, d, 0, 0);
  }
  addEventListener("resize", resize);
  resize();

  const S = () => Math.min(1, W / 620);
  const geo = () => ({ cx: W / 2, cy: H * 0.5, rx: W * 0.36, ry: H * 0.32 });
  const at = (a) => {
    const { cx, cy, rx, ry } = geo();
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  };
  const angOf = (i) => -Math.PI / 2 + (i * Math.PI) / 2;

  function setActive(i) {
    active = i;
    const s = ST[i];
    card.k.textContent = `${i + 1} · ${s.k}`;
    card.k.style.color = s.c;
    card.t.textContent = s.p;
    card.d.textContent = s.d;
  }
  setActive(0);

  function burst(i, n) {
    const [x, y] = at(angOf(i));
    for (let k = 0; k < n; k++)
      sparks.push({
        x,
        y,
        t: 0,
        v: 0.008 + Math.random() * 0.012,
        j: (Math.random() - 0.5) * 60,
        c: ST[i].c,
      });
  }

  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left,
      y = e.clientY - r.top;
    ST.forEach((s, i) => {
      const [px, py] = at(angOf(i));
      if (Math.hypot(px - x, py - y) < 50) {
        setActive(i);
        pinned = 600;
        comet = angOf(i);
        burst(i, 40);
      }
    });
  });

  function draw() {
    const { cx, cy, rx, ry } = geo();
    const sc = S();
    g.clearRect(0, 0, W, H);
    g.textAlign = "center";
    g.textBaseline = "middle";

    g.lineWidth = 14;
    g.strokeStyle = "rgba(159,126,255,.08)";
    g.beginPath();
    g.ellipse(cx, cy, rx, ry, 0, 0, 6.28);
    g.stroke();
    g.lineWidth = 1.5;
    g.strokeStyle = "rgba(159,126,255,.35)";
    g.setLineDash([2, 7]);
    g.beginPath();
    g.ellipse(cx, cy, rx, ry, 0, 0, 6.28);
    g.stroke();
    g.setLineDash([]);

    for (let k = 0; k < 40; k++) {
      const [x, y] = at(comet - k * 0.022);
      g.globalAlpha = (1 - k / 40) * 0.9;
      g.fillStyle = "#e6dcff";
      g.beginPath();
      g.arc(x, y, 5 * (1 - k / 40) + 1, 0, 6.28);
      g.fill();
    }
    g.globalAlpha = 1;
    {
      const [x, y] = at(comet);
      g.shadowColor = "#fff";
      g.shadowBlur = 30;
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(x, y, 6, 0, 6.28);
      g.fill();
      g.shadowBlur = 0;
    }

    const pr = 1 + Math.sin(time * 0.05) * 0.05 + sparks.length * 0.0015;
    let gr = g.createRadialGradient(cx, cy, 0, cx, cy, 110 * pr * sc);
    gr.addColorStop(0, "rgba(159,126,255,.55)");
    gr.addColorStop(1, "rgba(159,126,255,0)");
    g.fillStyle = gr;
    g.beginPath();
    g.arc(cx, cy, 110 * pr * sc, 0, 6.28);
    g.fill();
    for (let k = 0; k < 3; k++) {
      const r = (40 + k * 14) * pr * sc;
      g.strokeStyle = `rgba(201,184,255,${0.45 - k * 0.12})`;
      g.beginPath();
      g.ellipse(
        cx,
        cy,
        r,
        r * 0.42,
        time * 0.004 * (k % 2 ? -1 : 1) + k,
        0,
        6.28,
      );
      g.stroke();
    }
    gr = g.createRadialGradient(cx - 10, cy - 10, 2, cx, cy, 30 * sc);
    gr.addColorStop(0, "#f1ebff");
    gr.addColorStop(1, "#7c5cff");
    g.fillStyle = gr;
    g.shadowColor = "#9f7eff";
    g.shadowBlur = 40;
    g.beginPath();
    g.arc(cx, cy, 28 * sc, 0, 6.28);
    g.fill();
    g.shadowBlur = 0;
    g.fillStyle = "#fff";
    g.font = "600 13px Poppins";
    g.fillText("Vault", cx, cy + 1);
    g.fillStyle = "#a49fc6";
    g.font = "500 11px Poppins";
    g.fillText("Organisational Memory", cx, cy + 50 * sc);

    sparks = sparks.filter((s) => {
      s.t += s.v;
      if (s.t >= 1) return false;
      const e = s.t * s.t,
        mx = (s.x + cx) / 2 + s.j,
        my = (s.y + cy) / 2 - s.j * 0.4;
      const x = (1 - s.t) ** 2 * s.x + 2 * (1 - s.t) * s.t * mx + e * cx;
      const y = (1 - s.t) ** 2 * s.y + 2 * (1 - s.t) * s.t * my + e * cy;
      g.globalAlpha = 1 - s.t * 0.6;
      g.fillStyle = s.c;
      g.beginPath();
      g.arc(x, y, 2, 0, 6.28);
      g.fill();
      return true;
    });
    g.globalAlpha = 1;

    ST.forEach((s, i) => {
      const [x, y] = at(angOf(i)),
        on = i === active,
        R = (on ? 24 : 20) * Math.max(sc, 0.8);
      if (on) {
        g.strokeStyle = s.c;
        for (let r = 0; r < 2; r++) {
          const rr = R + 6 + ((time * 0.5 + r * 18) % 36);
          g.globalAlpha = 0.5 * (1 - (rr - R) / 42);
          g.beginPath();
          g.arc(x, y, rr, 0, 6.28);
          g.stroke();
        }
        g.globalAlpha = 1;
      }
      g.shadowColor = s.c;
      g.shadowBlur = on ? 40 : 18;
      g.fillStyle = "rgba(10,8,34,.96)";
      g.strokeStyle = s.c;
      g.lineWidth = on ? 2.5 : 1.5;
      g.beginPath();
      g.arc(x, y, R, 0, 6.28);
      g.fill();
      g.stroke();
      g.shadowBlur = 0;
      g.lineWidth = 1;
      g.fillStyle = s.c;
      g.font = "700 14px Poppins";
      g.fillText(String(i + 1), x, y + 1);
      const ly = i === 0 ? y - R - 26 : y + R + 22;
      g.font = "600 10px Poppins";
      g.fillText(s.k.toUpperCase(), x, ly - 8);
      g.fillStyle = "#efebff";
      g.font = "600 13px Poppins";
      g.fillText(s.p, x, ly + 8);
    });
  }

  let visible = false;
  new IntersectionObserver((en) => (visible = en[0].isIntersecting)).observe(
    cv,
  );
  function loop() {
    if (visible) {
      time++;
      if (!RM) comet += 0.009;
      if (pinned > 0) pinned--;
      const norm =
        (((comet + Math.PI / 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const st = Math.floor((norm + 0.12) / (Math.PI / 2)) % 4;
      if (st !== lastSt && Math.abs(norm - (st * Math.PI) / 2) < 0.12) {
        lastSt = st;
        burst(st, 24);
        if (!pinned) setActive(st);
      }
      draw();
    }
    requestAnimationFrame(loop);
  }
  draw();
  loop();
}
