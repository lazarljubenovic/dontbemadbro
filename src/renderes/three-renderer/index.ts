import { Board } from '../../game-logic/board'
import { Move } from '../../game-logic/move'
import * as THREE from 'three'
import { MouseHandler } from './mouse-handler'
import { GamepadHandler } from './gamepad-handler'
import { clamp, fillArray } from '../../utils'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'

const COLORS = [0x3bb900, 0xfe0000, 0x0085c8, 0xffbe00]

function normalizeAxis (axis: number | undefined | null): number {
  if (axis == null) return 0
  return Math.abs(axis) < 0.05 ? 0 : axis
}

class BoardObject3D extends THREE.Object3D {

  public constructor (
    public readonly board: Board,
    size: number,
    thickness: number,
  ) {
    super()
    const boardGeometry = new THREE.BoxGeometry(size, thickness, size)
    boardGeometry.translate(0, -thickness / 2, 0)
    const basicMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa55 })
    const boardMesh = new THREE.Mesh(boardGeometry, basicMaterial)

    const _ = null
    const $ = 0xffffff
    const [q, w, e, r] = COLORS

    const positions = [
      [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
      [_, _, _, _, _, _, $, $, $, _, _, _, _, _, _],
      [_, _, _, _, _, _, $, q, $, _, _, _, _, _, _],
      [_, _, _, _, _, _, $, q, $, _, _, _, _, _, _],
      [_, _, _, _, _, _, $, q, $, _, _, _, _, _, _],
      [_, _, _, _, _, _, $, q, $, _, _, _, _, _, _],
      [_, $, $, $, $, $, $, _, $, $, $, $, $, $, _],
      [_, $, r, r, r, r, _, _, _, w, w, w, w, $, _],
      [_, $, $, $, $, $, $, _, $, $, $, $, $, $, _],
      [_, _, _, _, _, _, $, e, $, _, _, _, _, _, _],
      [_, _, _, _, _, _, $, e, $, _, _, _, _, _, _],
      [_, _, _, _, _, _, $, e, $, _, _, _, _, _, _],
      [_, _, _, _, _, _, $, e, $, _, _, _, _, _, _],
      [_, _, _, _, _, _, $, $, $, _, _, _, _, _, _],
      [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    ]

    const tileMeshes: TileObject3D[] = []

    const segments = 15
    const step = 1 / segments * size
    const tileBottomRadius = step * 0.86 / 2
    const tileTopRadius = tileBottomRadius * 0.9
    const tileThickness = thickness * 0.1

    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const color = positions[i][j]
        if (color === null) continue
        const z = i * step + step / 2 - size / 2
        const x = j * step + step / 2 - size / 2
        const tileMesh = new TileObject3D(tileBottomRadius, tileTopRadius, tileThickness, color)
        const y = tileThickness / 2
        tileMesh.position.set(x, y, z)
        tileMeshes.push(tileMesh)
      }
    }

    const hubObjects = fillArray(4, (index) => {
      const angle = (Math.PI / 2) * index - Math.PI / 4
      const radius = size / Math.SQRT2 * 0.58
      const x = radius * Math.cos(angle)
      const z = radius * Math.sin(angle)
      const color = COLORS[index]
      const hubObject = new HubObject3D(4, step / Math.SQRT2, tileBottomRadius, tileTopRadius, tileThickness, color)
      hubObject.translateX(x)
      hubObject.translateY(tileThickness / 2)
      hubObject.translateZ(z)
      return hubObject
    })

    this.add(boardMesh, ...tileMeshes, ...hubObjects)
  }

}

class FigureObject3D extends THREE.Object3D {

  public constructor (
    legsRadius: number,
    headRadius: number,
    headOffset: number,
    height: number,
    color: number,
  ) {
    super()
    const SEGMENTS = 64
    const bodyHeight = height - headRadius
    const bodyGeometry = new THREE.ConeBufferGeometry(legsRadius, bodyHeight, SEGMENTS)
    const headGeometry = new THREE.SphereBufferGeometry(headRadius, SEGMENTS, SEGMENTS)
    bodyGeometry.translate(0, bodyHeight / 2, 0)
    headGeometry.translate(0, bodyHeight + headOffset, 0)
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      metalness: 0.8,
      color,
    })
    const bodyMesh = new THREE.Mesh(bodyGeometry, material)
    const headMesh = new THREE.Mesh(headGeometry, material)
    this.add(bodyMesh, headMesh)
  }

}

class TileObject3D extends THREE.Object3D {

  public constructor (
    bottomRadius: number,
    topRadius: number,
    height: number,
    color: number,
  ) {
    super()
    const SEGMENTS = 64
    const geometry = new THREE.CylinderBufferGeometry(topRadius, bottomRadius, height, SEGMENTS)
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.9,
      metalness: 0.2,
      color,
    })
    const mesh = new THREE.Mesh(geometry, material)
    this.add(mesh)
  }

}

class HubObject3D extends THREE.Object3D {

  public constructor (
    count: number,
    radius: number,
    bottomRadius: number,
    topRadius: number,
    height: number,
    color: number,
  ) {
    super()
    const angleStep = 2 * Math.PI / count
    for (let index = 0; index < count; index++) {
      const angle = angleStep * index
      const x = radius * Math.cos(angle)
      const z = radius * Math.sin(angle)
      const tile = new TileObject3D(bottomRadius, topRadius, height, color)
      tile.translateX(x)
      tile.translateZ(z)
      this.add(tile)
    }
  }

}

export class ThreeRenderer {

  protected width: number
  protected height: number

  protected get aspectRatio (): number { return this.width / this.height }

  protected cameraRadius = 7
  protected cameraPhi = Math.PI / 4
  protected cameraTheta = Math.PI / 6

  protected addToCameraRadius (delta: number): void {
    this.cameraRadius = clamp(2, 20)(this.cameraRadius + delta)
  }

  protected addToCameraPhi (delta: number): void {
    this.cameraPhi = clamp(1e-6, Math.PI / 2)(this.cameraPhi + delta)
  }

  protected addToCameraTheta (delta: number): void {
    this.cameraTheta = (this.cameraTheta + delta) % (2 * Math.PI)
  }

  protected get cameraSpherical () { return new THREE.Spherical(this.cameraRadius, this.cameraPhi, this.cameraTheta) }

  protected boardCamera: THREE.PerspectiveCamera
  protected scene: THREE.Scene
  protected threeRenderer: THREE.WebGLRenderer
  protected threeComposer: EffectComposer

  protected readonly mouseHandler = new MouseHandler()
  protected readonly gamepadHandler = new GamepadHandler()

  public constructor (
    public readonly board: Board,
    public readonly canvasEl: HTMLCanvasElement,
  ) {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvasEl.width = this.width
    this.canvasEl.height = this.height
    this.canvasEl.style.display = 'block'

    this.boardCamera = new THREE.PerspectiveCamera(35, this.aspectRatio, 0.1, 50)
    this.boardCamera.position.setFromSpherical(this.cameraSpherical)
    this.boardCamera.lookAt(new THREE.Vector3())

    this.scene = new THREE.Scene()

    const pointLight = new THREE.PointLight(0xffffff)
    pointLight.position.y = 10
    pointLight.position.x = 15
    pointLight.position.z = 20

    const rectLight = new THREE.RectAreaLight(0xffffff, 10)
    rectLight.width = 3
    rectLight.height = 3
    rectLight.position.y = 5
    rectLight.position.x = 1
    rectLight.position.z = 1
    rectLight.lookAt(0, 0, 0)

    const boardObject = new BoardObject3D(this.board, 2.5, 0.05)
    boardObject.position.y = -0.025

    this.scene.add(boardObject, rectLight)
    this.threeRenderer = new THREE.WebGLRenderer({ canvas: this.canvasEl, antialias: true })

    this.threeComposer = new EffectComposer(this.threeRenderer)
    const renderPass = new RenderPass(this.scene, this.boardCamera)
    this.threeComposer.addPass(renderPass)
    this.threeComposer.setSize(this.canvasEl.width, this.canvasEl.height)
  }

  public initialize () {
    this.render()
    this.mouseHandler.listen('dragging', movement => {
      this.addToCameraPhi(-movement.y / 80)
      this.addToCameraTheta(-movement.x / 40)
      this.boardCamera.position.setFromSpherical(this.cameraSpherical)
      this.boardCamera.lookAt(new THREE.Vector3())
      this.render()
    })
    document.addEventListener('wheel', event => {
      const delta = event.deltaY / 100
      this.addToCameraRadius(delta)
      this.boardCamera.position.setFromSpherical(this.cameraSpherical)
      this.render()
    })
    this.gamepadHandler.listen(({ axes: [_, __, y, x], buttons }) => {
      this.addToCameraRadius(buttons[6].pressed ? +0.1 : 0)
      this.addToCameraRadius(buttons[7].pressed ? -0.1 : 0)
      this.addToCameraPhi(normalizeAxis(x) / 30)
      this.addToCameraTheta(normalizeAxis(y) / 30)
      this.boardCamera.position.setFromSpherical(this.cameraSpherical)
      this.boardCamera.lookAt(new THREE.Vector3())
      this.render()
    })
  }

  public performMove (move: Move) {

  }

  private render () {
    this.threeComposer.render(0)
  }

}
