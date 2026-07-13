import * as THREE from 'three';

const canvas = document.querySelector('#chess-king-canvas');
const section = document.querySelector('.chess-section');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && section) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 1.45, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xd9f26c,
    transparent: true,
    opacity: 0.72,
    wireframe: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xbfff4a,
    transparent: true,
    opacity: 0.12,
    wireframe: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0xd9f26c,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const king = new THREE.Group();
  const profile = [
    [0.14, 0],
    [1.2, 0],
    [1.42, 0.08],
    [1.56, 0.22],
    [1.46, 0.38],
    [1.2, 0.5],
    [0.96, 0.58],
    [0.9, 0.76],
    [1.08, 0.94],
    [1.18, 1.16],
    [1.02, 1.38],
    [0.74, 1.54],
    [0.58, 2.08],
    [0.5, 2.74],
    [0.6, 3.16],
    [0.86, 3.36],
    [1.04, 3.5],
    [1.14, 3.72],
    [1.3, 3.86],
    [1.2, 4.02],
    [0.96, 4.08],
    [0.78, 4.0],
    [0.66, 3.82],
    [0.54, 3.96],
    [0.46, 4.22],
    [0.56, 4.42],
    [0.44, 4.6],
    [0.26, 4.72],
  ];
  const lathePoints = profile.map(([x, y]) => new THREE.Vector2(x, y));
  const bodyGeometry = new THREE.LatheGeometry(lathePoints, 88);
  const body = new THREE.Mesh(bodyGeometry, wireMaterial);
  king.add(body);

  const glowBody = new THREE.Mesh(bodyGeometry.clone(), glowMaterial);
  glowBody.scale.set(1.035, 1.01, 1.035);
  king.add(glowBody);

  const pointMaterial = new THREE.PointsMaterial({
    color: 0xf0ff9f,
    size: 0.05,
    transparent: true,
    opacity: 0.86,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const bodyPoints = new THREE.Points(bodyGeometry, pointMaterial);
  king.add(bodyPoints);

  const crossVerticalGeometry = new THREE.BoxGeometry(0.18, 0.7, 0.16, 2, 10, 2);
  const crossHorizontalGeometry = new THREE.BoxGeometry(0.64, 0.15, 0.16, 10, 2, 2);
  const crossVertical = new THREE.Mesh(crossVerticalGeometry, wireMaterial);
  crossVertical.position.y = 5.08;
  const crossHorizontal = new THREE.Mesh(crossHorizontalGeometry, wireMaterial);
  crossHorizontal.position.y = 5.2;
  king.add(crossVertical, crossHorizontal);

  const crossGlow = new THREE.Group();
  const crossVerticalGlow = new THREE.Mesh(crossVerticalGeometry.clone(), glowMaterial);
  crossVerticalGlow.position.copy(crossVertical.position);
  crossVerticalGlow.scale.set(1.18, 1.08, 1.18);
  const crossHorizontalGlow = new THREE.Mesh(crossHorizontalGeometry.clone(), glowMaterial);
  crossHorizontalGlow.position.copy(crossHorizontal.position);
  crossHorizontalGlow.scale.set(1.08, 1.18, 1.18);
  crossGlow.add(crossVerticalGlow, crossHorizontalGlow);
  king.add(crossGlow);

  const baseGlow = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.65, 0.06, 80), shadowMaterial);
  baseGlow.position.y = -0.04;
  king.add(baseGlow);

  king.position.set(-0.35, -1.65, 0);
  king.rotation.set(-0.08, -0.45, 0.08);
  king.scale.setScalar(0.92);
  scene.add(king);

  scene.add(new THREE.HemisphereLight(0xf0ffb0, 0x111310, 1.5));
  const keyLight = new THREE.DirectionalLight(0xf1ffad, 2.4);
  keyLight.position.set(-3, 5, 6);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0xd9f26c, 4.8, 12);
  rimLight.position.set(2.6, 1.8, 4.4);
  scene.add(rimLight);

  let targetRotation = king.rotation.y;
  let currentRotation = targetRotation;
  let targetTilt = king.rotation.z;
  let currentTilt = targetTilt;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const updateScrollPose = () => {
    const rect = section.getBoundingClientRect();
    const scrollSpan = window.innerHeight + rect.height;
    const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / scrollSpan));
    targetRotation = -0.95 + progress * 1.9;
    targetTilt = 0.16 - progress * 0.25;
  };

  const render = () => {
    if (!reduceMotion) {
      currentRotation += (targetRotation - currentRotation) * 0.075;
      currentTilt += (targetTilt - currentTilt) * 0.075;
      king.rotation.y = currentRotation;
      king.rotation.z = currentTilt;
      bodyPoints.rotation.y += 0.0018;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  resize();
  updateScrollPose();
  if (!reduceMotion) {
    window.addEventListener('scroll', updateScrollPose, { passive: true });
  }
  window.addEventListener('resize', () => {
    resize();
    updateScrollPose();
  });
  render();
}
