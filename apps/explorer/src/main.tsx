import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PreviewSimulation } from '@solar/simulation';
import { createPreviewScene } from '@solar/renderer';
import './styles.css';
function App(){
 const viewport=useRef<HTMLDivElement>(null),pausedRef=useRef(false),resetRef=useRef<()=>void>(()=>{});
 const [paused,setPaused]=useState(false),[error,setError]=useState('');
 useEffect(()=>{pausedRef.current=paused;},[paused]);
 useEffect(()=>{
  const host=viewport.current!;let controller:ReturnType<typeof createPreviewScene>;
  try{controller=createPreviewScene(host);}catch{setError('3D preview is unavailable. Enable WebGL or try another browser.');return;}
  const simulation=new PreviewSimulation();let frame=0,last=performance.now();
  resetRef.current=()=>{simulation.reset();controller.resetCamera();};
  const observer=new ResizeObserver(()=>controller.resize());observer.observe(host);
  const tick=(now:number)=>{const dt=Math.min((now-last)/1000,0.1);last=now;controller.render(simulation.advance(dt,pausedRef.current?0:1));frame=requestAnimationFrame(tick);};
  frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();controller.dispose();resetRef.current=()=>{};};
 },[]);
 return <main>
  <header><a className="brand" href="#"><span className="mark">◉</span><div>SOLAR SYSTEM<span className="subtitle">OBSERVATORY / ENGINEERING PREVIEW</span></div></a><span className="badge">P0 FOUNDATION</span></header>
  <section className="workspace"><aside>
   <p className="eyebrow">OUR COSMIC NEIGHBORHOOD</p><h1>A foundation for<br/>discovery.</h1><p className="intro">Explore an interactive preview while the scientific catalog and orbital engine take shape.</p>
   <div className="panel"><p className="eyebrow">PREVIEW SYSTEM</p><div className="body-row"><i className="sun"/>Sun<span>Star</span></div><div className="body-row"><i className="earth"/>Earth<span>Planet</span></div><div className="body-row"><i className="moon"/>Moon<span>Satellite</span></div></div>
   <div className="controls"><button onClick={()=>setPaused(p=>!p)} aria-pressed={paused}>{paused?'Resume preview':'Pause preview'}</button><button className="secondary" onClick={()=>resetRef.current()}>Reset view</button></div>
   <p className="notice">Illustrative preview. Sizes, distances and motion are exaggerated; this is not a scientific simulation.</p>
  </aside><div className="scene-wrap"><div className="viewport" ref={viewport}/>{error&&<div className="error" role="alert">{error}</div>}<div className="scene-caption">SUN / EARTH / MOON<span>Drag to orbit · Scroll or pinch to zoom</span></div></div></section>
  <footer><span>ENGLISH INTERFACE · MODULAR ENGINE</span><span>Scientific data integration begins in P1.</span></footer>
 </main>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
