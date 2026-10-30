'use strict';

import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyBox } from './Caixa.js';
import { Estante } from './Estante.js';
import { Warehouse } from './Warehouse.js';
import { Robot } from './Robot.js';

// Dimensões em milímetros.
const CAIXA_GRANDE = { comprimento: 600, profundidade: 400, altura: 300, espessuraBase: 20, espessuraLado: 15, elevacao: 40 };
const ESTANTE = { largura: 600, altura: 400, profundidade: 300 };
const CAIXA_ESTANTE = { largura: 20, altura: 15, profundidade: 40 }; // dimensões base (ampliadas na Estante)

// Movimento do robô
const ROBOT_POSICAO_INICIAL = new THREE.Vector3(150, 1, 0);
const ROBOT_X_MIN = 100;
const ROBOT_X_MAX = 1600;
const ROBOT_VELOCIDADE = 60; // mm/s

/**
 * Painel de controlo (lil-gui): decide o que se vê na cena,
 * a câmara, o tipo de navegação e o movimento do robô.
 */
export class MyGui {
  webgl;
  robot = null;
  moverRobot = false;
  sentidoRobot = 1;

  constructor(webgl) {
    this.webgl = webgl;

    const acoes = {
      limparCena: () => this.limparCena(),
      verCaixa: () => this.verCaixa(),
      verEstante: () => this.verEstante(),
      verArmazem: () => this.verArmazem(),
      verRobot: () => this.verRobot(),
      ativarRobot: () => this.alternarRobot(),

      cameraPerspectiva: () => webgl.setCamera('perspective'),
      cameraOrtografica: () => webgl.setCamera('orthographic'),
      resetCamara: () => webgl.resetCameras(),

      controloTrackball: () => webgl.setControl('trackball'),
      controloOrbit: () => webgl.setControl('orbit'),
      controloFirstPerson: () => webgl.setControl('firstPerson'),
      controloFly: () => webgl.setControl('fly'),
    };

    const gui = new GUI();
    gui.add(acoes, 'limparCena').name('Limpar ecrã');
    gui.add(acoes, 'verCaixa').name('Ver caixa');
    gui.add(acoes, 'verEstante').name('Ver estante');
    gui.add(acoes, 'verArmazem').name('Ver armazém');
    gui.add(acoes, 'verRobot').name('Ver robô');
    gui.add(acoes, 'ativarRobot').name('Ligar / parar robô');

    const camFolder = gui.addFolder('Câmaras');
    camFolder.add(acoes, 'cameraPerspectiva').name('Perspetiva');
    camFolder.add(acoes, 'cameraOrtografica').name('Ortográfica');
    camFolder.add(acoes, 'resetCamara').name('Repor câmara');

    const ctrlFolder = gui.addFolder('Controlos');
    ctrlFolder.add(acoes, 'controloTrackball').name('Trackball');
    ctrlFolder.add(acoes, 'controloOrbit').name('Orbit');
    ctrlFolder.add(acoes, 'controloFirstPerson').name('First Person');
    ctrlFolder.add(acoes, 'controloFly').name('Fly');

    // Animação do robô: usa o tempo real decorrido, por isso a velocidade
    // é a mesma em ecrãs de 60 Hz ou de 144 Hz.
    webgl.animateCallbacks.push((delta) => this.animarRobot(delta));
  }

  limparCena() {
    this.webgl.clearContent();
    this.robot = null;
    this.moverRobot = false;
  }

  verCaixa() {
    this.webgl.add(new THREE.AxesHelper(50));
    this.webgl.add(new MyBox(
      CAIXA_GRANDE.espessuraBase,
      CAIXA_GRANDE.espessuraLado,
      CAIXA_GRANDE.elevacao,
      CAIXA_GRANDE.comprimento,
      CAIXA_GRANDE.profundidade,
      CAIXA_GRANDE.altura
    ));
  }

  verEstante() {
    this.webgl.add(new THREE.AxesHelper(50));
    const estante = new Estante(
      ESTANTE.largura, ESTANTE.altura, ESTANTE.profundidade,
      CAIXA_ESTANTE.largura, CAIXA_ESTANTE.altura, CAIXA_ESTANTE.profundidade
    );
    estante.position.set(-20, 0, 0);
    this.webgl.add(estante);
  }

  verArmazem() {
    this.limparCena();
    this.webgl.add(new THREE.AxesHelper(100));
    this.webgl.add(new Warehouse(
      ESTANTE.largura, ESTANTE.altura, ESTANTE.profundidade,
      CAIXA_ESTANTE.largura, CAIXA_ESTANTE.altura, CAIXA_ESTANTE.profundidade
    ));
  }

  verRobot() {
    if (this.robot) return;
    this.robot = new Robot();
    this.robot.position.copy(ROBOT_POSICAO_INICIAL);
    this.webgl.add(this.robot);
  }

  alternarRobot() {
    if (this.robot) this.moverRobot = !this.moverRobot;
  }

  animarRobot(delta) {
    if (!this.robot || !this.moverRobot) return;

    this.robot.position.x += this.sentidoRobot * ROBOT_VELOCIDADE * delta;

    // Inverte o sentido nos limites do corredor
    if (this.robot.position.x > ROBOT_X_MAX) {
      this.robot.position.x = ROBOT_X_MAX;
      this.sentidoRobot = -1;
    } else if (this.robot.position.x < ROBOT_X_MIN) {
      this.robot.position.x = ROBOT_X_MIN;
      this.sentidoRobot = 1;
    }
  }
}
