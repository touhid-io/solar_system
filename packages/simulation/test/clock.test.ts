import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PreviewSimulation } from '../src/index';
test('motion depends on elapsed time rather than frame count',()=>{
 const a=new PreviewSimulation(),b=new PreviewSimulation();
 for(let i=0;i<30;i++)a.advance(1/30);
 for(let i=0;i<120;i++)b.advance(1/120);
 assert.ok(Math.abs(a.snapshot().elapsedSeconds-b.snapshot().elapsedSeconds)<1e-12);
 a.snapshot().bodies.forEach((body,i)=>body.position.forEach((v,j)=>assert.ok(Math.abs(v-b.snapshot().bodies[i].position[j])<1e-10)));
});
test('pause, reverse and reset use explicit simulation time',()=>{
 const s=new PreviewSimulation();s.advance(2);s.advance(5,0);assert.equal(s.snapshot().elapsedSeconds,2);s.advance(2,-1);assert.deepEqual(s.snapshot(),s.reset());
});
test('rejects invalid clock input',()=>{const s=new PreviewSimulation();for(const dt of [-1,NaN,Infinity])assert.throws(()=>s.advance(dt),RangeError);assert.throws(()=>s.advance(1,NaN),RangeError);});
