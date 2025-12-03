import * as THREE from 'three';

export const generateSpiralPoints = (turns: number, height: number, pointsPerTurn: number, radiusMax: number) => {
  const points: THREE.Vector3[] = [];
  const totalPoints = turns * pointsPerTurn;
  
  for (let i = 0; i < totalPoints; i++) {
    const t = i / totalPoints;
    const angle = t * turns * Math.PI * 2;
    const radius = (t * radiusMax); // Archimedean
    
    // We want the spiral to start at the bottom and go up to the box
    // Assuming box is at (0, 0, 0), spiral comes from below or around
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (t * height) - (height / 2);

    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
};

export const randomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};
