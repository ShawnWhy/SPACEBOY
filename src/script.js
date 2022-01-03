import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { SphereGeometry, TextureLoader } from 'three'
import CANNON from 'cannon'
import $ from "./Jquery"

const textureLoader = new THREE.TextureLoader()


//debug



const openButton=document.getElementsByClassName("open");
const closeButton = document.getElementsByClassName("close")
const moreButton = document.getElementsByClassName("more")

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
        friction: 0.8,
        restitution: 0.1
    }
)
const bubbleShape = new CANNON.Sphere(3)
const bubbleBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, -1.5, 0),
    shape: bubbleShape,
    material: defaultMaterial
})


world.addBody(bubbleBody)

    
//physics floor
// const floorShape = new CANNON.Plane()
// const floorBody = new CANNON.Body()
// floorBody.mass = 0
// floorBody.quaternion.setFromAxisAngle(
//     new CANNON.Vec3(-1,0,0),
//     Math.PI *0.5
// )
//objects to update
const objectsToUpdate = []

//createbox

// const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
// const boxMaterial1 = new THREE.MeshStandardMaterial({
//    map:wrapperTexture1
// })
// const boxMaterial2 = new THREE.MeshStandardMaterial({
//     map:wrapperTexture2
//  })
//  const boxMaterial3 = new THREE.MeshStandardMaterial({
//     map:wrapperTexture3
//  })
//  const boxMaterial4 = new THREE.MeshStandardMaterial({
//     map:wrapperTexture4
//  })

// const createBox = (width, height, depth, position,rand) =>
// {
//     // Three.js mesh
//     const mesh = new THREE.Mesh()
//     switch(rand){
//         case 1:
//             mesh.material = boxMaterial1
//         break;
//         case 2:
//             mesh.material = boxMaterial2
//         break;
//         case 3:
//             mesh.material = boxMaterial3
//         break;
//         case 4:
//             mesh.material = boxMaterial4
//         break;
//     }
    
    
//     mesh.geometry=boxGeometry
//     mesh.scale.set(width, height, depth)
//     mesh.castShadow = true
//     mesh.position.copy(position)
//     mesh.geometry.computeBoundingBox();
//     var max = mesh.geometry.boundingBox.max;
//     var min = mesh.geometry.boundingBox.min;
//     var height = max.y - min.y;
//     var width = max.x - min.x;
//     wrapperTexture3.repeat.set(width / 1 , height / 1);
//     wrapperTexture3.needsUpdate = true;
//     scene.add(mesh)

//     // Cannon.js body
//     const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))

//     const body = new CANNON.Body({
//         mass: 1,
//         position: new CANNON.Vec3(0, 10, 0),
//         shape: shape,
//         material: defaultMaterial
//     })
//     body.position.copy(position)
//     body.addEventListener('collide', playHitSound)

//     world.addBody(body)

//     // Save in objects
//     objectsToUpdate.push({ mesh, body })
// }

// createBox(1, 1.5, 2, { x: 0, y: 3, z: 0 })




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

const boyTexture= textureLoader.load('/models/spaceboy/satelites.png')
const boyTexture= textureLoader.load('/models/spaceboy/spaceboy.png')
const earthTexture = textureLoader.load('/models/spaceboy/globe.png')
boyTexture.flipY = false
earthTexture.flipY= false

const boyMaterial = new THREE.MeshBasicMaterial({map:boyTexture})
const earthMaterial = new THREE.MeshBasicMaterial({map:earthTexture})
const glassMaterial = new THREE.MeshBasicMaterial({map:boyTexture})
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
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()






/**
 * Models
 */
// const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
// gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null
let mixer2 = null
let satelites = null
let boy = null
let globe = null
let turnhead=null
let walk = null



gltfLoader.load(
    '/models/spaceboy/spaceboy.gltf',
    (gltf) =>
    {
        
   

        boy=gltf.scene
        console.log(boy)

        boy.scale.set(0.25, 0.25, 0.25)
        scene.add(boy)
        boy.traverse((child)=>{
            child.material = boyMaterial
        })

        const glass = boy.children[0].children[0].children[1].children[0].children[1].children[0].children[0];
        glass.material=glassMaterial

            

        


        // Animation
        mixer = new THREE.AnimationMixer(boy)
        console.log(mixer)
        turnhead = mixer.clipAction(gltf.animations[0]) 

        walk = mixer.clipAction(gltf.animations[1]) 
        console.log(walk)
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
        console.log(globe)
       


    }
)

gltfLoader.load(
    '/models/spaceboy/satelites.gltf',
    (gltf) =>
    {   
        satelites=gltf.scene
        satelites.traverse((child) =>
        {
            child.material = earthMaterial
        })
        satelites.scale.set(0.25, 0.25, 0.25)
        satelites.rotation.z=Math.PI*.2
        scene.add(satelites)
        console.log("satelites", satelites)
       


    }
)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('white', .5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('orange', 2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(- 5, 5, 0)
scene.add(directionalLight)




/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(3, 0, 8)
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.target.set(4, -4, 0)
// controls.enableDamping = true

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


    if(globe){
    globe.children[1].rotation.x-=.005

    }

    if(mixer)
    {
        mixer.update(deltaTime)
    }

    // controls.update()



    
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()