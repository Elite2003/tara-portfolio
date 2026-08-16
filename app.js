let THREE;

bootPortfolio();

async function bootPortfolio() {
  try {
    THREE = await import('three');
    initPortfolio();
  } catch (error) {
    renderFallback();
    console.warn('3D engine could not load, showing fallback world.', error);
  }
}

function initPortfolio() {

const zones = {
  who: {
    label: 'Who am I',
    title: 'I am Tara.',
    color: 0x5ee7ff,
    position: [-5.5, 0, -3.8],
    copy: 'A curious developer and builder who enjoys turning ideas into interactive, human-friendly digital experiences.',
    details: [
      'I think like a player: every screen should give people a clear goal, satisfying feedback, and a reason to keep exploring.',
      'I build with structure, polish, and a love for small details that make an interface feel alive.',
      'This portfolio is framed as a world because my best work sits where creativity and engineering meet.'
    ],
    tags: ['Developer', 'Designer mindset', 'Game thinking', 'Storytelling']
  },
  projects: {
    label: 'Projects',
    title: 'Playable work, useful systems.',
    color: 0xffd166,
    position: [4.8, 0, -4.2],
    copy: 'A project zone for apps, prototypes, games, and experiments that turn concepts into working products.',
    details: [
      '3D Portfolio World: an interactive personal site with movement, stations, panels, and a guided tour.',
      'Focus Experience: a calm productivity app with animated environments, timers, and progress tracking.',
      'Game UI Concepts: menus, dashboards, and interaction loops designed for fast scanning and quick action.'
    ],
    tags: ['Web apps', 'Game UI', 'Interactive design', 'Prototypes']
  },
  skills: {
    label: 'Skills',
    title: 'Tools for building worlds.',
    color: 0xc6f86d,
    position: [-4.6, 0, 4.7],
    copy: 'Frontend craft, creative coding, visual systems, and product thinking working together.',
    details: [
      'Frontend: HTML, CSS, JavaScript, responsive layouts, accessible controls, and polished interface states.',
      'Creative Tech: Three.js, Canvas, animation, spatial interaction, and lightweight game mechanics.',
      'Product Craft: clear information architecture, user flows, prototyping, and presentation of ideas.'
    ],
    tags: ['JavaScript', 'Three.js', 'CSS', 'UX', 'Prototyping']
  },
  idea: {
    label: 'The Idea',
    title: 'A portfolio you can explore.',
    color: 0xff7a9f,
    position: [5.6, 0, 4.4],
    copy: 'Instead of a flat resume, this world makes the viewer move through identity, proof, capability, and direction.',
    details: [
      'The central avatar represents the maker. Each glowing station is a chapter of the story.',
      'The space is intentionally compact: quick to understand, playful to use, and easy to customize with real project links.',
      'The concept can grow into collectible badges, mini project demos, portals, audio, achievements, or a resume download.'
    ],
    tags: ['Portfolio as game', 'Personal brand', 'Exploration', 'Immersion']
  },
  connect: {
    label: "Let's connect",
    title: "Let's build the next scene.",
    color: 0xbba8ff,
    position: [0, 0, 6.4],
    copy: 'A contact station for collaboration, opportunities, mentorship, and creative conversations.',
    details: [
      'Email: tara@example.com',
      'LinkedIn: linkedin.com/in/tara',
      'GitHub: github.com/tara'
    ],
    tags: ['Open to collaborate', 'Internships', 'Projects', 'Creative tech']
  }
};

const canvas = document.querySelector('#world');
const heroPanel = document.querySelector('#heroPanel');
const zoneLabel = document.querySelector('#zoneLabel');
const zoneTitle = document.querySelector('#zoneTitle');
const zoneCopy = document.querySelector('#zoneCopy');
const detailPanel = document.querySelector('#detailPanel');
const detailKicker = document.querySelector('#detailKicker');
const detailTitle = document.querySelector('#detailTitle');
const detailBody = document.querySelector('#detailBody');
const statusText = document.querySelector('#statusText');
const enterZone = document.querySelector('#enterZone');
const autoTour = document.querySelector('#autoTour');
const navButtons = [...document.querySelectorAll('[data-zone-link]')];
const movementButtons = [...document.querySelectorAll('[data-move]')];

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x10131a, 10, 30);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 8.5, 10);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;

const world = new THREE.Group();
scene.add(world);

const keys = new Set();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();
const stationMeshes = [];
const player = new THREE.Group();
let activeZone = 'who';
let targetPosition = null;
let touring = false;
let tourIndex = 0;
let tourTimer = 0;

buildLights();
buildArena();
buildStations();
buildPlayer();
updateZone('who', false);
animate();

function buildLights() {
  scene.add(new THREE.HemisphereLight(0xaedcff, 0x151923, 2.8));

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const rim = new THREE.PointLight(0xff7a9f, 70, 22);
  rim.position.set(-6, 4, 4);
  scene.add(rim);
}

function buildArena() {
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(9.2, 9.2, 0.34, 8),
    new THREE.MeshStandardMaterial({ color: 0x1b202b, roughness: 0.72, metalness: 0.12 })
  );
  floor.receiveShadow = true;
  floor.rotation.y = Math.PI / 8;
  floor.position.y = -0.2;
  world.add(floor);

  const grid = new THREE.GridHelper(18, 18, 0x5ee7ff, 0x2a3343);
  grid.position.y = 0.02;
  grid.material.transparent = true;
  grid.material.opacity = 0.36;
  world.add(grid);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 1),
    new THREE.MeshStandardMaterial({
      color: 0x242b36,
      emissive: 0x142a35,
      roughness: 0.42,
      metalness: 0.36
    })
  );
  core.position.y = 1.05;
  core.castShadow = true;
  core.name = 'core';
  world.add(core);

  for (let i = 0; i < 56; i++) {
    const star = new THREE.Mesh(
      new THREE.SphereGeometry(Math.random() * 0.045 + 0.018, 8, 8),
      new THREE.MeshBasicMaterial({ color: i % 5 === 0 ? 0xffd166 : 0x9fb4cb })
    );
    const angle = Math.random() * Math.PI * 2;
    const radius = 13 + Math.random() * 12;
    star.position.set(Math.cos(angle) * radius, Math.random() * 8 + 1, Math.sin(angle) * radius);
    star.userData.float = Math.random() * Math.PI * 2;
    world.add(star);
  }
}

function buildStations() {
  Object.entries(zones).forEach(([id, zone], index) => {
    const station = new THREE.Group();
    station.position.set(...zone.position);
    station.userData.zone = id;

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.035, 12, 60),
      new THREE.MeshBasicMaterial({ color: zone.color })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.05;
    station.add(ring);

    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.62, 1.7, 6),
      new THREE.MeshStandardMaterial({
        color: 0x252c38,
        emissive: zone.color,
        emissiveIntensity: 0.35,
        roughness: 0.44,
        metalness: 0.3
      })
    );
    beacon.position.y = 0.85;
    beacon.castShadow = true;
    station.add(beacon);

    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.44, 0),
      new THREE.MeshStandardMaterial({
        color: zone.color,
        emissive: zone.color,
        emissiveIntensity: 1.2,
        roughness: 0.2,
        metalness: 0.15
      })
    );
    crystal.position.y = 2.05;
    crystal.userData.spin = 0.8 + index * 0.1;
    station.add(crystal);

    const light = new THREE.PointLight(zone.color, 22, 7);
    light.position.y = 2.1;
    station.add(light);

    station.traverse(child => {
      if (child.isMesh) {
        child.userData.zone = id;
        stationMeshes.push(child);
      }
    });

    world.add(station);
  });
}

function buildPlayer() {
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.28, 0.72, 6, 12),
    new THREE.MeshStandardMaterial({ color: 0xf4f7fb, roughness: 0.35, metalness: 0.08 })
  );
  body.position.y = 0.72;
  body.castShadow = true;
  player.add(body);

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.12, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x5ee7ff })
  );
  visor.position.set(0, 0.93, -0.23);
  player.add(visor);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.24 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.025;
  player.add(shadow);

  scene.add(player);
}

function updateZone(id, openDetails = false) {
  activeZone = id;
  const zone = zones[id];
  zoneLabel.textContent = zone.label;
  zoneTitle.textContent = zone.title;
  zoneCopy.textContent = zone.copy;
  statusText.textContent = `${zone.label} station selected.`;

  navButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.zoneLink === id);
  });

  if (openDetails) showDetails(id);
}

function showDetails(id) {
  const zone = zones[id];
  detailKicker.textContent = zone.label;
  detailTitle.textContent = zone.title;
  detailBody.innerHTML = `
    <p>${zone.copy}</p>
    <ul>${zone.details.map(item => `<li>${item}</li>`).join('')}</ul>
    <div class="tag-row">${zone.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
  `;
  detailPanel.classList.add('open');
}

function moveTowardZone(id) {
  const [x, , z] = zones[id].position;
  targetPosition = new THREE.Vector3(x * 0.72, 0, z * 0.72);
  updateZone(id);
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.04);
  const elapsed = clock.elapsedTime;
  movePlayer(delta);
  animateObjects(elapsed, delta);
  updateCamera();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function movePlayer(delta) {
  const speed = 4.2;
  const direction = new THREE.Vector3();

  if (keys.has('w') || keys.has('arrowup')) direction.z -= 1;
  if (keys.has('s') || keys.has('arrowdown')) direction.z += 1;
  if (keys.has('a') || keys.has('arrowleft')) direction.x -= 1;
  if (keys.has('d') || keys.has('arrowright')) direction.x += 1;

  if (direction.lengthSq()) {
    targetPosition = null;
    direction.normalize();
    player.position.addScaledVector(direction, speed * delta);
  } else if (targetPosition) {
    const toTarget = targetPosition.clone().sub(player.position);
    if (toTarget.length() < 0.08) targetPosition = null;
    else player.position.addScaledVector(toTarget.normalize(), speed * delta);
  }

  const distance = Math.hypot(player.position.x, player.position.z);
  if (distance > 7.4) player.position.multiplyScalar(7.4 / distance);

  player.rotation.y = Math.atan2(direction.x || player.position.x * 0.02, direction.z || player.position.z * 0.02);

  let nearest = activeZone;
  let nearestDistance = Infinity;
  Object.entries(zones).forEach(([id, zone]) => {
    const d = Math.hypot(player.position.x - zone.position[0], player.position.z - zone.position[2]);
    if (d < nearestDistance) {
      nearestDistance = d;
      nearest = id;
    }
  });

  if (nearestDistance < 3.2 && nearest !== activeZone) updateZone(nearest);
  if (nearestDistance < 1.6) statusText.textContent = `Press Enter or tap Enter station to open ${zones[nearest].label}.`;
}

function animateObjects(elapsed, delta) {
  world.children.forEach(object => {
    object.traverse?.(child => {
      if (child.geometry?.type === 'OctahedronGeometry') {
        child.rotation.y += 0.018 * child.userData.spin;
        child.position.y = 2.05 + Math.sin(elapsed * 2 + child.userData.spin) * 0.12;
      }
      if (child.name === 'core') {
        child.rotation.x += 0.006;
        child.rotation.y += 0.009;
      }
      if (child.geometry?.type === 'SphereGeometry') {
        child.position.y += Math.sin(elapsed + child.userData.float) * 0.0008;
      }
    });
  });

  if (touring) {
    tourTimer -= delta;
    if (tourTimer <= 0) {
      const ids = Object.keys(zones);
      moveTowardZone(ids[tourIndex % ids.length]);
      tourIndex += 1;
      tourTimer = 4.3;
    }
  }
}

function updateCamera() {
  const mobile = innerWidth < 720;
  const cameraTarget = new THREE.Vector3(player.position.x * 0.45, mobile ? 7.5 : 8.5, player.position.z + (mobile ? 9.5 : 10.5));
  camera.position.lerp(cameraTarget, 0.06);
  camera.lookAt(player.position.x * 0.35, 0.4, player.position.z - 1.4);
}

window.addEventListener('keydown', event => {
  keys.add(event.key.toLowerCase());
  if (event.key === 'Enter') showDetails(activeZone);
  if (event.key === 'Escape') detailPanel.classList.remove('open');
});

window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));

canvas.addEventListener('pointerdown', event => {
  pointer.x = (event.clientX / innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(stationMeshes)[0];
  if (hit?.object.userData.zone) {
    moveTowardZone(hit.object.userData.zone);
    showDetails(hit.object.userData.zone);
  }
});

navButtons.forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();
    moveTowardZone(button.dataset.zoneLink);
    if (button.tagName === 'BUTTON') showDetails(button.dataset.zoneLink);
  });
});

enterZone.addEventListener('click', () => showDetails(activeZone));
document.querySelector('#closeDetail').addEventListener('click', () => detailPanel.classList.remove('open'));

autoTour.addEventListener('click', () => {
  touring = !touring;
  autoTour.textContent = touring ? 'Ⅱ' : '▶';
  autoTour.setAttribute('aria-label', touring ? 'Pause auto tour' : 'Start auto tour');
  tourTimer = 0;
});

movementButtons.forEach(button => {
  const keyMap = { up: 'w', down: 's', left: 'a', right: 'd' };
  const key = keyMap[button.dataset.move];
  button.addEventListener('pointerdown', () => keys.add(key));
  button.addEventListener('pointerup', () => keys.delete(key));
  button.addEventListener('pointerleave', () => keys.delete(key));
});

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});
}

function renderFallback() {
  const fallback = document.createElement('div');
  fallback.className = 'fallback-world';
  fallback.setAttribute('aria-hidden', 'true');
  document.querySelector('.portfolio-game').prepend(fallback);

  document.querySelector('#statusText').textContent = '3D mode is unavailable here, but the portfolio stations are ready.';
  document.querySelector('#enterZone').addEventListener('click', () => {
    document.querySelector('#detailPanel').classList.add('open');
  });
  document.querySelector('#closeDetail').addEventListener('click', () => {
    document.querySelector('#detailPanel').classList.remove('open');
  });

  const fallbackDetails = {
    who: ['A curious developer and builder turning ideas into interactive, human-friendly digital experiences.'],
    projects: ['3D Portfolio World', 'Focus Experience', 'Game UI Concepts'],
    skills: ['JavaScript', 'Three.js', 'CSS', 'UX', 'Prototyping'],
    idea: ['A portfolio structured as a small explorable game world.'],
    connect: ['Email: tara@example.com', 'LinkedIn: linkedin.com/in/tara', 'GitHub: github.com/tara']
  };

  document.querySelector('#detailBody').innerHTML = `<ul>${fallbackDetails.who.map(item => `<li>${item}</li>`).join('')}</ul>`;

  document.querySelectorAll('[data-zone-link]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      const id = button.dataset.zoneLink;
      document.querySelectorAll('[data-zone-link]').forEach(item => item.classList.toggle('active', item.dataset.zoneLink === id));
      document.querySelector('#zoneLabel').textContent = button.textContent;
      document.querySelector('#zoneTitle').textContent = id === 'connect' ? "Let's build the next scene." : button.textContent;
      document.querySelector('#zoneCopy').textContent = fallbackDetails[id][0];
      document.querySelector('#detailTitle').textContent = button.textContent;
      document.querySelector('#detailBody').innerHTML = `<ul>${fallbackDetails[id].map(item => `<li>${item}</li>`).join('')}</ul>`;
      document.querySelector('#detailPanel').classList.add('open');
    });
  });
}
