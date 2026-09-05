import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const P='/home/user/insidus-site';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

async function open(file, opts={}){
  const ctx=await b.newContext({viewport:{width:1440,height:900},...opts});
  const p=await ctx.newPage();
  const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/net::|favicon/.test(m.text()))errs.push(m.text());});
  await p.goto('file://'+P+'/'+file,{waitUntil:'networkidle',timeout:60000});
  return {p,errs};
}
// count non-transparent pixels the canvas actually painted
const PAINT = `(()=>{const c=document.querySelector('#global-map canvas');
  if(!c) return null;
  const g=c.getContext('2d'); const d=g.getImageData(0,0,c.width,c.height).data;
  let n=0; for(let i=3;i<d.length;i+=4) if(d[i]>8) n++;
  return {w:c.width,h:c.height,painted:n};})()`;

// 1 — with the module
let {p,errs}=await open('preview.html');
await p.evaluate(()=>document.querySelector('#global-map').scrollIntoView({block:'center'}));
await p.waitForTimeout(900);
const f1=await p.evaluate(PAINT);
await p.waitForTimeout(1500);
const f2=await p.evaluate(PAINT);
const st=await p.evaluate(()=>{
  const s=document.querySelector('#global-map');
  const lab=s.querySelector('.coord');
  const r=s.getBoundingClientRect(), lr=lab.getBoundingClientRect();
  return {live:s.classList.contains('ins-map-live'),
          canvases:s.querySelectorAll('canvas').length,
          labelText:lab.textContent,
          labelOffCentre:(lr.top-r.top)/r.height>0.7,
          styleTag:!!document.getElementById('ins-anim-map')};
});
console.log('CON modulo:',JSON.stringify({...st,frame1:f1,frame2:f2,moving:f1.painted!==f2.painted}));
await p.evaluate(()=>document.querySelector('#global-map').scrollIntoView({block:'center'}));
await p.screenshot({path:P+'/m1-globe.png'});
await p.evaluate(()=>window.INSIDUS.setLang('zh',false));
await p.waitForTimeout(1200);
const zh=await p.evaluate(()=>({canvases:document.querySelectorAll('#global-map canvas').length,
  label:document.querySelector('#global-map .coord').textContent,
  live:document.querySelector('#global-map').classList.contains('ins-map-live')}));
console.log('tras cambiar a ZH:',JSON.stringify(zh), 'pintado:',JSON.stringify(await p.evaluate(PAINT)));
console.log('errores:',errs.length?errs.slice(0,3):'ninguno');
await p.context().close();

// 2 — module deleted
const r2=await open('preview-noanim.html');
await r2.p.waitForTimeout(800);
const no=await r2.p.evaluate(()=>{const s=document.querySelector('#global-map');
  const lab=s.querySelector('.coord'); const r=s.getBoundingClientRect(), lr=lab.getBoundingClientRect();
  return {slotEmpty:s.querySelector('.slot').children.length===0,
          label:lab.textContent, live:s.classList.contains('ins-map-live'),
          labelCentred:Math.abs((lr.top+lr.height/2-r.top)/r.height-0.5)<0.12,
          height:Math.round(r.height)};});
console.log('SIN modulo:',JSON.stringify(no),'errores:',r2.errs.length?r2.errs.slice(0,2):'ninguno');
await r2.p.evaluate(()=>document.querySelector('#global-map').scrollIntoView({block:'center'}));
await r2.p.screenshot({path:P+'/m2-sinmodulo.png'});
await r2.p.context().close();

// 3 — reduced motion: one static frame, no loop
const r3=await open('preview.html',{reducedMotion:'reduce'});
await r3.p.evaluate(()=>document.querySelector('#global-map').scrollIntoView({block:'center'}));
await r3.p.waitForTimeout(700);
const g1=await r3.p.evaluate(PAINT);
await r3.p.waitForTimeout(2000);
const g2=await r3.p.evaluate(PAINT);
console.log('REDUCED:',JSON.stringify({g1,g2,static:g1.painted===g2.painted}),
            'errores:',r3.errs.length?r3.errs.slice(0,2):'ninguno');
await r3.p.screenshot({path:P+'/m3-reduced.png'});
await r3.p.context().close();

// 4 — mobile
const r4=await open('preview.html',{viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await r4.p.evaluate(()=>document.querySelector('#global-map').scrollIntoView({block:'center'}));
await r4.p.waitForTimeout(1200);
console.log('MOVIL:',JSON.stringify(await r4.p.evaluate(PAINT)),'errores:',r4.errs.length?r4.errs.slice(0,2):'ninguno');
await r4.p.screenshot({path:P+'/m4-movil.png'});
await b.close();
