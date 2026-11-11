// Homepage hero: WebGL "memory core" fed by streams from systems, documents
// and people, with the three applications orbiting it. No-ops without #heroGL.
// three.js is loaded lazily so other pages never download it.
export async function initHeroCore() {
  const canvas = document.getElementById("heroGL");
  const hero = document.getElementById("hero");
  if (!canvas || !hero) return;

  let THREE;
  try {
    THREE = await import("three");
  } catch {
    return;
  }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
  } catch {
    return; // no WebGL: the gradient background still shows
  }

  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = getComputedStyle(document.documentElement);
  const token = (n) => new THREE.Color(css.getPropertyValue(n).trim());
  const COL = {
    teal: token("--color-sky"),
    violet: token("--color-primary"),
    pink: token("--color-pink"),
  };

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  camera.position.set(0, 0, 10);
  const BL = THREE.AdditiveBlending;

  function glowTex(inner, mid) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, inner);
    gr.addColorStop(0.25, mid);
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  const dotTex = glowTex("rgba(255,255,255,1)", "rgba(255,255,255,.5)");
  const softTex = glowTex("rgba(255,255,255,.9)", "rgba(255,255,255,.18)");
  const sprite = (map, color, opacity = 1, extra = {}) =>
    new THREE.Sprite(
      new THREE.SpriteMaterial({
        map,
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: BL,
        ...extra,
      }),
    );
  const lineMat = (color, opacity) =>
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: BL,
      depthWrite: false,
    });

  const world = new THREE.Group();
  scene.add(world);
  const core = new THREE.Group();
  world.add(core);

  // background stars
  {
    const n = 1800;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (Math.random() - 0.5) * 90;
      p[i * 3 + 1] = (Math.random() - 0.5) * 50;
      p[i * 3 + 2] = -10 - Math.random() * 60;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    scene.add(
      new THREE.Points(
        g,
        new THREE.PointsMaterial({
          size: 0.12,
          map: dotTex,
          color: 0x8f86c9,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
          blending: BL,
        }),
      ),
    );
  }

  // core layers
  const glow = sprite(softTex, 0x8b6cff, 0.9);
  glow.scale.set(6.5, 6.5, 1);
  core.add(glow);
  const solid = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.62, 2),
    new THREE.MeshBasicMaterial({
      color: 0x5a3fd9,
      transparent: true,
      opacity: 0.55,
      blending: BL,
      depthWrite: false,
    }),
  );
  core.add(solid);
  const heart = sprite(dotTex, 0xffffff);
  heart.scale.set(1.5, 1.5, 1);
  core.add(heart);
  const wire1 = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.15, 1)),
    lineMat(0xb9a4ff, 0.7),
  );
  core.add(wire1);
  const ico2 = new THREE.IcosahedronGeometry(1.7, 2);
  const wire2 = new THREE.LineSegments(
    new THREE.EdgesGeometry(ico2),
    lineMat(0x7c5cff, 0.2),
  );
  core.add(wire2);
  wire2.add(
    new THREE.Points(
      ico2,
      new THREE.PointsMaterial({
        size: 0.1,
        map: dotTex,
        color: COL.teal,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: BL,
      }),
    ),
  );

  // memory shell: a breathing fibonacci sphere
  const SH = 1600;
  const shellBase = new Float32Array(SH * 3);
  const shellPos = new Float32Array(SH * 3);
  const shellCol = new Float32Array(SH * 3);
  for (let i = 0; i < SH; i++) {
    const y = 1 - (i / (SH - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    const R = 2.45 + (Math.random() - 0.5) * 0.25;
    shellBase.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3);
    const c = [COL.violet, COL.teal, COL.pink, COL.violet, COL.violet][i % 5];
    shellCol.set([c.r, c.g, c.b], i * 3);
  }
  const shellG = new THREE.BufferGeometry();
  shellG.setAttribute("position", new THREE.BufferAttribute(shellPos, 3));
  shellG.setAttribute("color", new THREE.BufferAttribute(shellCol, 3));
  const shellM = new THREE.PointsMaterial({
    size: 0.055,
    map: dotTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: BL,
  });
  const shell = new THREE.Points(shellG, shellM);
  core.add(shell);

  // orbit rings
  const rings = [
    [3.3, 0.35, 0.1],
    [3.8, -0.45, 0.9],
    [4.3, 0.15, -0.6],
  ].map(([r, tx, tz], i) => {
    const pts = [];
    for (let k = 0; k <= 160; k++) {
      const a = (k / 160) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    const l = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      lineMat(i === 1 ? COL.teal : 0x9f7eff, 0.16),
    );
    const g = new THREE.Group();
    g.rotation.set(tx * 0.5 + 0.28, 0, tz * 0.25);
    g.add(l);
    core.add(g);
    return { g, r };
  });

  // satellites: one per application, each linking to its page
  const APPS = [
    {
      n: "Nexus",
      s: "Unified commerce",
      c: COL.violet,
      href: "/unified-commerce/nexus",
      ring: 0,
      a: 0.4,
    },
    {
      n: "Arena",
      s: "AI role-play",
      c: COL.pink,
      href: "/role-play-agent/arena",
      ring: 1,
      a: 1.9,
    },
    {
      n: "Forge",
      s: "Agentic QMS",
      c: COL.teal,
      href: "/quality-management-system",
      ring: 2,
      a: 3.9,
    },
  ];
  const satWrap = document.getElementById("heroSats");
  APPS.forEach((A) => {
    A.obj = new THREE.Object3D();
    rings[A.ring].g.add(A.obj);
    const sp = sprite(dotTex, A.c);
    sp.scale.set(0.55, 0.55, 1);
    A.obj.add(sp);
    const halo = sprite(softTex, A.c, 0.5);
    halo.scale.set(1.6, 1.6, 1);
    A.obj.add(halo);
    A.line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
      lineMat(A.c, 0.22),
    );
    core.add(A.line);
    A.pkt = sprite(dotTex, A.c);
    A.pkt.scale.set(0.22, 0.22, 1);
    core.add(A.pkt);
    A.pt = Math.random();
    const el = document.createElement("a");
    el.className = "hero-sat";
    el.href = A.href;
    el.style.setProperty("--c", `#${A.c.getHexString()}`);
    el.innerHTML = `<i></i><span>${A.n}</span><small>${A.s}</small>`;
    satWrap?.appendChild(el);
    A.el = el;
  });

  // knowledge streams from three sources
  const SRC = [
    { c: COL.teal, p: new THREE.Vector3(-11, -4.5, -2) },
    { c: COL.violet, p: new THREE.Vector3(-12, 3.5, -5) },
    { c: COL.pink, p: new THREE.Vector3(-6, -7, 3) },
  ];
  const NP = 2600;
  const pp = new Float32Array(NP * 3);
  const pc = new Float32Array(NP * 3);
  const P = [];
  for (let i = 0; i < NP; i++) {
    const s = i % 3;
    P.push({
      s,
      t: Math.random(),
      v: 0.0016 + Math.random() * 0.0026,
      ph: Math.random() * 6.28,
      j: new THREE.Vector3(
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.5) * 3.5,
      ),
      sw: 0.6 + Math.random() * 1.4,
    });
    pc.set([SRC[s].c.r, SRC[s].c.g, SRC[s].c.b], i * 3);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
  pg.setAttribute("color", new THREE.BufferAttribute(pc, 3));
  world.add(
    new THREE.Points(
      pg,
      new THREE.PointsMaterial({
        size: 0.085,
        map: dotTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: BL,
      }),
    ),
  );

  // click pulse rings
  const pulses = [];
  let boost = 0;
  let flash = 0;
  function pulse() {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(1, 1.06, 96),
      new THREE.MeshBasicMaterial({
        color: 0xc9b8ff,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        blending: BL,
        depthWrite: false,
      }),
    );
    core.add(m);
    pulses.push({ m, t: 0 });
    boost = 1;
    flash = 1;
  }

  // interaction: drag to turn, click or Enter to pulse
  let rotX = 0;
  let rotY = 0;
  let tRotX = 0;
  let tRotY = 0;
  let mx = 0;
  let my = 0;
  let drag = null;
  let moved = 0;
  canvas.tabIndex = 0;
  canvas.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, rx: tRotX, ry: tRotY };
    moved = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - 0.5;
    my = (e.clientY - r.top) / r.height - 0.5;
    if (drag) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
      tRotY = drag.ry + dx * 0.006;
      tRotX = Math.max(-0.8, Math.min(0.8, drag.rx + dy * 0.004));
    }
  });
  canvas.addEventListener("pointerup", () => {
    if (drag && moved < 6) pulse();
    drag = null;
  });
  canvas.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pulse();
    }
  });

  // sizing: core sits right of the copy on desktop, above it below lg
  let W = 1;
  let H = 1;
  let mobile = false;
  function resize() {
    W = hero.clientWidth;
    H = hero.clientHeight;
    mobile = W < 1024;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    core.position.set(mobile ? 0 : 2.7, mobile ? 1.9 : 0, 0);
    core.scale.setScalar(mobile ? 0.6 : 1);
  }
  addEventListener("resize", resize);
  resize();

  let visible = true;
  new IntersectionObserver((en) => (visible = en[0].isIntersecting)).observe(
    hero,
  );

  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const corePos = new THREE.Vector3();
  const coreWorld = new THREE.Vector3();
  const motion = RM ? 0 : 1;
  let time = 0;
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last) / 16.67;
    last = now;
    if (visible) {
      time += dt * motion;
      const sp = Math.min(1, Math.max(0, scrollY / H));
      boost *= 0.965;
      flash *= 0.94;
      if (!drag) tRotY += 0.0012 * dt * motion;
      rotX += (tRotX - rotX) * 0.06;
      rotY += (tRotY - rotY) * 0.06;
      core.rotation.set(rotX + my * 0.15, rotY + mx * 0.3, 0);
      wire1.rotation.y += 0.004 * dt * motion;
      wire1.rotation.x += 0.0015 * dt * motion;
      wire2.rotation.y -= 0.0022 * dt * motion;
      wire2.rotation.z += 0.001 * dt * motion;
      const br = 1 + Math.sin(time * 0.03) * 0.04 + flash * 0.35;
      heart.scale.setScalar(1.4 * br + flash * 1.4);
      glow.scale.setScalar(6.2 * br + flash * 2);
      glow.material.opacity = 0.75 + flash * 0.25;
      solid.scale.setScalar(1 + flash * 0.25);
      shellM.opacity = 0.45 + flash * 0.5;
      for (let i = 0; i < SH; i++) {
        const k =
          1 +
          Math.sin(time * 0.02 + i * 0.37) * 0.035 +
          flash * 0.25 * Math.sin(i);
        shellPos[i * 3] = shellBase[i * 3] * k;
        shellPos[i * 3 + 1] = shellBase[i * 3 + 1] * k;
        shellPos[i * 3 + 2] = shellBase[i * 3 + 2] * k;
      }
      shellG.attributes.position.needsUpdate = true;
      shell.rotation.y += 0.0009 * dt * motion;

      // camera: parallax plus a small dolly on scroll
      camera.position.x += (mx * 0.9 - camera.position.x) * 0.04;
      camera.position.y += (-my * 0.6 - camera.position.y) * 0.04;
      camera.position.z = 10 - sp * 2.5;
      camera.lookAt(mobile ? 0 : 1.2, mobile ? 0.6 : 0, 0);

      // streams: quadratic bezier from each source, spiralling into the core
      core.getWorldPosition(corePos);
      world.worldToLocal(corePos);
      const sm = 1 + boost * 2.5;
      for (let i = 0; i < NP; i++) {
        const q = P[i];
        q.t += q.v * dt * sm * motion;
        if (q.t >= 1) q.t -= 1;
        const t = q.t;
        const s = SRC[q.s].p;
        const cx = (s.x + corePos.x) / 2;
        const cy = (s.y + corePos.y) / 2 + (q.s === 1 ? 2.5 : -2);
        const cz = (s.z + corePos.z) / 2 + 2;
        const u = 1 - t;
        let x =
          u * u * (s.x + q.j.x) +
          2 * u * t * (cx + q.j.x * 0.6) +
          t * t * corePos.x;
        let y =
          u * u * (s.y + q.j.y) +
          2 * u * t * (cy + q.j.y * 0.6) +
          t * t * corePos.y;
        let z =
          u * u * (s.z + q.j.z) +
          2 * u * t * (cz + q.j.z * 0.6) +
          t * t * corePos.z;
        const sw = Math.max(0, t - 0.55) / 0.45;
        const rad = (1 - t) * q.sw * 1.6 * sw;
        const ang = q.ph + t * 14;
        x += Math.cos(ang) * rad;
        y += Math.sin(ang) * rad * 0.7;
        z += Math.sin(ang) * rad;
        pp[i * 3] = x;
        pp[i * 3 + 1] = y;
        pp[i * 3 + 2] = z;
      }
      pg.attributes.position.needsUpdate = true;

      // satellites and their HTML labels
      const cD = core.getWorldPosition(coreWorld).distanceTo(camera.position);
      APPS.forEach((A, i) => {
        const r = rings[A.ring].r;
        const a = A.a + time * (0.0016 + i * 0.0003);
        A.obj.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        A.obj.getWorldPosition(tmp);
        core.worldToLocal(tmp2.copy(tmp));
        const la = A.line.geometry.attributes.position;
        la.setXYZ(1, tmp2.x, tmp2.y, tmp2.z);
        la.needsUpdate = true;
        A.pt = (A.pt + 0.006 * dt * sm) % 1;
        A.pkt.position.copy(tmp2).multiplyScalar(A.pt);
        const camD = tmp.distanceTo(camera.position);
        const v = tmp.project(camera);
        A.el.style.left = ((v.x + 1) / 2) * W + "px";
        A.el.style.top = ((1 - v.y) / 2) * H - 24 + "px";
        A.el.style.opacity = camD > cD + 0.6 ? 0.35 : 1;
        A.el.style.zIndex = camD > cD ? 1 : 3;
      });

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += 0.018 * dt;
        p.m.scale.setScalar(1 + p.t * 5);
        p.m.material.opacity = 0.9 * (1 - p.t);
        p.m.lookAt(camera.position);
        if (p.t >= 1) {
          core.remove(p.m);
          pulses.splice(i, 1);
        }
      }
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (!RM) setTimeout(pulse, 900);
}
