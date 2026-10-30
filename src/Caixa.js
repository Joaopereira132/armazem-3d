'use strict';

import * as THREE from 'three';

/**
 * Caixa aberta (sem tampa) feita de 4 lados + base.
 * Parâmetros (mm): lp/ep não são usados na geometria; ap = elevação da caixa;
 * lt = comprimento (X), et = profundidade (Z), at = altura (Y).
 */
export class MyBox extends THREE.Object3D {
  constructor(lp, ep, ap, lt, et, at) {
    super();
    const thickness = at / 4;
    const height = at;
    const length = lt;
    const depth = et;

    // Lados
    const front = this.createMesh(new THREE.BoxGeometry(length, height, thickness), 0xff0000);
    front.position.set(length / 2, height / 2 + ap, -thickness / 2);
    this.add(front);

    const back = this.createMesh(new THREE.BoxGeometry(length, height, thickness), 0xff0000);
    back.position.set(length / 2, height / 2 + ap, -depth + thickness / 2);
    this.add(back);

    const left = this.createMesh(new THREE.BoxGeometry(thickness, height, depth - 2 * thickness), 0xff0000);
    left.position.set(thickness / 2, height / 2 + ap, -depth / 2);
    this.add(left);

    const right = this.createMesh(new THREE.BoxGeometry(thickness, height, depth - 2 * thickness), 0xff0000);
    right.position.set(length - thickness / 2, height / 2 + ap, -depth / 2);
    this.add(right);

    // Base (encaixa entre os lados, sem sobrepor faces, para evitar cintilação/z-fighting)
    const bottom = this.createMesh(new THREE.BoxGeometry(length - 2 * thickness, thickness, depth - 2 * thickness), 0x222222);
    bottom.position.set(length / 2, thickness / 2 + ap, -depth / 2);
    this.add(bottom);
  }

  // Uma única malha com material Lambert (iluminado, sem sobreposição de faces).
  createMesh(geometry, color) {
    return new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }));
  }
}
