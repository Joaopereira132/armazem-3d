'use strict';

import * as THREE from 'three';
import { Estante } from './Estante.js';

export class Warehouse extends THREE.Object3D {
  constructor(larguraEstante, alturaEstante, profundidadeEstante, larguraCaixa, alturaCaixa, profundidadeCaixa) {
    super();

    const espacamentoEntreEstantes = larguraEstante + 50; // espaço entre estantes

    // Criar 3 estantes lado a lado
    const shelfOffsetX = larguraEstante / 2;
    const shelfOffsetZ = -200; // same offset as wall Z offset
    for (let i = 0; i < 3; i++) {
      const estante = new Estante(
        larguraEstante,
        alturaEstante,
        profundidadeEstante,
        larguraCaixa,
        alturaCaixa,
        profundidadeCaixa
      );
      estante.position.set(shelfOffsetX + i * espacamentoEntreEstantes, 0, shelfOffsetZ);
      estante.rotation.y = Math.PI / 2; // rotate 90 degrees to make shelves parallel
      this.add(estante);
    }

    // Adicionar chão do armazém
    const floorLength = 2300;
    const floorWidth = 1500;
    const floorHeight = 10;
    const floorGeometry = new THREE.BoxGeometry(floorLength, floorHeight, floorWidth);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    const floorOffsetZ = -700; // offset to pull floor further back
    floorMesh.position.set(floorLength / 3, -floorHeight / 2, -floorWidth / 2 - floorOffsetZ);
    this.add(floorMesh);

    // Add ambient light to warehouse
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6 * Math.PI);
    this.add(ambientLight);

    // Adicionar parede atrás das estantes
    const wallHeight = 500;
    const wallThickness = 20;
    const wallLength = 2300;
    const wallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, wallThickness);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    const wallOffsetZ = -400; // offset for the wall
    wallMesh.position.set(wallLength / 2.9 - espacamentoEntreEstantes / 25, wallHeight / 2, -400 + wallOffsetZ);
    this.add(wallMesh);

    // Adicionar focos de luz no teto (um por estante)
    for (let i = 0; i < 3; i++) {
      const spotlight = new THREE.SpotLight(0xffffff, 1.2 * 4 * Math.PI); // cor e intensidade
      spotlight.angle = Math.PI / 8;
      spotlight.penumbra = 0.3;
      spotlight.decay = 2;
      spotlight.distance = 1000;

      // Set fixed spotlight positions for each shelf
      let spotlightX, spotlightY, spotlightZ;
      spotlightY = 350; // fixed y for all shelves
      spotlightZ = -450; // fixed z for all shelves

      if (i === 0) {
        spotlightX = 200; // Shelf 1
      } else if (i === 1) {
        spotlightX = 850; // Shelf 2
      } else if (i === 2) {
        spotlightX = 1500; // Shelf 3
      }

      spotlight.position.set(spotlightX, spotlightY, spotlightZ);

      // Direcionar o foco para baixo, para o centro entre as estantes
      spotlight.target.position.set(spotlightX, 0, spotlightZ);
      this.add(spotlight.target); // importante: adicionar o target à cena

      this.add(spotlight);
    }

  }
}
