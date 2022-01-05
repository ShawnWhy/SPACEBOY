import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { LoopOnce, SphereGeometry, TextureLoader } from 'three'
import CANNON, { Sphere } from 'cannon'
import $ from "./Jquery"

const textureLoader = new THREE.TextureLoader()


var audiobounce = new Audio('/glass.wav');

const playHitSound = (collision) =>
{
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()

    if(impactStrength > 10)
    {
        audiobounce.volume = Math.random()*.6
        audiobounce.currentTime = 0
        audiobounce.play()
    }
}



// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const portfolioButton=document.getElementsByClassName("portfolio");
const aboutButton = document.getElementsByClassName("about")
const  contactButton = document.getElementsByClassName("contact")
const  newsButton = document.getElementsByClassName("news")
const  fireButton = document.getElementsByClassName("fire")

$(fireButton).click(()=>{
    createMeteor(
        Math.random()*.5,
        {
            x: (Math.random() + 4) * 3,
            y: (Math.random()*6)-4,
            z: (Math.random() - 0.5) * 3
        }

    )
})

//raycaster
const raycaster = new THREE.Raycaster()

//cannon
console.log(CANNON)
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, - 9.82, 0)

const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 30,
        restitution: 0.1
    }
)
const bubbleShape = new CANNON.Sphere(5.6)
const bubbleBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, -8.3, 0),
    shape: bubbleShape,
    material: defaultMaterial
})
world.addBody(bubbleBody)
// const fakeEarthMaterial = new THREE.MeshStandardMaterial({color:'pink'})
// const fakeEarthGeometry = new THREE.SphereGeometry(5.6,20,20)
// const fakeEarthMesh = new THREE.Mesh(fakeEarthGeometry, fakeEarthMaterial)
// fakeEarthMesh.position.copy(bubbleBody.position)
// scene.add(fakeEarthMesh)
    
//physics floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.position=new CANNON.Vec3(0, -20, 0)
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1,0,0),
    Math.PI *0.5
)
world.addBody(floorBody)
//objects to update
const objectsToUpdate = []

// Create sphere
const sphereGeometry = new THREE.SphereGeometry(1, 8, 8)



const createMeteor = (radius, position) =>
{
    const spherecolor = function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

      console.log("fire")
      const sphereMaterial = new THREE.MeshStandardMaterial({emissive:spherecolor()})

    // Three.js mesh
    
    const mesh = new THREE.Mesh(star, sphereMaterial)
    mesh.scale.set(radius, radius, radius)
    mesh.rotation.y=Math.PI*.5
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannon.js body
    const shape = new CANNON.Sphere(radius)

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 5, 0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    body.applyForce(new CANNON.Vec3(- 2000, -500, 0), body.position)
    body.addEventListener('collide', playHitSound)

    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ mesh, body })
}

/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

})

const satTexture= textureLoader.load('/models/spaceboy/satelites.png')
const boyTexture= textureLoader.load('/models/spaceboy/spaceboy.png')
const earthTexture = textureLoader.load('/models/spaceboy/globe.png')
boyTexture.flipY = false
earthTexture.flipY= false
satTexture.flipY= false

const selectMaterial = new THREE.MeshBasicMaterial({color:'orange'})
const selectMaterial1 = new THREE.MeshBasicMaterial({color:'pink'})
const selectMaterial2 = new THREE.MeshBasicMaterial({color:'#89cff0'})
const selectMaterial3 = new THREE.MeshBasicMaterial({color:'#32CD32'})
const boyMaterial = new THREE.MeshBasicMaterial({map:boyTexture})
const earthMaterial = new THREE.MeshBasicMaterial({map:earthTexture})
const glassMaterial = new THREE.MeshBasicMaterial({map:boyTexture})
const satMaterial = new THREE.MeshBasicMaterial({map:satTexture})
glassMaterial.transparent=true;
glassMaterial.opacity=.3;


const mouse = new THREE.Vector2()
mouse.x = null
mouse.y=null

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1

    // console.log(mouse)
})

/**
 * Models
 */
// const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
// gltfLoader.setDRACOLoader(dracoLoader)
let rotation="on"
let mixer = null
let mixer2 = null
let satelites = null
let boy = null
let globe = null
let turnhead=null
let walk = null
let sateliteGroup=null
let star=null


gltfLoader.load(
    '/models/spaceboy/spaceboy.gltf',
    (gltf) =>
    {
        
   

        boy=gltf.scene
        // console.log(boy)

        boy.scale.set(0.25, 0.25, 0.25)
        scene.add(boy)
        boy.traverse((child)=>{
            child.material = boyMaterial
        })

        const glass = boy.children[0].children[0].children[1].children[0].children[1].children[0].children[0];
        glass.material=glassMaterial

            

        


        // Animation
        mixer = new THREE.AnimationMixer(boy)
        // console.log(mixer)
        turnhead = mixer.clipAction(gltf.animations[0]) 

        walk = mixer.clipAction(gltf.animations[1]) 
        // console.log(walk)
        walk.timeScale=2.5
        walk.clampWhenFinished=true
        walk.play()
        

    }
)

gltfLoader.load(
    '/models/spaceboy/earth2.glb',
    (gltf) =>
    {   
        globe=gltf.scene
        globe.traverse((child) =>
        {
            child.material = earthMaterial
        })
        globe.scale.set(0.25, 0.25, 0.25)
        scene.add(globe)
        // console.log(globe)
       


    }
)

gltfLoader.load(
    '/models/spaceboy/satelites.gltf',
    (gltf) =>
    {   
        satelites=gltf.scene
        satelites.traverse((child) =>
        {
            child.material = satMaterial
        })
        star = satelites.children[3].geometry
        console.log(star) 

        satelites.scale.set(0.15, 0.15, 0.15)
        
        
        sateliteGroup = new THREE.Group()
        sateliteGroup.add(satelites)
        sateliteGroup.rotation.z = Math.PI*.2
        sateliteGroup.position.x=-3
        scene.add(sateliteGroup)
        console.log("satelites", satelites)
       


    }
)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('orange', .5)
scene.add(ambientLight)

// const directionalLight = new THREE.DirectionalLight('orange', 2)
// directionalLight.castShadow = true
// directionalLight.shadow.mapSize.set(1024, 1024)
// directionalLight.shadow.camera.far = 15
// directionalLight.shadow.camera.left = - 7
// directionalLight.shadow.camera.top = 7
// directionalLight.shadow.camera.right = 7
// directionalLight.shadow.camera.bottom = - 7
// directionalLight.position.set(- 5, 5, 0)
// scene.add(directionalLight)




/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(3, 0, 8)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(4, -4, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setClearColor( 'orange',.5);

// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

raycaster.setFromCamera(mouse, camera)



$(portfolioButton).mouseover(()=>{
    rotation="off"
    sateliteGroup.children[0].rotation.y=Math.PI*.30
    turnhead.weight=1
    turnhead.timeScale=3
    turnhead.reset();
    turnhead.clampWhenFinished=true
    turnhead.setLoop(THREE.LoopOnce)
    turnhead.play()
    sateliteGroup.children[0].children[3].material=selectMaterial

})
$(aboutButton).mouseover(()=>{
    rotation="off"
    sateliteGroup.children[0].rotation.y=Math.PI*.75
    turnhead.weight=1
    turnhead.timeScale=3
    turnhead.reset();
    turnhead.clampWhenFinished=true
    turnhead.setLoop(THREE.LoopOnce)
    turnhead.play()
    sateliteGroup.children[0].children[1].material=satMaterial
    sateliteGroup.children[0].children[2].material=satMaterial
    sateliteGroup.children[0].children[3].material=satMaterial


    sateliteGroup.children[0].children[0].children[0].material=selectMaterial2
    sateliteGroup.children[0].children[0].children[1].material=selectMaterial2
    sateliteGroup.children[0].children[0].children[2].material=selectMaterial2

})
$(contactButton).mouseover(()=>{
    rotation="off"
    sateliteGroup.children[0].rotation.y=Math.PI*1.25
    turnhead.weight=1
    turnhead.timeScale=3
    turnhead.reset();
    turnhead.clampWhenFinished=true
    turnhead.setLoop(THREE.LoopOnce)
    turnhead.play()
    sateliteGroup.children[0].children[2].material=satMaterial
    sateliteGroup.children[0].children[3].material=satMaterial
    sateliteGroup.children[0].children[0].children[0].material=satMaterial
    sateliteGroup.children[0].children[0].children[1].material=satMaterial
    sateliteGroup.children[0].children[0].children[2].material=satMaterial
    sateliteGroup.children[0].children[1].material=selectMaterial3

})
$(newsButton).mouseover(()=>{
    rotation="off"
    sateliteGroup.children[0].rotation.y=Math.PI*1.75
    turnhead.weight=1
    turnhead.timeScale=3
    turnhead.reset();
    turnhead.clampWhenFinished=true
    turnhead.setLoop(THREE.LoopOnce)
    sateliteGroup.children[0].children[1].material=satMaterial
    sateliteGroup.children[0].children[3].material=satMaterial
    sateliteGroup.children[0].children[0].children[0].material=satMaterial
    sateliteGroup.children[0].children[0].children[1].material=satMaterial
    sateliteGroup.children[0].children[0].children[2].material=satMaterial
    sateliteGroup.children[0].children[2].material=selectMaterial1
    turnhead.play()

})

$(".button").mouseout(()=>{
    
    turnhead.weight=0
    turnhead.timeScale=-1;
    
    turnhead.clampWhenFinished=true

    turnhead.weight=0;
    sateliteGroup.children[0].children[1].material=satMaterial
    sateliteGroup.children[0].children[2].material=satMaterial
    sateliteGroup.children[0].children[3].material=satMaterial


    sateliteGroup.children[0].children[0].children[0].material=satMaterial
    sateliteGroup.children[0].children[0].children[1].material=satMaterial
    sateliteGroup.children[0].children[0].children[2].material=satMaterial
    turnhead.play()

    rotation="on"


})
/**
 * Animate
 */

let oldElapsedTime=null;

const clock = new THREE.Clock()
let previousTime = 0
const tick = () =>





   
{
    for(const object of objectsToUpdate)
    {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }
    
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    world.step(1 / 60, deltaTime, 3)



   


    // if(box != null){
    // const intersects = raycaster.intersectObject(box.children[0].children[0])
    


    // if(intersects.length>0){

    //       box.children[0].children[1].children[0].material.color.set("yellow")
    //       console.log(intersects)
          
            
    //     }
    // else{

        
    //     box.children[0].children[1].children[0].material.color.set("violet")


    // }


    // }

    if(rotation==="on"){

    if(globe){
    globe.children[1].rotation.x-=.005

    }

    if(satelites){
        
        sateliteGroup.children[0].rotation.y+=.005
        sateliteGroup.children[0].children[0].rotation.z+=.015
        sateliteGroup.children[0].children[2].rotation.x+=.015
        sateliteGroup.children[0].children[3].rotation.x+=.015


        sateliteGroup.children[0].children[0].children[1].rotation.z+=.005
        sateliteGroup.children[0].children[0].children[2].rotation.z+=.005

        sateliteGroup.children[0].children[1].rotation.z+=.02

        
    }
}
    for(const object of objectsToUpdate)
    {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
        // object.body.applyForce(new CANNON.Vec3(- 10, 0, 0), object.body.position)
    }

    if(mixer)
    {
        mixer.update(deltaTime)
    }

    controls.update()



    
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()