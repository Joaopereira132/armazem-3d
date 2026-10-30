'use strict';

import * as THREE from 'three';

export class Robot extends THREE.Object3D {
  constructor() {
    super();

    // Corpo principal (caixa)
    const corpo = new THREE.Mesh(
      new THREE.BoxGeometry(100, 40, 50),
      new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    );
    corpo.position.y = 20;
    this.add(corpo);

    // Rodas (esferas)
    const rodaGeo = new THREE.SphereGeometry(20, 32, 32);
    const rodaMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const posicoesRodas = [
      [-30, 0, -20],
      [30, 0, -20],
      [-30, 0, 20],
      [30, 0, 20]
    ];
    posicoesRodas.forEach(([x, y, z]) => {
      const roda = new THREE.Mesh(rodaGeo, rodaMat);
      roda.position.set(x, y, z);
      this.add(roda);
    });

    // Tubo 1 (base do braço)
    const tubo1 = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 30),
      new THREE.MeshLambertMaterial({ color: 0x0000ff })
    );
    tubo1.position.set(40, 55, 0); // Em cima da caixa
    this.add(tubo1);

    // Tubo 2 (em cima do tubo1)
    const tubo2 = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 30),
      new THREE.MeshLambertMaterial({ color: 0x0000ff })
    );
    tubo2.position.set(40, 70, 0); // 55 + 15 (metade do tubo1) + 15 (metade do tubo2)
    this.add(tubo2);
  }
}
