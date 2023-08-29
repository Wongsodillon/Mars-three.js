import * as THREE from "./three.js/build/three.module.js"
import { OrbitControls } from "./three.js/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "./three.js/examples/jsm/loaders/GLTFLoader.js"
import { TextGeometry } from "./three.js/examples/jsm/geometries/TextGeometry.js" 
import { FontLoader } from "./three.js/examples/jsm/loaders/FontLoader.js"

const width = window.innerWidth
const height = window.innerHeight

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(width, height)
renderer.shadowMap.enabled = true

const normalCamera = new THREE.PerspectiveCamera(75, width / height)
const marsCamera = new THREE.PerspectiveCamera(75, width / height)

normalCamera.position.set(96, 65.78, 358.66)
normalCamera.lookAt(160,-100,0)
marsCamera.position.set(-959.396,664.020,-1455.255)
marsCamera.lookAt(0,0,0)

document.body.appendChild(renderer.domElement)

const textureLoader = new THREE.TextureLoader()

const sunGeometry = new THREE.SphereGeometry(50,50,50)
const sunMaterial = new THREE.MeshBasicMaterial({ 
    map: textureLoader.load("./assets/sunTexture.jpg")
})
const sun = new THREE.Mesh(sunGeometry, sunMaterial)
sun.position.set(300,475,400)
sun.castShadow = true
sun.userData.draggable = true
sun.userData.name = "sun"
scene.add(sun)

const goldDonutGeometry = new THREE.TorusGeometry( 50, 10, 16, 100 )
const goldDonutMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load("./assets/goldTexture.avif")
});
const goldDonut = new THREE.Mesh(goldDonutGeometry, goldDonutMaterial)
goldDonut.position.set(-300,475,610)
scene.add(goldDonut)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(300,475,400)
light.lookAt(0,-100,0)
light.castShadow = true
let side = 200
light.shadow.camera.top = side
light.shadow.camera.bottom = -side
light.shadow.camera.left = side
light.shadow.camera.right = -side
light.shadow.camera.far = 5000
const helper = new THREE.DirectionalLightHelper(light, 100)
scene.add(light)
// scene.add(helper)
light.draggable = true

const hemisphereLight = new THREE.HemisphereLight(0xf1b816, 0x080820, 1);
hemisphereLight.position.set(-300,475,610);
scene.add(hemisphereLight);
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 5);
scene.add(hemisphereLightHelper);

const shadowHelper = new THREE.CameraHelper(light.shadow.camera)
// scene.add(shadowHelper)

const marsTexture = [
    new THREE.MeshBasicMaterial({
        map: textureLoader.load("./assets/skybox/right.png"),
        side: THREE.DoubleSide
    }),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load("./assets/skybox/left.png"),
        side: THREE.DoubleSide
    }),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load("./assets/skybox/up.png"),
        side: THREE.DoubleSide
    }),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load("./assets/skybox/down.png"),
        side: THREE.DoubleSide
    }),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load("./assets/skybox/front.png"),
        side: THREE.DoubleSide
    }),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load("./assets/skybox/back.png"),
        side: THREE.DoubleSide
    })
]

const marsGeometry = new THREE.BoxGeometry(1200,1200,1200)
const mars = new THREE.Mesh(marsGeometry, marsTexture)
mars.position.set(0,0,0)
scene.add(mars)

class AstronautScene {
    constructor(scene) {
        this.face = "front"
        this.scene = scene
        this.astronaut = null
        this.astronautLoader = new GLTFLoader()
        this.astronautTextureLoader = new THREE.TextureLoader()
        this.loadAstronautModel()
    }
    loadAstronautModel() {
        this.astronautLoader.load("./assets/astronaut/scene.gltf", model => {
            this.astronaut = model.scene
            this.astronaut.position.set(160, -95, 0)
            this.astronaut.scale.set(1.25, 1.25, 1.25)

            this.loadAstronautTexture()
    
            this.scene.add(this.astronaut)
        })
    }
    loadAstronautTexture() {
        let astronautTexture = this.astronautTextureLoader.load("./assets/astronaut/textures/us_space_alpha_a_col_baseColor.png");
        this.astronaut.traverse(child => {
            if (child.isMesh) {
                child.material.map = astronautTexture
                child.castShadow = true
            }
        })
    }
    moveAstronaut(key) {
        if (key == "w") {
            if (this.face != "front") {
                this.face = "front"
            }
            this.astronaut.position.z += 5
        }
        if (key == "s") {
            if (this.face != "back") {
                this.face = "back"
            }
            this.astronaut.position.z -= 5
        }
        if (key == "a") {
            if (this.face != "left") {
                this.face = "left"
            }
            this.astronaut.position.x += 5
        }
        if (key == "d") {
            if (this.face != "right") {
                this.face = "right"
            }
            this.astronaut.position.x -= 5
        }
        if (key == " ") {
            this.astronaut.position.y += 15
            setTimeout(() => {
                this.astronaut.position.y -= 15
            }, 500)
        }   
    }
}

const astronautScene = new AstronautScene(scene);

class Rocket {
    constructor() {
        this.scene = scene
        this.rocket = null
        this.rocketFire = null
        this.rocketFireLight = null
        this.camera = new THREE.PerspectiveCamera(75, width / height)
        this.camera.position.set(-160, 0,300)
        this.rocketLoader = new GLTFLoader()
        this.rocketTextureLoader = new THREE.TextureLoader()
        this.loadRocketModel()
        this.loadRocketFire()
    }
    loadRocketModel() {
        this.rocketLoader.load("./assets/rocket/scene.gltf", model => {
            this.rocket = model.scene
            this.rocket.position.set(-160,-60,0)
            this.rocket.scale.set(0.3,0.3,0.3)
            this.loadRocketTexture()
            this.scene.add(this.rocket)
        })
    }
    loadRocketTexture() {
        let rocketTexture = this.rocketTextureLoader.load("./assets/rocket/textures/ROKET_baseColor.jpeg")
        this.rocket.traverse(child => {
            if (child.isMesh) {
                child.material.map = rocketTexture
                child.castShadow = true
            }
        })
    }
    loadRocketFire () {
        const rocketFireGeometry = new THREE.ConeGeometry(25, 70, 10)
        const rocketMaterial = new THREE.MeshStandardMaterial({ map: textureLoader.load("./assets/sunTexture.jpg" )})
        this.rocketFire = new THREE.Mesh(rocketFireGeometry, rocketMaterial)
        this.rocketFire.castShadow = true
        this.rocketFire.rotateX(Math.PI)
        this.rocketFire.position.set(-160,-100,0)
        this.rocketFireLight = new THREE.HemisphereLight(0Xf69721, 0Xf69721, 0.1)
        this.rocketFireLight.position.set(-160,-100,0)
    }
    removeRocketFire() {
        scene.remove(this.rocketFire)
        scene.remove(this.rocketFireLight)
    }
    addRocketFire() {
        scene.add(this.rocketFire)
        scene.add(this.rocketFireLight)
    }
}

let rocketModel = new Rocket()

let text
const fontLoader = new FontLoader()
fontLoader.load("./three.js/examples/fonts/helvetiker_regular.typeface.json", font => {
    let textGeometry = new TextGeometry("Press B to blast off!", {
        font: font,
        size: 20,
        height: 0.5
    })
    let textMaterial = new THREE.MeshStandardMaterial()
    text = new THREE.Mesh(textGeometry, textMaterial)
    text.position.set(-200,50,-50)
    scene.add(text)
})

let text2
fontLoader.load("./three.js/examples/fonts/helvetiker_regular.typeface.json", font => {
    let textGeometry = new TextGeometry("Press R to land rocket!", {
        font: font,
        size: 20,
        height: 0.5
    })
    let textMaterial = new THREE.MeshStandardMaterial()
    text2 = new THREE.Mesh(textGeometry, textMaterial)
    text2.position.set(-200,50,-50)
})

let sunText
fontLoader.load("./three.js/examples/fonts/gentilis_regular.typeface.json", font => {
    let textGeometry = new TextGeometry("You can drag the sun!", {
        font: font,
        size: 28,
        height: 1
    })
    let textMaterial = new THREE.MeshBasicMaterial()
    sunText = new THREE.Mesh(textGeometry, textMaterial)
    sunText.position.set(150, 550, 550)
    sunText.rotateY(Math.PI)
    scene.add(sunText)
})

let cameraText
fontLoader.load("./three.js/examples/fonts/helvetiker_regular.typeface.json", font => {
    let textGeometry = new TextGeometry("Press C to change camera!", {
        font: font,
        size: 28,
        height: 1
    })
    let textMaterial = new THREE.MeshBasicMaterial()
    cameraText = new THREE.Mesh(textGeometry, textMaterial)
    cameraText.position.set(0, 450, -550)
    scene.add(cameraText)
})

const mainBoxGeometry = new THREE.BoxGeometry(600,15,375)
const mainMaterial = new THREE.MeshStandardMaterial({ map: textureLoader.load("./assets/floorTexture.jpg") })
const mainBox = new THREE.Mesh(mainBoxGeometry, mainMaterial)
mainBox.receiveShadow = true
mainBox.position.set(0,-100,0)
scene.add(mainBox)

window.addEventListener("keypress", e => {
    astronautScene.moveAstronaut(e.key)
})

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let draggable

window.addEventListener("click", event => {
    if (draggable) {
        draggable = null
        return
    }
    pointer.x = (event.clientX / width) * 2 - 1
    pointer.y = -(event.clientY / height) * 2 + 1

    raycaster.setFromCamera(pointer, activeCamera)
    const intersects = raycaster.intersectObjects(scene.children)
    if (intersects.length > 0 && intersects[0].object.userData.draggable) {
        draggable = intersects[0].object
    }
})

window.addEventListener("mousemove", event => {
    pointer.x = (event.clientX / width) * 2 - 1
    pointer.y = -(event.clientY / height) * 2 + 1
})

function dragObject() {
    if (draggable != null) {
        raycaster.setFromCamera(pointer, activeCamera)
        const intersects = raycaster.intersectObjects(scene.children)
        if (intersects.length > 0) {
            for (const i of intersects) {
                draggable.position.x = i.point.x
                draggable.position.y = i.point.y
                draggable.position.z = i.point.z
                light.position.x = i.point.x
                light.position.y = i.point.y
                light.position.z = i.point.z
                light.lookAt.x = 0
                light.lookAt.y = -100
                light.lookAt.z = 0
            }
        }
    }
}

window.addEventListener("resize", onWindowResize, false)

function onWindowResize() {
    activeCamera.aspect = window.innerWidth / window.innerHeight
    activeCamera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function existsInScene(object) {
    for (const child of scene.children) {
        if (child == object) {
            return true
        }
    }
    return false
}

const flagGeometry = new THREE.PlaneGeometry(50,30)
const flagMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load("./assets/flagTexture.avif"),
    side: THREE.DoubleSide
})
const flag = new THREE.Mesh(flagGeometry, flagMaterial)
flag.position.set(0,0,0)
flag.castShadow = true
scene.add(flag)

const poleGeometry = new THREE.CylinderGeometry(1,1,120)
const poleMaterial = new THREE.MeshPhongMaterial({
    color: 0xFFFFFF,
    specular: 0xffffff, 
    shininess: 30
})
const pole = new THREE.Mesh(poleGeometry, poleMaterial)
pole.position.set(-25,-37.5,0)
pole.castShadow = true
scene.add(pole)

let rocketSpeed = 0

function animateGoldenDonut(xSpeed, ySpeed, zSpeed, rotationSpeed) {
    goldDonut.position.x += xSpeed
    goldDonut.position.y += ySpeed
    goldDonut.position.z += zSpeed
    goldDonut.rotateX(rotationSpeed)
    goldDonut.rotateY(rotationSpeed)
    goldDonut.rotateZ(rotationSpeed)
    hemisphereLight.position.x += xSpeed
    hemisphereLight.position.y += ySpeed
    hemisphereLight.position.z += zSpeed
    if (goldDonut.position.x >= 800) {
        goldDonut.position.set(-300,475,610)
        hemisphereLight.position.set(-300,475,610)
    }
}

let camIndicator = 0
let cameras = [normalCamera, rocketModel.camera, marsCamera]
window.addEventListener("keypress", e => {
    if (e.key.toLowerCase() == "c") {
        camIndicator++
        activeCamera = cameras[camIndicator % 3]
    }
})

let launched = false

function render() {
    console.log(activeCamera.position)
    sun.rotateY(0.06)
    animateGoldenDonut(0.8, -0.5, -0.5, 0.03)
    dragObject()
    requestAnimationFrame(render)
    renderer.render(scene, activeCamera)
    window.addEventListener("keypress", e => {
        if (e.key.toLowerCase() == "b") {
            launched = true
            rocketModel.addRocketFire()
            rocketSpeed = 1
            if (existsInScene(text)) {
                scene.remove(text)
            }
            scene.add(text2)
        }
        else if (e.key.toLowerCase() == "r") {
            launched = false
            rocketSpeed = -0.01
            if (existsInScene(text2)) {
                scene.remove(text2)
            }
            scene.add(text)
        }
    })
    if (Math.floor(rocketModel.rocket.position.y) >= -63) {
        if (rocketSpeed < 0) {
            rocketSpeed -= 0.2
        }
        if (rocketSpeed > 0 && rocketSpeed < 10) {
            console.log(rocketSpeed)
            rocketSpeed *= 1.04
        }
        rocketModel.rocket.position.y += rocketSpeed
        rocketModel.rocketFire.position.y += rocketSpeed
        rocketModel.camera.lookAt(rocketModel.rocket.position.x,
            rocketModel.rocket.position.y,rocketModel.rocket.position.z)
        rocketModel.camera.position.y += rocketSpeed
    }
    if (Math.floor(rocketModel.rocket.position.y) <= -64) { 
        rocketSpeed = 0
        rocketModel.rocket.position.y = -63
        rocketModel.removeRocketFire()
        rocketModel.rocketFire.position.y = -100
        rocketModel.camera.position.y = 0
    }
}

let activeCamera = cameras[camIndicator]
const controls = new OrbitControls(normalCamera, renderer.domElement)
controls.update()
render()