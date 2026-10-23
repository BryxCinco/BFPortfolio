import * as THREE from 'three';

// ============================================================================
// STACK3D.JS — the 3D engine behind the Stack Game, loaded only when the game
// opens. An isometric tower in the spirit of the classic mobile "Stack": each
// new block slides in along x, then z, then x again; dropping it chops off the
// overhang, which tumbles away. Every block wears its technology: logo and
// name on the two faces the camera sees, a big logo on top. A run of perfect
// drops grows the block back a little. The camera climbs with the tower and
// pulls back to show the whole thing when the game ends.
//
// The React side (PlayGame.jsx) owns scoring and UI; this module only reports
// what happened on each drop.
// ============================================================================

const SIZE = 3; // base footprint, world units
const H = 0.6; // block height
const RANGE = 4.6; // how far the moving block slides from the tower's centre
const PERFECT = 0.14; // offsets smaller than this snap into place
const GROW_AFTER = 4; // perfect drops in a row before the block grows back
const GROW = 0.2;
const SPEED0 = 2.8; // units per second
const SPEED_STEP = 0.07;
const SPEED_MAX = 7.5;
const GRAVITY = 20;
const PX = 128; // texture pixels per world unit

const PEDESTAL_H = 8;
const CAM_DIR = new THREE.Vector3(1, 0.95, 1).normalize();
const VIEW_H = 5.6; // half the visible height while playing
const MIN_HALF_W = 4.9; // keep the slide range in frame on tall screens

// ---------------------------------------------------------------------------
// logos: loaded once (CORS-enabled CDN), drawn into canvas textures
// ---------------------------------------------------------------------------

const images = new Map(); // src -> HTMLImageElement | null
const pending = new Map(); // src -> Promise

function loadImage(src) {
  if (images.has(src)) return Promise.resolve(images.get(src));
  if (!pending.has(src)) {
    pending.set(
      src,
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.onload = () => {
          images.set(src, img);
          resolve(img);
        };
        img.onerror = () => {
          images.set(src, null);
          resolve(null);
        };
        img.src = src;
      })
    );
  }
  return pending.get(src);
}

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (hex, toHex, t) => {
  const a = hexToRgb(hex);
  const b = hexToRgb(toHex);
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
};

// white disc with the logo inside, like an app sticker
function drawChip(ctx, img, cx, cy, r) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = r * 0.35;
  ctx.shadowOffsetY = r * 0.12;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (!img) return;
  const iw = img.naturalWidth || 1;
  const ih = img.naturalHeight || 1;
  const box = r * 1.25;
  const k = Math.min(box / iw, box / ih);
  const w = iw * k;
  const h = ih * k;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}

function paintSide(canvas, tech, len) {
  const w = Math.max(8, Math.round(len * PX));
  const h = Math.round(H * PX);
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, mix(tech.bg, '#FFFFFF', 0.16));
  g.addColorStop(0.55, tech.bg);
  g.addColorStop(1, mix(tech.bg, '#000000', 0.2));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.fillRect(0, 0, w, 2);

  const img = images.get(tech.logo);
  const r = h * 0.3;
  const pad = h * 0.22;
  ctx.font = `800 ${Math.round(h * 0.3)}px Montserrat, "Segoe UI", system-ui, sans-serif`;
  const textW = ctx.measureText(tech.name).width;
  const withText = pad + r * 2 + h * 0.16 + textW + pad <= w;
  if (withText) {
    const total = r * 2 + h * 0.16 + textW;
    const x0 = (w - total) / 2;
    drawChip(ctx, img, x0 + r, h / 2, r);
    ctx.fillStyle = tech.fg;
    ctx.textBaseline = 'middle';
    ctx.fillText(tech.name, x0 + r * 2 + h * 0.16, h / 2 + 1);
  } else if (w > r * 2 + 6) {
    drawChip(ctx, img, w / 2, h / 2, r);
  }
}

function paintTop(canvas, tech, wU, dU) {
  const scale = PX * 0.75;
  const w = Math.max(8, Math.round(wU * scale));
  const d = Math.max(8, Math.round(dU * scale));
  canvas.width = w;
  canvas.height = d;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, w, d);
  g.addColorStop(0, mix(tech.bg, '#FFFFFF', 0.22));
  g.addColorStop(1, mix(tech.bg, '#FFFFFF', 0.06));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, d);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, w - 3, d - 3);
  const m = Math.min(w, d);
  if (m >= scale * 0.7) drawChip(ctx, images.get(tech.logo), w / 2, d / 2, m * 0.22);
}

// ---------------------------------------------------------------------------
// the engine
// ---------------------------------------------------------------------------

export function createStack3D(host, { techs, dark = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  host.appendChild(renderer.domElement);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x3a3a55, 1.15);
  const sun = new THREE.DirectionalLight(0xffffff, 1.55);
  sun.position.set(4, 10, 7);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  fill.position.set(-6, 3, -2);
  scene.add(hemi, sun, fill);

  const world = new THREE.Group();
  scene.add(world);

  // shared frame texture for the "perfect" flash
  const flashCanvas = document.createElement('canvas');
  flashCanvas.width = flashCanvas.height = 256;
  {
    const c = flashCanvas.getContext('2d');
    c.strokeStyle = '#FFFFFF';
    c.lineWidth = 14;
    c.strokeRect(10, 10, 236, 236);
  }
  const flashTex = new THREE.CanvasTexture(flashCanvas);

  let blocks = []; // { mesh, x, z, w, d, y, techIdx }
  let moving = null; // { mesh, axis, pos, dir, speed, techIdx, w, d, y }
  let debris = []; // { mesh, v, spin, life }
  let flashes = []; // { mesh, t }
  let combo = 0;
  let offset = 0;
  let speed = SPEED0;
  let over = false;
  const cam = { x: 0, y: 1, z: 0, viewH: VIEW_H };
  const camTo = { x: 0, y: 1, z: 0, viewH: VIEW_H };
  let width = 1;
  let height = 1;
  let raf = 0;
  let last = 0;
  let disposed = false;

  function texture(canvas) {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return t;
  }

  function pedestalColors() {
    return dark ? { side: '#22223A', top: '#2EE6A8' } : { side: '#E6E1D6', top: '#007A59' };
  }

  // a block wearing `tech`; geometry is rebuilt per size so textures stay crisp
  function makeBlock(tech, w, d, h = H) {
    const geo = new THREE.BoxGeometry(w, h, d);
    if (!tech) {
      const c = pedestalColors();
      const side = new THREE.MeshStandardMaterial({ color: c.side, roughness: 0.8 });
      const top = new THREE.MeshStandardMaterial({ color: c.top, roughness: 0.5 });
      const mesh = new THREE.Mesh(geo, [side, side, top, side, side, side]);
      mesh.userData.pedestal = true;
      return mesh;
    }
    const sideX = document.createElement('canvas'); // the +x face spans the depth
    const sideZ = document.createElement('canvas'); // the +z face spans the width
    const topC = document.createElement('canvas');
    const paint = () => {
      paintSide(sideX, tech, d);
      paintSide(sideZ, tech, w);
      paintTop(topC, tech, w, d);
    };
    paint();
    const plain = new THREE.MeshStandardMaterial({ color: mix(tech.bg, '#000000', 0.15), roughness: 0.6 });
    const mat = (c) => new THREE.MeshStandardMaterial({ map: texture(c), roughness: 0.5, metalness: 0.04 });
    const mats = [mat(sideX), plain, mat(topC), plain, mat(sideZ), plain];
    const mesh = new THREE.Mesh(geo, mats);
    mesh.userData.repaint = () => {
      paint();
      [0, 2, 4].forEach((i) => {
        mats[i].map.needsUpdate = true;
      });
    };
    mesh.userData.logo = tech.logo;
    if (!images.has(tech.logo)) {
      loadImage(tech.logo).then(() => {
        if (!disposed && mesh.parent) mesh.userData.repaint();
      });
    }
    return mesh;
  }

  function disposeMesh(mesh) {
    mesh.parent?.remove(mesh);
    mesh.geometry.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    new Set(mats).forEach((m) => {
      if (m.map && m.map !== flashTex) m.map.dispose();
      m.dispose();
    });
  }

  function clearAll() {
    [...blocks.map((b) => b.mesh), ...debris.map((d) => d.mesh), ...flashes.map((f) => f.mesh)].forEach(disposeMesh);
    if (moving) disposeMesh(moving.mesh);
    blocks = [];
    debris = [];
    flashes = [];
    moving = null;
  }

  function topY() {
    return (blocks.length - 1) * H;
  }

  function reset() {
    clearAll();
    combo = 0;
    speed = SPEED0;
    over = false;
    offset = Math.floor(Math.random() * techs.length);
    const ped = makeBlock(null, SIZE, SIZE, PEDESTAL_H);
    ped.position.set(0, -PEDESTAL_H / 2, 0);
    world.add(ped);
    blocks.push({ mesh: ped, x: 0, z: 0, w: SIZE, d: SIZE, y: 0, techIdx: null });
    Object.assign(camTo, { x: 0, y: 1, z: 0, viewH: VIEW_H });
    Object.assign(cam, camTo);
  }

  function spawn() {
    const top = blocks[blocks.length - 1];
    const i = blocks.length; // index of the block being placed
    const axis = i % 2 ? 'x' : 'z';
    const techIdx = (offset + i - 1) % techs.length;
    const mesh = makeBlock(techs[techIdx], top.w, top.d);
    const y = (i - 0.5) * H;
    const pos = top[axis] - RANGE;
    mesh.position.set(axis === 'x' ? pos : top.x, y, axis === 'z' ? pos : top.z);
    world.add(mesh);
    moving = { mesh, axis, pos, dir: 1, speed, techIdx, w: top.w, d: top.d, y };
  }

  function addDebris(tech, w, d, x, y, z, axis, sign) {
    const mesh = makeBlock(tech, w, d);
    mesh.position.set(x, y, z);
    world.add(mesh);
    const v = new THREE.Vector3(axis === 'x' ? sign * 1.6 : 0, 1.2, axis === 'z' ? sign * 1.6 : 0);
    // tip over away from the tower
    const spin = new THREE.Vector3(axis === 'z' ? sign * 2.4 : 0, 0, axis === 'x' ? -sign * 2.4 : 0);
    debris.push({ mesh, v, spin, life: 0 });
  }

  function flash(b) {
    const geo = new THREE.PlaneGeometry(b.w + 0.12, b.d + 0.12);
    const mat = new THREE.MeshBasicMaterial({ map: flashTex, transparent: true, opacity: 0.9, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(b.x, b.y + H / 2 + 0.01, b.z);
    world.add(mesh);
    flashes.push({ mesh, t: 0 });
  }

  // drop the moving block; reports what happened
  function drop() {
    if (!moving || over) return null;
    const top = blocks[blocks.length - 1];
    const m = moving;
    const { axis } = m;
    const size = axis === 'x' ? top.w : top.d;
    const delta = m.pos - top[axis];
    const overhang = Math.abs(delta);
    const tech = techs[m.techIdx];

    if (overhang >= size) {
      // missed completely: the whole block falls
      const { x, y, z } = m.mesh.position;
      disposeMesh(m.mesh);
      moving = null;
      addDebris(tech, m.w, m.d, x, y, z, axis, Math.sign(delta) || 1);
      over = true;
      // pull back so the whole tower fits in the upper half (the score card covers the lower half)
      const h = topY();
      const viewH = Math.max(VIEW_H, h * 0.85 + 3);
      Object.assign(camTo, { x: top.x, z: top.z, y: h * 0.5 - (viewH * 0.5) / 0.82, viewH });
      return { type: 'miss', height: blocks.length - 1 };
    }

    const perfect = overhang < PERFECT;
    let w = m.w;
    let d = m.d;
    let center = top[axis];
    if (perfect) {
      combo += 1;
      if (combo >= GROW_AFTER) {
        if (axis === 'x') w = Math.min(SIZE, w + GROW);
        else d = Math.min(SIZE, d + GROW);
      }
    } else {
      combo = 0;
      const kept = size - overhang;
      center = top[axis] + delta / 2;
      if (axis === 'x') w = kept;
      else d = kept;
      const sign = Math.sign(delta);
      const cut = center + sign * (kept / 2 + overhang / 2);
      addDebris(
        tech,
        axis === 'x' ? overhang : m.w,
        axis === 'z' ? overhang : m.d,
        axis === 'x' ? cut : top.x,
        m.y,
        axis === 'z' ? cut : top.z,
        axis,
        sign
      );
    }

    disposeMesh(m.mesh);
    const mesh = makeBlock(tech, w, d);
    const x = axis === 'x' ? center : top.x;
    const z = axis === 'z' ? center : top.z;
    mesh.position.set(x, m.y, z);
    world.add(mesh);
    const placed = { mesh, x, z, w, d, y: m.y, techIdx: m.techIdx, land: 0 };
    blocks.push(placed);
    if (perfect) flash(placed);

    speed = Math.min(SPEED_MAX, speed + SPEED_STEP);
    Object.assign(camTo, { x, z, y: topY() + 1, viewH: VIEW_H });
    moving = null;
    spawn();
    return { type: 'place', perfect, techIdx: m.techIdx, height: blocks.length - 1, grew: perfect && combo >= GROW_AFTER };
  }

  function start() {
    if (!moving && !over) spawn();
  }

  function frame() {
    const aspect = width / height;
    let halfH = cam.viewH;
    let halfW = halfH * aspect;
    if (halfW < MIN_HALF_W) {
      halfW = MIN_HALF_W;
      halfH = halfW / aspect;
    }
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH;
    camera.bottom = -halfH;
    camera.updateProjectionMatrix();
    const target = new THREE.Vector3(cam.x, cam.y, cam.z);
    camera.position.copy(target).addScaledVector(CAM_DIR, 40);
    camera.lookAt(target);
  }

  function tick(ts) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((ts - (last || ts)) / 1000, 0.05);
    last = ts;

    if (moving) {
      const top = blocks[blocks.length - 1];
      moving.pos += moving.dir * moving.speed * dt;
      const off = moving.pos - top[moving.axis];
      if (off > RANGE) {
        moving.pos = top[moving.axis] + RANGE;
        moving.dir = -1;
      } else if (off < -RANGE) {
        moving.pos = top[moving.axis] - RANGE;
        moving.dir = 1;
      }
      moving.mesh.position[moving.axis] = moving.pos;
    }

    // a little squash when a block lands
    const lastBlock = blocks[blocks.length - 1];
    if (lastBlock && lastBlock.land !== undefined && lastBlock.land < 1) {
      lastBlock.land = Math.min(1, lastBlock.land + dt * 5);
      const s = 1 - Math.sin(lastBlock.land * Math.PI) * 0.12;
      lastBlock.mesh.scale.set(1 + (1 - s) * 0.3, s, 1 + (1 - s) * 0.3);
    }

    debris = debris.filter((p) => {
      p.life += dt;
      p.v.y -= GRAVITY * dt;
      p.mesh.position.addScaledVector(p.v, dt);
      p.mesh.rotation.x += p.spin.x * dt;
      p.mesh.rotation.z += p.spin.z * dt;
      if (p.life > 2.6) {
        disposeMesh(p.mesh);
        return false;
      }
      return true;
    });

    flashes = flashes.filter((f) => {
      f.t += dt / 0.55;
      const s = 1 + f.t * 0.35;
      f.mesh.scale.set(s, s, 1);
      f.mesh.material.opacity = 0.9 * (1 - f.t);
      if (f.t >= 1) {
        disposeMesh(f.mesh);
        return false;
      }
      return true;
    });

    const k = 1 - Math.pow(0.0025, dt); // smooth follow, frame-rate independent
    cam.x += (camTo.x - cam.x) * k;
    cam.y += (camTo.y - cam.y) * k;
    cam.z += (camTo.z - cam.z) * k;
    cam.viewH += (camTo.viewH - cam.viewH) * k;
    frame();
    renderer.render(scene, camera);
  }

  function resize() {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    frame();
  }

  function setDark(next) {
    dark = next;
    hemi.groundColor.set(dark ? 0x3a3a55 : 0x8a8478);
    const ped = blocks[0]?.mesh;
    if (ped) {
      const c = pedestalColors();
      ped.material[0].color.set(c.side);
      ped.material[2].color.set(c.top);
    }
  }

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  ro?.observe(host);
  window.addEventListener('resize', resize);

  // warm every logo so blocks rarely paint without one
  techs.forEach((t) => loadImage(t.logo));

  setDark(dark);
  reset();
  resize();
  raf = requestAnimationFrame(tick);

  return {
    start,
    drop,
    reset,
    setDark,
    // how far the moving block sits from the block below (used by tests)
    peek: () => (moving ? moving.pos - blocks[blocks.length - 1][moving.axis] : null),
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener('resize', resize);
      clearAll();
      flashTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
