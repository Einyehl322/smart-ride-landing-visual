/**
 * Escena del visor 3D: carga del GLB, cámara orbital, luz de estudio y dibujo
 * bajo demanda. Es independiente de React; el componente la crea y la destruye.
 *
 * - Fondo transparente: el producto se integra sobre el diseño de la página.
 * - Solo dibuja cuando algo cambia (gesto, inercia, giro automático) y nunca
 *   fuera de pantalla, para no gastar batería en móvil.
 * - En táctil, el gesto vertical sigue desplazando la página; el horizontal gira.
 */
import {
  ACESFilmicToneMapping,
  Box3,
  Clock,
  DirectionalLight,
  type Material,
  type Mesh,
  type Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  type Texture,
  Vector3,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from '../../../motion/gsap'

export interface ModelSceneState {
  /** 0–1 */
  progress: number
  ready: boolean
  error: string | null
  autoRotate: boolean
}

interface Options {
  src: string
  initialYaw?: number
  autoRotate: boolean
  onState: (s: ModelSceneState) => void
}

export class ModelScene {
  private renderer: WebGLRenderer
  private scene = new Scene()
  private camera = new PerspectiveCamera(30, 1, 0.01, 100)
  private controls: OrbitControls
  private pmrem: PMREMGenerator
  private clock = new Clock()
  private resize: ResizeObserver
  private raf = 0
  private visible = true
  private disposed = false
  private home = { position: new Vector3(), target: new Vector3() }
  private distance = 1
  private state: ModelSceneState
  private onState: Options['onState']

  constructor(canvas: HTMLCanvasElement, opts: Options) {
    this.onState = opts.onState
    this.state = { progress: 0, ready: false, error: null, autoRotate: opts.autoRotate }

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = SRGBColorSpace
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05

    // Iluminación de estudio: reflejos realistas en cristal y carcasa.
    this.pmrem = new PMREMGenerator(this.renderer)
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    const rim = new DirectionalLight(0xbfcaff, 1.4)
    rim.position.set(-3, 2.5, -2.5)
    const key = new DirectionalLight(0xffffff, 1.1)
    key.position.set(2.5, 3, 3)
    this.scene.add(rim, key)

    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.enablePan = false
    // La rueda no se captura: el scroll de la página nunca queda atrapado.
    this.controls.enableZoom = false
    this.controls.rotateSpeed = 0.9
    this.controls.autoRotateSpeed = 1.6
    this.controls.minPolarAngle = Math.PI * 0.12
    this.controls.maxPolarAngle = Math.PI * 0.88
    canvas.style.touchAction = 'pan-y'
    this.controls.addEventListener('change', this.requestRender)
    this.controls.addEventListener('start', () => this.setAutoRotate(false))

    this.resize = new ResizeObserver(() => this.fit())
    this.resize.observe(canvas.parentElement ?? canvas)

    void this.load(opts.src, opts.initialYaw ?? 0)
  }

  private emit(patch: Partial<ModelSceneState>) {
    this.state = { ...this.state, ...patch }
    this.onState(this.state)
  }

  private async load(src: string, yaw: number) {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    try {
      const gltf = await loader.loadAsync(src, (e) => {
        if (e.total) this.emit({ progress: e.loaded / e.total })
      })
      if (this.disposed) return
      const model = gltf.scene
      // Centrado en el origen y cámara a la distancia justa para su tamaño.
      const box = new Box3().setFromObject(model)
      const size = box.getSize(new Vector3())
      model.position.sub(box.getCenter(new Vector3()))
      model.rotation.y = (yaw * Math.PI) / 180
      this.scene.add(model)

      const radius = size.length() / 2
      this.distance = radius / Math.sin((this.camera.fov * Math.PI) / 360) * 1.08
      this.camera.near = this.distance / 100
      this.camera.far = this.distance * 10
      this.camera.position.set(0, radius * 0.18, this.distance)
      this.controls.target.set(0, 0, 0)
      this.controls.minDistance = this.distance * 0.55
      this.controls.maxDistance = this.distance * 1.5
      this.home.position.copy(this.camera.position)
      this.home.target.copy(this.controls.target)
      this.fit()
      this.setAutoRotate(this.state.autoRotate)
      this.emit({ ready: true, progress: 1 })
    } catch (err) {
      if (!this.disposed) this.emit({ error: err instanceof Error ? err.message : 'No se pudo cargar el modelo' })
    }
  }

  private fit = () => {
    const el = this.renderer.domElement.parentElement ?? this.renderer.domElement
    const { width, height } = el.getBoundingClientRect()
    if (!width || !height) return
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.requestRender()
  }

  private requestRender = () => {
    if (this.raf || this.disposed || !this.visible) return
    this.raf = requestAnimationFrame(this.frame)
  }

  private frame = () => {
    this.raf = 0
    const moving = this.controls.update(this.clock.getDelta())
    this.renderer.render(this.scene, this.camera)
    // Sigue dibujando mientras haya inercia o giro automático.
    if (moving || this.controls.autoRotate) this.requestRender()
  }

  setAutoRotate(on: boolean) {
    this.controls.autoRotate = on
    this.clock.getDelta()
    if (on !== this.state.autoRotate) this.emit({ autoRotate: on })
    this.requestRender()
  }

  /** Acercar (1) o alejar (-1) a lo largo de la línea de visión. */
  zoom(direction: 1 | -1) {
    const { minDistance, maxDistance, target } = this.controls
    const offset = this.camera.position.clone().sub(target)
    const next = gsap.utils.clamp(minDistance, maxDistance, offset.length() * (direction > 0 ? 0.8 : 1.25))
    const to = target.clone().add(offset.setLength(next))
    this.tweenCamera(to, target.clone())
  }

  reset() {
    this.setAutoRotate(false)
    this.tweenCamera(this.home.position.clone(), this.home.target.clone())
  }

  private tweenCamera(position: Vector3, target: Vector3) {
    const tick = () => {
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    }
    gsap.to(this.camera.position, { x: position.x, y: position.y, z: position.z, duration: 0.9, ease: 'power3.inOut', onUpdate: tick, overwrite: true })
    gsap.to(this.controls.target, { x: target.x, y: target.y, z: target.z, duration: 0.9, ease: 'power3.inOut', overwrite: true })
  }

  setVisible(visible: boolean) {
    this.visible = visible
    if (visible) {
      this.clock.getDelta()
      this.requestRender()
    } else {
      cancelAnimationFrame(this.raf)
      this.raf = 0
    }
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.resize.disconnect()
    gsap.killTweensOf([this.camera.position, this.controls.target])
    this.controls.dispose()
    this.scene.traverse((obj: Object3D) => {
      const mesh = obj as Mesh
      mesh.geometry?.dispose()
      const materials = (Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []) as Material[]
      for (const m of materials) {
        for (const value of Object.values(m)) if ((value as Texture)?.isTexture) (value as Texture).dispose()
        m.dispose()
      }
    })
    this.scene.environment?.dispose()
    this.pmrem.dispose()
    this.renderer.dispose()
  }
}
