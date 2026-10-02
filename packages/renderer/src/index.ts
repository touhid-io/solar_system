import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { previewBodies } from '@solar/catalog';
import type { BodyId, SimulationSnapshot } from '@solar/shared';
export interface SceneController { render(snapshot: SimulationSnapshot): void; resize(): void; resetCamera(): void; dispose(): void }
export function createPreviewScene(host: HTMLElement): SceneController {
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.domElement.setAttribute('aria-label','Interactive illustrative Sun, Earth and Moon scene');
 host.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x070b14);
 const camera=new THREE.PerspectiveCamera(45,1,0.1,1000);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=10;controls.maxDistance=120;
 const resetCamera=()=>{camera.position.set(38,32,48);controls.target.set(0,0,0);controls.update();};resetCamera();
 scene.add(new THREE.AmbientLight(0xc6dbff,0.3));
 scene.add(new THREE.PointLight(0xffe4ba,1800,0,2));
 const meshes=new Map<BodyId,THREE.Mesh>();
 for(const body of previewBodies){
  const material=body.id==='sun'?new THREE.MeshBasicMaterial({color:body.color}):new THREE.MeshStandardMaterial({color:body.color,roughness:0.85});
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(body.displayRadius,48,24),material);scene.add(mesh);meshes.set(body.id,mesh);
 }
 const points=Array.from({length:257},(_,i)=>new THREE.Vector3(Math.cos(i/256*Math.PI*2)*22,0,Math.sin(i/256*Math.PI*2)*22));
 scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x34506e,transparent:true,opacity:0.6})));
 const starPositions=new Float32Array(1200*3);
 // Seeded decorative sky ensures repeatable P0 fixtures.
 let seed=17;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<1200;i++){const az=random()*Math.PI*2,y=random()*2-1,r=Math.sqrt(1-y*y);starPositions.set([Math.cos(az)*r*180,y*180,Math.sin(az)*r*180],i*3);}
 const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.BufferAttribute(starPositions,3));scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xa6b8d8,size:0.3})));
 const resize=()=>{const width=Math.max(host.clientWidth,1),height=Math.max(host.clientHeight,1);renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};resize();
 return {resize,resetCamera,render(snapshot){for(const body of snapshot.bodies){const mesh=meshes.get(body.id)!;mesh.position.set(...body.position);mesh.rotation.y=body.spin;}controls.update();renderer.render(scene,camera);},dispose(){controls.dispose();scene.traverse(object=>{if(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points){object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();}};
}
