'use strict';

import * as THREE from 'three';
import { MyBox } from './Caixa.js';

// Margem (mm) usada para espelhar as caixas dos dois primeiros andares
const MARGEM_ESPELHO = 80;
const COR_LATERAIS = 0x3a4450; // aço escuro (visível sob iluminação, ao contrário de preto puro)

export class Estante extends THREE.Object3D {
  constructor(larguraEstante, alturaEstante, profundidadeEstante, larguraCaixa, alturaCaixa, profundidadeCaixa) {
    super();

    this.inclinacaoFirst = -10 * Math.PI / 180;
    this.inclinacaoSecond = -10 * Math.PI / 180;
    this.inclinacaoThird = 10 * Math.PI / 180;

    const numAndares = 3;
    const caixasPorAndar = 2;
    const espacamentoVertical = alturaEstante / (numAndares + 1);
    const novaLarguraEstante = larguraEstante * 0.8;
    const novaProfundidadeEstante = profundidadeEstante * 0.8;

    const fatorAumento = 4;
    const espacamentoExtra = 15;

    for (let i = 0; i < numAndares; i++) {
      const andar = new THREE.Group();
      const yBase = espacamentoVertical * (i + 1);

      // Inclina o grupo do andar inteiro
      if (i === 0) {
        andar.rotation.z = this.inclinacaoFirst;
      } else if (i === 1) {
        andar.rotation.z = this.inclinacaoSecond;
      } else if (i === 2) {
        andar.rotation.z = this.inclinacaoThird;
      }

      // Plano da prateleira (inclinado com o grupo)
      const plano = new THREE.Mesh(
        new THREE.BoxGeometry(novaLarguraEstante, 5, novaProfundidadeEstante),
        new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
      );

      plano.position.set(novaLarguraEstante / 2, 0, -novaProfundidadeEstante / 2);
      andar.add(plano);

      // Caixas alinhadas ao plano (sem rotação extra)
      for (let j = 0; j < caixasPorAndar; j++) {
        const caixa = new MyBox(0, 0, 0,
          larguraCaixa * fatorAumento,
          profundidadeCaixa * fatorAumento,
          alturaCaixa * fatorAumento
        );

        let deslocamentoX = j * (larguraCaixa * fatorAumento + espacamentoExtra) + espacamentoExtra;
        let deslocamentoZ = -profundidadeEstante / 7;
        // Invert box position X for 1st and 2nd shelves to opposite side within shelf width
        if (i === 0 || i === 1) {
          // Nos dois primeiros andares as caixas ficam encostadas ao lado oposto da prateleira
          deslocamentoX = -deslocamentoX + novaLarguraEstante - MARGEM_ESPELHO;
        }

        caixa.position.set(deslocamentoX, 5, deslocamentoZ);
        andar.add(caixa);
      }

      // Posiciona o grupo já inclinado
      andar.position.set(0, yBase, 0);
      this.add(andar);
    }


    // Laterais verticais da estante
    const ladoMaterial = new THREE.MeshLambertMaterial({ color: COR_LATERAIS });
    const ladoEsq = new THREE.Mesh(
      new THREE.BoxGeometry(10, alturaEstante, novaProfundidadeEstante),
      ladoMaterial
    );
    ladoEsq.position.set(0, alturaEstante / 2, -novaProfundidadeEstante / 2);
    this.add(ladoEsq);

    const ladoDir = ladoEsq.clone();
    ladoDir.position.x = novaLarguraEstante;
    this.add(ladoDir);
  }
}
