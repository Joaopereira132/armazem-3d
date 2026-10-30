'use strict';

import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

// Unidades da cena: milímetros.
// Posição inicial das câmaras (vista 3/4, onde se vê o interior das estantes)
// e ponto para onde olham (centro do armazém).
const POSICAO_INICIAL = new THREE.Vector3(2600, 550, 1500);
const ALVO = new THREE.Vector3(950, 50, -200);
const TAMANHO_ORTOGRAFICA = 2000; // altura visível da câmara ortográfica

/**
 * Responsável por tudo o que é "infraestrutura" do WebGL:
 * renderer, cena, luzes, câmaras, controlos e ciclo de animação.
 *
 * Os objetos da aplicação (estantes, robô...) vão para `this.content`,
 * de modo que "limpar o ecrã" nunca remove as luzes da cena.
 */
export class Webgl {
  clock;
  renderer;
  scene;
  content; // grupo que contém os objetos adicionados pela aplicação

  perspectiveCamera;
  orthographicCamera;
  camera; // câmara atual

  controls; // controlos atuais
  currentControlType = 'trackball';

  // Funções chamadas a cada frame com o tempo decorrido (segundos)
  animateCallbacks = [];

  constructor() {
    this.clock = new THREE.Clock();

    const canvas = document.querySelector('#WebGL-canvas');
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x555555);

    // Luzes permanentes (ficam fora de `content`, por isso sobrevivem a "limpar").
    // Iluminação fisicamente correta (por defeito desde o three r155): as intensidades
    // "clássicas" (0.4 e 0.8) foram multiplicadas por π.
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4 * Math.PI));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8 * Math.PI);
    directionalLight.position.set(2000, 3000, 2500);
    this.scene.add(directionalLight);

    this.content = new THREE.Group();
    this.scene.add(this.content);

    const aspect = window.innerWidth / window.innerHeight;

    this.perspectiveCamera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
    this.orthographicCamera = new THREE.OrthographicCamera(
      (TAMANHO_ORTOGRAFICA * aspect) / -2,
      (TAMANHO_ORTOGRAFICA * aspect) / 2,
      TAMANHO_ORTOGRAFICA / 2,
      TAMANHO_ORTOGRAFICA / -2,
      1,
      10000
    );
    this.camera = this.perspectiveCamera;
    this.resetCameras();

    this.setControl(this.currentControlType);

    window.addEventListener('resize', () => this.onResize());

    // Um único ciclo de animação (recomendado pelo three.js)
    this.renderer.setAnimationLoop(() => this.animate());
  }

  /** Adiciona um objeto à cena da aplicação. */
  add(object) {
    this.content.add(object);
  }

  /** Remove (e liberta da memória) todos os objetos da aplicação; as luzes mantêm-se. */
  clearContent() {
    for (const child of [...this.content.children]) {
      this.content.remove(child);
      child.traverse((node) => {
        node.geometry?.dispose();
        const materiais = Array.isArray(node.material) ? node.material : [node.material];
        materiais.forEach((m) => m?.dispose());
      });
    }
  }

  /** Repõe as duas câmaras na posição inicial a olhar para o armazém. */
  resetCameras() {
    for (const cam of [this.perspectiveCamera, this.orthographicCamera]) {
      cam.position.copy(POSICAO_INICIAL);
      cam.up.set(0, 1, 0);
      cam.zoom = 1;
      cam.lookAt(ALVO);
      cam.updateProjectionMatrix();
    }
    // Os controlos guardam o seu próprio estado: recriam-se a partir da nova posição.
    if (this.controls) this.setControl(this.currentControlType);
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    this.perspectiveCamera.aspect = aspect;
    this.perspectiveCamera.updateProjectionMatrix();

    this.orthographicCamera.left = (TAMANHO_ORTOGRAFICA * aspect) / -2;
    this.orthographicCamera.right = (TAMANHO_ORTOGRAFICA * aspect) / 2;
    this.orthographicCamera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.controls?.handleResize?.();
  }

  animate() {
    const delta = this.clock.getDelta();
    this.animateCallbacks.forEach((callback) => callback(delta));
    this.controls?.update(delta);
    this.renderer.render(this.scene, this.camera);
  }

  /** Alterna entre câmara perspetiva e ortográfica. */
  setCamera(tipo) {
    if (tipo === 'perspective') this.camera = this.perspectiveCamera;
    else if (tipo === 'orthographic') this.camera = this.orthographicCamera;
    this.setControl(this.currentControlType);
  }

  /** Troca o tipo de controlo (trackball, orbit, fly, firstPerson). */
  setControl(tipo) {
    this.controls?.dispose();
    this.currentControlType = tipo;
    const dom = this.renderer.domElement;

    switch (tipo) {
      case 'orbit':
        this.controls = new OrbitControls(this.camera, dom);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.panSpeed = 0.5;
        this.controls.minDistance = 100;
        this.controls.maxDistance = 5000;
        this.controls.maxPolarAngle = Math.PI / 2; // não deixa a câmara ir para baixo do chão
        this.controls.target.copy(ALVO);
        break;

      case 'fly':
        this.controls = new FlyControls(this.camera, dom);
        this.controls.movementSpeed = 500; // mm/s
        this.controls.rollSpeed = Math.PI / 24;
        this.controls.autoForward = false;
        this.controls.dragToLook = true;
        break;

      case 'firstPerson':
        this.controls = new FirstPersonControls(this.camera, dom);
        this.controls.lookSpeed = 0.1;
        this.controls.movementSpeed = 200; // mm/s
        this.controls.lookVertical = true;
        break;

      case 'trackball':
      default:
        this.currentControlType = 'trackball';
        this.controls = new TrackballControls(this.camera, dom);
        this.controls.rotateSpeed = 10.0;
        this.controls.zoomSpeed = 1.0;
        this.controls.panSpeed = 1.0;
        this.controls.staticMoving = true;
        this.controls.target.copy(ALVO);
        break;
    }
  }
}
