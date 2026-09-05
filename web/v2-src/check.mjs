import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const P='/home/user/insidus-site';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
const p=await b.newPage({viewport:{width:1440,height:900}});
p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
p.on('console',m=>{if(m.type()==='error'&&!/favicon|ERR_CONNECTION|net::/.test(m.text()))errs.push(m.text());});
await p.goto('file://'+P+'/preview.html',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(2500);

const s=await p.evaluate(()=>({
  lang:document.documentElement.lang,
  title:document.title,
  desc:document.querySelector('meta[name=description]')?.content?.slice(0,50),
  og:document.querySelector('meta[property="og:title"]')?.content?.slice(0,40),
  hreflang:document.querySelectorAll('link[data-hreflang]').length,
  navItems:[...document.querySelectorAll('#nav-links a')].map(a=>a.textContent).join('/'),
  products:document.querySelectorAll('.product').length,
  stages:document.querySelectorAll('.stage').length,
  pairs:document.querySelectorAll('.pair').length,
  slots:[...document.querySelectorAll('[data-anim-slot]')].map(n=>n.id||n.getAttribute('data-anim-slot')).join(','),
  stageCollapsed:[...document.querySelectorAll('.anim-stage')].every(n=>n.getBoundingClientRect().height===0),
  formFields:document.querySelectorAll('.field').length,
  langOptions:document.querySelectorAll('#lang-menu a').length,
}));
console.log(JSON.stringify(s,null,1));

// contrast across every text role, against the real painted ancestor
const rows=await p.evaluate(()=>{
  const solid=e=>{for(let n=e;n;n=n.parentElement){const c=getComputedStyle(n).backgroundColor;
    const m=c.match(/[\d.]+/g); if(m&&(m.length<4||parseFloat(m[3])>0.95))return c;}
    return getComputedStyle(document.body).backgroundColor;};
  const out=[];
  for(const sel of ['.tag','.tag--accent','.num','.coord','.lead','.body','.intro__brand',
                    '.intro__line','.product__name','.product__trade','.product__bino',
                    '.stage__t','.stage__b','.pair__t','.pair__b','.nav__links a',
                    '.field label','.submit','.direct__k','.foot__col a','.foot__base',
                    '.reach__list li','.editable']){
    const e=document.querySelector(sel); if(!e) continue;
    const st=getComputedStyle(e);
    out.push({sel,fg:st.color,bg:solid(e),size:parseFloat(st.fontSize),w:st.fontWeight});
  }
  return out;
});
const lin=c=>{c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)};
const L=s=>{const m=s.match(/[\d.]+/g).map(Number);return .2126*lin(m[0])+.7152*lin(m[1])+.0722*lin(m[2])};
const R=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
console.log('\ncontraste:');
let bad=0;
for(const r of rows){
  const large=r.size>=24||(r.size>=18.66&&+r.w>=700);
  const need=large?3:4.5, v=R(r.fg,r.bg), ok=v>=need;
  if(!ok)bad++;
  console.log(`  ${r.sel.padEnd(18)} ${String(Math.round(r.size)).padStart(3)}px ${v.toFixed(2).padStart(6)}:1 ${ok?'OK':'*** FALLA'}`);
}
console.log(bad?`${bad} fallo(s)`:'todos OK');

// languages
for(const l of ['zh','ja','ko','de']){
  await p.evaluate(x=>window.INSIDUS.setLang(x,false),l);
  await p.waitForTimeout(450);
  const r=await p.evaluate(()=>({lang:document.documentElement.lang,
     t:document.title.slice(0,28), nav:document.querySelector('#nav-links a')?.textContent,
     stage:document.querySelector('.stage__t')?.textContent}));
  console.log(l,'->',JSON.stringify(r));
}
console.log('\nerrores:',errs.length?errs.slice(0,4):'ninguno');

// responsive
for(const w of [375,768,1024,1440]){
  const q=await b.newPage({viewport:{width:w,height:820}});
  await q.goto('file://'+P+'/preview.html',{waitUntil:'domcontentloaded'});
  await q.waitForTimeout(1500);
  const o=await q.evaluate(()=>({ovf:document.documentElement.scrollWidth>innerWidth,
    navHidden:getComputedStyle(document.querySelector('.nav__links')).display==='none',
    toggle:getComputedStyle(document.querySelector('#menu-open')).display!=='none'}));
  console.log(`  ${String(w).padStart(5)}px overflow:${o.ovf?'SI':'no'} menu-movil:${o.toggle}`);
  await q.close();
}
await b.close();
