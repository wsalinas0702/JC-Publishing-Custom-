(() => {
  const canvas = document.getElementById("bg");
  
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: false,
      stencil: false,
      depth: true
    });
  } catch (e) {
    console.error("WebGL initialization failed:", e);
    canvas.style.display = "none";
    document.body.style.background = "radial-gradient(1100px 700px at 75% 55%, rgba(124, 58, 237, 0.28), transparent 60%), radial-gradient(900px 650px at 40% 55%, rgba(34, 197, 94, 0.18), transparent 62%), radial-gradient(1200px 900px at 30% 30%, rgba(17, 24, 39, 0.65), rgba(0,0,0,1) 70%), radial-gradient(1400px 1000px at 60% 70%, rgba(0,0,0,0.85), rgba(0,0,0,1) 75%)";
    return;
  }
  
  if (!renderer) {
    console.error("Renderer is null");
    canvas.style.display = "none";
    document.body.style.background = "radial-gradient(1100px 700px at 75% 55%, rgba(124, 58, 237, 0.28), transparent 60%), radial-gradient(900px 650px at 40% 55%, rgba(34, 197, 94, 0.18), transparent 62%), radial-gradient(1200px 900px at 30% 30%, rgba(17, 24, 39, 0.65), rgba(0,0,0,1) 70%), radial-gradient(1400px 1000px at 60% 70%, rgba(0,0,0,0.85), rgba(0,0,0,1) 75%)";
    return;
  }
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x05040a, 1);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
  camera.position.z = 140;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const STAR_COUNT = reduceMotion ? 800 : (isMobile ? 1200 : 5200);

  const starGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(STAR_COUNT * 3);

  for (let i = 0; i < STAR_COUNT; i++) {
    const i3 = i * 3;
    positions[i3 + 0] = (Math.random() - 0.5) * 900;
    positions[i3 + 1] = (Math.random() - 0.5) * 600;
    positions[i3 + 2] = (Math.random() - 0.5) * 900;
  }

  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  function makeStarTexture() {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");

    const r = size / 2;
    const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0.0, "rgba(255,255,255,1)");
    grad.addColorStop(0.2, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.45, "rgba(255,255,255,0.35)");
    grad.addColorStop(1.0, "rgba(255,255,255,0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  }

  const starTexture = makeStarTexture();

  const starMat = new THREE.PointsMaterial({
    map: starTexture,
    color: 0xffffff,
    size: 1.6,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  const glowGroup = new THREE.Group();
  scene.add(glowGroup);

  function addGlowPlane({ x, y, z, w, h, color, opacity, rotZ = 0 }) {
    const geom = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rotZ;
    glowGroup.add(mesh);
  }

  addGlowPlane({
    x: 140, y: -10, z: -260,
    w: 1100, h: 700,
    color: 0x7c3aed, // purple
    opacity: 0.06,
    rotZ: 0.22
  });

  addGlowPlane({
    x: -120, y: 40, z: -340,
    w: 1200, h: 800,
    color: 0x22c55e, // green
    opacity: 0.045,
    rotZ: -0.18
  });

  scene.fog = new THREE.FogExp2(0x05040a, 0.0012);

  let targetX = 0, targetY = 0;
  const onPointerMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    targetX = x;
    targetY = y;
  };

  window.addEventListener("mousemove", onPointerMove, { passive: true });
  window.addEventListener("touchmove", (e) => {
    if (!e.touches?.[0]) return;
    onPointerMove(e.touches[0]);
  }, { passive: true });

  function resize() {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    canvas.style.display = "block";
  }
  window.addEventListener("resize", resize);
  resize();

  let last = performance.now();
  function animate(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    camera.position.x += ((targetX * 10) - camera.position.x) * 0.05;
    camera.position.y += ((-targetY * 6) - camera.position.y) * 0.05;

    if (!reduceMotion) {
      stars.rotation.y += dt * 0.03;
      stars.rotation.x += dt * 0.01;
      glowGroup.rotation.z += dt * 0.008;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
