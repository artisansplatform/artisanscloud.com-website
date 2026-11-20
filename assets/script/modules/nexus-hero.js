// Nexus hero: interactive commerce simulation on a 2D canvas (stage is a fixed
// 1440x810 canvas scaled by forge-lifecycle.js). No-ops without #nx-hero.
export function initNexusHero() {
  const root = document.getElementById("nx-hero");
  if (!root) return;
  let visible = true;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
  }).observe(root);

  var CH = [
    { id: "web", n: "Website", c: "#22D3EE", x: 300, y: 238 },
    { id: "mkt", n: "Marketplaces", c: "#F472B6", x: 222, y: 360 },
    { id: "soc", n: "Social commerce", c: "#FB923C", x: 206, y: 486 },
    { id: "pos", n: "Stores and POS", c: "#A78BFA", x: 236, y: 612 },
    { id: "app", n: "Mobile app", c: "#34D399", x: 318, y: 728 },
  ];
  var FU = [
    { id: "wh", n: "Central warehouse", x: 1112, y: 262, s: 88 },
    { id: "sa", n: "Store A · Mid Valley", x: 1176, y: 392, s: 46 },
    { id: "sb", n: "Store B · Bangsar", x: 1176, y: 522, s: 34 },
    { id: "dh", n: "Delivery hub", x: 1112, y: 652, s: 60 },
  ];
  var CORE = { x: 720, y: 430 },
    ICONS = {
      check:
        ' <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M20 6 9 17l-5-5" /> </svg> ',
      sparkles:
        ' <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /> <path d="M20 2v4" /> <path d="M22 4h-4" /> <circle cx="4" cy="20" r="2" /> </svg> ',
      route:
        ' <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <circle cx="6" cy="19" r="3" /> <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /> <circle cx="18" cy="5" r="3" /> </svg> ',
      package:
        ' <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /> <path d="M12 22V12" /> <polyline points="3.29 7 12 12 20.71 7" /> <path d="m7.5 4.27 9 5.15" /> </svg> ',
      star: ' <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /> </svg> ',
      zap: ' <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z" /> </svg> ',
      arrow:
        ' <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M5 12h14" /> <path d="m12 5 7 7-7 7" /> </svg> ',
      cal: ' <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M8 2v3" /> <path d="M16 2v3" /> <rect x="3" y="3" width="18" height="18" rx="2" /> <path d="M3 9h18" /> <path d="m9 15 2 2 4-4" /> </svg> ',
    };
  var wrap = document.getElementById("nx-wrap"),
    cv = document.getElementById("nx-cv"),
    ctx = cv.getContext("2d");
  var DPR = Math.min(3, window.devicePixelRatio || 1),
    scale = 1;
  function fit() {
    scale = wrap.clientWidth / 1440;
    var d = DPR * Math.max(1, scale);
    cv.width = 1440 * d;
    cv.height = 810 * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  window.addEventListener("resize", fit);
  fit();
  var reduce =
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function ctrl(a, b, bend) {
    var mx = (a.x + b.x) / 2,
      my = (a.y + b.y) / 2;
    return { x: mx, y: my + bend };
  }
  function q(a, c, b, t) {
    var u = 1 - t;
    return {
      x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
      y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
    };
  }
  CH.forEach(function (c) {
    c.p = { x: c.x + 30, y: c.y };
    c.k = ctrl(c.p, CORE, (c.y - CORE.y) * -0.25);
  });
  FU.forEach(function (f) {
    f.p = { x: f.x - 26, y: f.y };
    f.k = ctrl(CORE, f.p, (f.y - CORE.y) * -0.25);
    f.el = document.getElementById("nx-fu-" + f.id);
    f.bar = f.el.querySelector(".bar");
    f.fill = f.el.querySelector(".bar i");
    f.sv = f.el.querySelector(".sv");
  });
  var parts = [],
    sparks = [],
    t0 = performance.now(),
    last = t0,
    rate = 1.1,
    surge = false,
    orders = 12480,
    corePulse = 0,
    lastUser = 0,
    guided = null,
    hintIdx = 0;
  function setStock(f, v) {
    f.s = Math.max(0, Math.min(100, v));
    f.fill.style.width = f.s + "%";
    f.sv.textContent = Math.round(f.s);
    f.bar.classList.toggle("low", f.s < 25);
  }
  FU.forEach(function (f) {
    setStock(f, f.s);
  });
  function spawn(ch, special) {
    parts.push({
      leg: 1,
      a: ch.p,
      k: ch.k,
      b: CORE,
      t: 0,
      sp: (special ? 0.42 : 0.55 + Math.random() * 0.35) * (surge ? 1.5 : 1),
      c: ch.c,
      ch: ch,
      special: special,
      trail: [],
    });
  }
  function pickDest() {
    var best = null,
      score = -1;
    FU.forEach(function (f) {
      var s = f.s + Math.random() * 30 - (f.id === "wh" ? 10 : 0);
      if (f.s > 4 && s > score) {
        score = s;
        best = f;
      }
    });
    return best || FU[0];
  }
  var toastsEl = document.getElementById("nx-toasts"),
    toasts = [];
  function toast(html, icon) {
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML =
      (ICONS[icon] || ICONS.sparkles) + "<span>" + html + "</span>";
    el.style.transform = "translateY(20px)";
    el.style.opacity = "0";
    toastsEl.appendChild(el);
    toasts.unshift(el);
    requestAnimationFrame(function () {
      toasts.forEach(function (t, i) {
        t.style.transform =
          "translateY(" + -i * 60 + "px) scale(" + (1 - i * 0.04) + ")";
        t.style.opacity = i > 1 ? "0" : String(1 - i * 0.35);
      });
    });
    if (toasts.length > 4) {
      var o = toasts.pop();
      setTimeout(function () {
        o.remove();
      }, 600);
    }
  }
  var pBody = document.getElementById("nx-pBody");
  function prompt() {
    pBody.innerHTML =
      '<div class="prompt">' +
      ' <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M14 4.1 12 6" /> <path d="m5.1 8-2.9-.8" /> <path d="m6 12-1.9 2" /> <path d="M7.2 2.2 8 5.1" /> <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" /> </svg> ' +
      '<span><b style="color:#fff">Try it:</b> tap any channel to send a test order and watch Nexus handle it.</span></div>';
  }
  function steps(ch) {
    pBody.innerHTML =
      "<h4>" +
      ICONS.zap +
      "Test order from " +
      ch.n +
      '</h4><div class="steps">' +
      [
        "Order captured from " + ch.n,
        "Stock checked across 4 locations",
        "Routed to the best location",
        "Loyalty points and 11.11 offer applied",
      ]
        .map(function (s, i) {
          return (
            '<div class="st" id="nx-s' +
            i +
            '"><i>' +
            (i + 1) +
            "</i><span>" +
            s +
            "</span></div>"
          );
        })
        .join("") +
      "</div>";
  }
  function stepOn(i, txt) {
    var el = document.getElementById("nx-s" + i);
    if (!el) return;
    el.classList.add("on");
    el.querySelector("i").innerHTML = ICONS.check;
    if (txt) el.querySelector("span").innerHTML = txt;
  }
  function finish() {
    var d = document.createElement("div");
    d.className = "cta-in";
    d.innerHTML =
      '<span>Done in under a second. Want this across your channels?</span><a class="btn demo" style="padding:9px 14px;font-size:13px" href="/request-demo" data-cta="nexus-demo-panel">' +
      ICONS.cal +
      "Book a demo</a>";
    pBody.appendChild(d);
  }
  function userOrder(ch, isAuto) {
    if (guided) return;
    if (!isAuto) lastUser = performance.now();
    root.querySelectorAll(".ch").forEach(function (e) {
      e.classList.remove("hint");
    });
    var el = document.getElementById("nx-ch-" + ch.id);
    el.classList.add("on");
    setTimeout(function () {
      el.classList.remove("on");
    }, 700);
    guided = { ch: ch };
    steps(ch);
    stepOn(0);
    spawn(ch, true);
  }
  CH.forEach(function (ch) {
    document
      .getElementById("nx-ch-" + ch.id)
      .addEventListener("click", function () {
        userOrder(ch, false);
      });
  });
  document.getElementById("nx-surge").addEventListener("click", function () {
    surge = !surge;
    this.classList.toggle("on", surge);
    this.querySelector("span").textContent = surge
      ? "11.11 peak running"
      : "Simulate 11.11 peak";
    rate = surge ? 4.2 : 1.1;
    if (surge)
      toast(
        "Peak detected. Agents are <em>pre-positioning stock</em> in stores before demand spikes.",
        "zap",
      );
  });
  function arriveCore(p) {
    corePulse = 1;
    var f =
      p.special && guided ? (FU[1].s > 8 ? FU[1] : pickDest()) : pickDest();
    parts.push({
      leg: 2,
      a: CORE,
      k: f.k,
      b: f.p,
      t: 0,
      sp: p.special ? 0.42 : 0.7 + Math.random() * 0.3,
      c: p.special ? "#FFFFFF" : "#C4B5FD",
      f: f,
      ch: p.ch,
      special: p.special,
      trail: [],
    });
    if (p.special) {
      stepOn(
        1,
        "Stock checked across 4 locations in <em style='font-style:normal;color:#67E8F9'>0.3 s</em>",
      );
    }
  }
  function arriveFu(p) {
    var f = p.f;
    setStock(f, f.s - (surge ? 2.2 : 1.2));
    orders++;
    document.getElementById("nx-k1").textContent =
      orders.toLocaleString("en-US");
    f.el.classList.add("hit");
    setTimeout(function () {
      f.el.classList.remove("hit");
    }, 350);
    for (var i = 0; i < 8; i++)
      sparks.push({
        x: f.p.x,
        y: f.p.y,
        vx: (Math.random() - 0.5) * 2.4,
        vy: (Math.random() - 0.5) * 2.4,
        l: 1,
        c: p.ch.c,
      });
    if (p.special) {
      stepOn(
        2,
        "Routed to <em style='font-style:normal;color:#67E8F9'>" +
          f.n +
          "</em>, nearest with stock",
      );
      setTimeout(function () {
        stepOn(
          3,
          "Loyalty <em style='font-style:normal;color:#67E8F9'>+120 pts</em> and 11.11 offer applied",
        );
        finish();
        toast(
          "Routed " +
            p.ch.n +
            " order to <em>" +
            f.n +
            "</em> and applied the 11.11 offer for a Gold member.",
          "route",
        );
        setTimeout(function () {
          guided = null;
        }, 2500);
        setTimeout(function () {
          if (!guided) prompt();
        }, 9000);
      }, 650);
    } else if (Math.random() < 0.06)
      toast(
        "Routed a <em>" +
          p.ch.n +
          "</em> order to " +
          f.n +
          ", the fastest location with stock.",
        "route",
      );
    if (f.id !== "wh" && f.s < 22 && !f.pending && FU[0].s > 20) {
      f.pending = true;
      parts.push({
        leg: 3,
        a: FU[0].p,
        k: { x: FU[0].p.x - 120, y: (FU[0].p.y + f.p.y) / 2 },
        b: f.p,
        t: 0,
        sp: 0.45,
        c: "#FBBF24",
        f: f,
        trail: [],
      });
      toast(
        "Agent spotted low stock at " +
          f.n +
          " and <em>moved 30 units</em> from the warehouse.",
        "package",
      );
    }
    if (f.id === "wh" && f.s < 30) {
      setStock(f, f.s + 40);
      toast(
        "Agent raised a <em>supplier replenishment</em> for the central warehouse.",
        "package",
      );
    }
  }
  function arriveTransfer(p) {
    p.f.pending = false;
    setStock(p.f, p.f.s + 30);
    setStock(FU[0], FU[0].s - 8);
  }
  // background
  var bg = document.createElement("canvas");
  function drawBg() {
    bg.width = 1440 * 2;
    bg.height = 810 * 2;
    var g = bg.getContext("2d");
    g.scale(2, 2);

    g.strokeStyle = "rgba(139,92,246,.10)";
    g.lineWidth = 1;
    var hz = 560;
    for (var i = 0; i < 14; i++) {
      var y = hz + Math.pow(i / 13, 1.8) * 250;
      g.globalAlpha = 0.25 + i / 18;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(1440, y);
      g.stroke();
    }
    for (var j = -20; j <= 20; j++) {
      g.globalAlpha = 0.35;
      g.beginPath();
      g.moveTo(720 + j * 18, hz);
      g.lineTo(720 + j * 130, 810);
      g.stroke();
    }
    g.globalAlpha = 1;
    var fade = g.createLinearGradient(0, hz - 40, 0, hz + 60);
    fade.addColorStop(0, "#05040D00");
    fade.addColorStop(1, "#05040D00");
    for (var s = 0; s < 90; s++) {
      g.fillStyle = "rgba(255,255,255," + Math.random() * 0.35 + ")";
      g.beginPath();
      g.arc(
        Math.random() * 1440,
        Math.random() * 520,
        Math.random() * 1.2,
        0,
        7,
      );
      g.fill();
    }
  }
  drawBg();
  function curve(a, k, b, col, w, al) {
    ctx.globalAlpha = al;
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(k.x, k.y, b.x, b.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  function draw(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var T = (now - t0) / 1000;
    if (
      !guided &&
      now - lastUser > 9000 &&
      Math.floor(T) % 9 === 4 &&
      !frame.ag
    ) {
      frame.ag = true;
      var c = CH[hintIdx++ % CH.length];
      document.getElementById("nx-ch-" + c.id).classList.add("hint");
      setTimeout(function () {
        userOrder(c, true);
      }, 1500);
    }
    if (Math.floor(T) % 9 !== 4) frame.ag = false;
    if (Math.random() < rate * dt * (reduce ? 0.3 : 1)) {
      spawn(CH[Math.floor(Math.random() * CH.length)], false);
    }
    ctx.clearRect(0, 0, 1440, 810);
    ctx.drawImage(bg, 0, 0, 1440, 810);
    CH.forEach(function (c) {
      curve(c.p, c.k, CORE, c.c, 1.4, 0.22);
    });
    FU.forEach(function (f) {
      curve(CORE, f.k, f.p, "#A78BFA", 1.4, 0.22);
    });
    // core
    corePulse = Math.max(0, corePulse - dt * 2.2);
    var cx = CORE.x,
      cy = CORE.y,
      br = 1 + 0.04 * Math.sin(T * 2) + corePulse * 0.12;
    var hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 190 * br);
    hg.addColorStop(0, "rgba(167,139,250,.55)");
    hg.addColorStop(0.4, "rgba(139,92,246,.18)");
    hg.addColorStop(1, "rgba(139,92,246,0)");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(cx, cy, 190 * br, 0, 7);
    ctx.fill();
    for (var r = 0; r < 3; r++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(T * (r % 2 ? -0.35 : 0.25) + r);
      ctx.scale(1, 0.34 + r * 0.08);
      ctx.strokeStyle = ["#22D3EE", "#F472B6", "#A78BFA"][r];
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.6 / (0.34 + r * 0.08);
      ctx.beginPath();
      ctx.arc(0, 0, 104 + r * 22, 0, 7);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = ctx.strokeStyle;
      var a = T * (1.2 + r * 0.4);
      ctx.beginPath();
      ctx.arc(
        Math.cos(a) * (104 + r * 22),
        Math.sin(a) * (104 + r * 22),
        (4 / (0.34 + r * 0.08)) * 0.6,
        0,
        7,
      );
      ctx.fill();
      ctx.restore();
    }
    var sg = ctx.createRadialGradient(cx - 18, cy - 22, 6, cx, cy, 64 * br);
    sg.addColorStop(0, "#F5F3FF");
    sg.addColorStop(0.25, "#C4B5FD");
    sg.addColorStop(0.6, "#7C3AED");
    sg.addColorStop(1, "#2E1065");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(cx, cy, 62 * br, 0, 7);
    ctx.fill();
    ctx.globalAlpha = 0.1 + corePulse * 0.6;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 62 * br + 8 + corePulse * 30, 0, 7);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // particles
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.t += dt * p.sp;
      var pt = q(p.a, p.k, p.b, Math.min(1, p.t));
      p.trail.push(pt);
      if (p.trail.length > (p.special ? 22 : 12)) p.trail.shift();
      for (var j = 0; j < p.trail.length; j++) {
        var tp = p.trail[j],
          al = j / p.trail.length;
        ctx.globalAlpha = al * 0.8;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, (p.special ? 5 : 2.6) * al + 0.5, 0, 7);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowColor = p.c;
      ctx.shadowBlur = p.special ? 26 : 12;
      ctx.fillStyle = p.special ? "#fff" : p.c;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, p.special ? 7 : 3.6, 0, 7);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (p.special) {
        ctx.strokeStyle = p.ch ? p.ch.c : "#fff";
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 13 + 3 * Math.sin(T * 8), 0, 7);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (p.t >= 1) {
        parts.splice(i, 1);
        if (p.leg === 1) arriveCore(p);
        else if (p.leg === 2) arriveFu(p);
        else arriveTransfer(p);
      }
    }
    for (var s = sparks.length - 1; s >= 0; s--) {
      var k = sparks[s];
      k.x += k.vx;
      k.y += k.vy;
      k.l -= dt * 1.8;
      if (k.l <= 0) {
        sparks.splice(s, 1);
        continue;
      }
      ctx.globalAlpha = k.l;
      ctx.fillStyle = k.c;
      ctx.beginPath();
      ctx.arc(k.x, k.y, 2, 0, 7);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function frame(now) {
    if (visible) draw(now);
    else last = now;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setTimeout(function () {
    toast(
      "Nexus is live across <em>5 channels</em> and 4 fulfilment locations.",
      "sparkles",
    );
  }, 600);
}
