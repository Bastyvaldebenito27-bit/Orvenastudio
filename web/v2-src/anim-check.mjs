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

// 1 — with the module
let {p,errs}=await open('preview.html');
await p.waitForTimeout(400);
await p.screenshot({path:P+'/a1-early.png'});
await p.waitForTimeout(1100);
await p.screenshot({path:P+'/a2-mid.png'});
await p.waitForTimeout(3200);
await p.screenshot({path:P+'/a3-final.png'});
const st=await p.evaluate(()=>({
  registered:!!document.getElementById('ins-anim-intro'),
  units:document.querySelectorAll('.ins-u').length,
  visible:[...document.querySelectorAll('.ins-u')].filter(u=>getComputedStyle(u).opacity==='1').length,
  lines:document.querySelectorAll('.ins-stage .ins-l').length,
  motes:document.querySelectorAll('.ins-mote').length,
  brandText:document.querySelector('.intro__brand').textContent,
  lineText:document.querySelector('#intro-line').textContent.trim(),
  boldKept:!!document.querySelector('#intro-line b'),
}));
console.log('CON modulo:',JSON.stringify(st));

// language change must re-split and replay
await p.evaluate(()=>window.INSIDUS.setLang('ja',false));
await p.waitForTimeout(4200);
const ja=await p.evaluate(()=>({units:document.querySelectorAll('.ins-u').length,
  visible:[...document.querySelectorAll('.ins-u')].filter(u=>getComputedStyle(u).opacity==='1').length,
  brand:document.querySelector('.intro__brand').textContent,
  line:document.querySelector('#intro-line').textContent.trim().slice(0,20)}));
console.log('tras cambiar a JA:',JSON.stringify(ja));
console.log('errores:',errs.length?errs.slice(0,3):'ninguno');
await p.context().close();

// 2 — module deleted: the page must be identical and complete
const r2=await open('preview-noanim.html');
await r2.p.waitForTimeout(2500);
const no=await r2.p.evaluate(()=>({
  units:document.querySelectorAll('.ins-u').length,
  brandVisible:getComputedStyle(document.querySelector('.intro__brand')).opacity,
  brand:document.querySelector('.intro__brand').textContent,
  line:document.querySelector('#intro-line').textContent.trim().slice(0,26),
  slotEmpty:document.querySelector('#cinematic-intro .slot').children.length===0}));
console.log('SIN modulo:',JSON.stringify(no),'errores:',r2.errs.length?r2.errs.slice(0,2):'ninguno');
await r2.p.screenshot({path:P+'/a4-sinmodulo.png'});
await r2.p.context().close();

// 3 — reduced motion: final frame, no loop
const r3=await open('preview.html',{reducedMotion:'reduce'});
await r3.p.waitForTimeout(1200);
const rm=await r3.p.evaluate(()=>({
  units:document.querySelectorAll('.ins-u').length,
  hidden:[...document.querySelectorAll('.ins-u')].filter(u=>+getComputedStyle(u).opacity<1).length,
  motes:document.querySelectorAll('.ins-mote').length,
  light:document.querySelectorAll('.ins-light').length}));
console.log('REDUCED MOTION:',JSON.stringify(rm),'errores:',r3.errs.length?r3.errs.slice(0,2):'ninguno');
await r3.p.screenshot({path:P+'/a5-reduced.png'});
await b.close();
