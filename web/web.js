import {setupMotion, enterDetail, reducedMotion} from './motion.js';
import {drawGlobe} from './globe.js';
import {peopleSeed, sourceSeed, memorySeed} from './demo.js';

const $ = selector => document.querySelector(selector);
const make = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const places = [
  {name:'泉州 · 南安', short:'南安', lon:118.39, lat:24.96, date:'1924 · 出生地', source:'s1', note:'谱页记有祖籍与出生地，是这组寻根线索的起点。'},
  {name:'金门', short:'金门', lon:118.32, lat:24.43, date:'约 1948 · 年份待核', source:'s3', note:'家人口述提及金门，具体年份和行程仍需补证。'},
  {name:'台南', short:'台南', lon:120.20, lat:22.99, date:'1962 · 家书通信地', source:'s2', note:'家书可帮助确认通信地点，具体迁居时间仍待核对。'}
];
const views = {world:[0,14,360,155],region:[119,30,54,37],local:[119.3,24.05,5.8,3.4]};
let view = 'globe';
let camera = views.world;
let flight = 0;
let flightFrame = 0;
let flying = false;
let activePlace = 0;
let land;
const workspaceKey = 'jiaxu-web-workspace-v1';
let people = peopleSeed;
let memories = memorySeed;
let sources = sourceSeed;

function readWorkspace() {
  try {
    const saved = JSON.parse(localStorage.getItem(workspaceKey));
    people = Array.isArray(saved?.people) && saved.people.length ? saved.people : peopleSeed;
    memories = Array.isArray(saved?.memories) ? saved.memories : memorySeed;
    sources = Array.isArray(saved?.sources) ? saved.sources : sourceSeed;
  } catch {
    // Keep the reading copy available when browser storage is unavailable.
  }
}
readWorkspace();
let personTab = 'bio';
let personId = people.some(p => p.id === 'p3') ? 'p3' : people[0]?.id;
const canvas = $('#map');
const ctx = canvas.getContext('2d');
const pins = $('#markers');

function drawMap() {
  const globe = view === 'globe';
  if (globe && land) drawGlobe($('#globe'),land);
  const {width, height} = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(ratio,0,0,ratio,0,0);
  const [centerX,centerY,spanX,spanY] = camera;
  const scale = Math.min(width/spanX,height/spanY);
  const project = (lon,lat) => [width/2+(lon-centerX)*scale,height/2-(lat-centerY)*scale];
  ctx.fillStyle = '#e2ebe4';
  ctx.fillRect(0,0,width,height);
  const grid = spanX > 100 ? 30 : spanX > 15 ? 10 : 1;
  ctx.strokeStyle = '#c9d8cd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let lon=-180;lon<=180;lon+=grid) {
    const [x] = project(lon,0);
    ctx.moveTo(x,0);ctx.lineTo(x,height);
  }
  for (let lat=-90;lat<=90;lat+=grid) {
    const [,y] = project(0,lat);
    ctx.moveTo(0,y);ctx.lineTo(width,y);
  }
  ctx.stroke();
  ctx.fillStyle = '#aabda1';
  ctx.strokeStyle = '#91a78b';
  for (const feature of land?.features ?? []) {
    const {type,coordinates} = feature.geometry;
    for (const polygon of type === 'Polygon' ? [coordinates] : coordinates) {
      for (const offset of spanX > 100 ? [-360,0,360] : [0]) {
        ctx.beginPath();
        for (const ring of polygon) {
          ring.forEach(([lon,lat],i) => {
            const [x,y] = project(lon+offset,lat);
            if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
          });
          ctx.closePath();
        }
        ctx.fill('evenodd');ctx.stroke();
      }
    }
  }
  const points = places.map(p => project(p.lon,p.lat));
  if (view === 'local' && !flying) {
    ctx.beginPath();
    points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.setLineDash([6,5]);ctx.lineWidth = 2;
    ctx.strokeStyle = '#986037';ctx.stroke();ctx.setLineDash([]);
  }
  if (flying) return;
  pins.replaceChildren();
  const indices = view === 'local' ? [0,1,2] : [activePlace];
  for (const i of indices) {
    const pin = make('button',null,'map-pin');
    const group = view !== 'local';
    const label = group ? '闽台 · 3 处地点' : places[i].short;
    pin.append(make('span',label));
    pin.style.left = globe ? '50%' : points[i][0]+'px';
    pin.style.top = globe ? '50%' : points[i][1]+'px';
    pin.dataset.label = String(group || i !== 1);
    pin.setAttribute('aria-pressed',String(!group && i === activePlace));
    pin.setAttribute('aria-label',group ? (globe ? '进入世界地图' : '放大查看闽台三处地点') : '查看'+label);
    pin.onclick = () => {
      if (globe) { setView('world',true); return; }
      if (group) setView('local',true);
      selectPlace(i);
      if (!flying) pins.querySelector('[aria-pressed=true]')?.focus();
    };
    pins.append(pin);
  }
}
function setView(next, restorePinFocus = false) {
  if (next === view && flying) return;
  const previous = view;
  view = next;
  const wrap = $('.map-wrap');
  wrap.dataset.mode = next;
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.view===view)));
  cancelAnimationFrame(flightFrame);
  const target = views[next] ?? views.world;
  const start = camera;
  const finish = () => {
    camera = target;
    flying = false;
    pins.inert = false;
    wrap.classList.remove('flying');
    drawMap();
    if (restorePinFocus) (pins.querySelector('[aria-pressed=true]') ?? pins.querySelector('button'))?.focus({preventScroll:true});
  };
  if (next === 'globe' || previous === next || reducedMotion.matches ||
      start.every((value,i) => value === target[i])) {
    finish();
    return;
  }
  const started = performance.now();
  const id = ++flight;
  flying = true;
  pins.inert = true;
  wrap.classList.add('flying');
  const step = now => {
    if (id !== flight) return;
    const progress = Math.min(1,(now-started)/840);
    const eased = progress * progress * (3-2*progress);
    camera = start.map((value,i) => i < 2
      ? value+(target[i]-value)*eased
      : value*Math.pow(target[i]/value,eased));
    drawMap();
    if (progress < 1) flightFrame = requestAnimationFrame(step);
    else finish();
  };
  flightFrame = requestAnimationFrame(step);
}
function selectPlace(index) {
  activePlace = index;
  const place = places[index];
  const source = sourceSeed.find(s => s.id === place.source);
  const choices = places.map((p,i) => {
    const button = make('button',p.short);
    button.setAttribute('aria-pressed',String(i===index));
    button.onclick = () => {
      setView('local');
      selectPlace(i);
      $('#places [aria-pressed=true]').focus();
    };
    return button;
  });
  $('#places').replaceChildren(...choices);
  const link = make('a','查看史料对照 ↓','detail-link');
  link.href = '#records';
  link.onclick = () => {
    $('#record-a').value = source.id;
    $('#record-a').onchange();
  };
  $('#place-detail').replaceChildren(make('p',place.date,'meta'),make('h2',place.name),make('p',place.note),make('blockquote',source.quote),make('p',source.title,'meta'),link);
  enterDetail($('#place-detail'));
  drawMap();
}

function renderPeople(animate = false) {
  const query = $('#search').value.trim().toLowerCase();
  const matches = people.filter(p => [p.name,p.place,p.origin].some(field => String(field ?? '').toLowerCase().includes(query)));
  const list = $('#people-list');
  list.replaceChildren(...matches.map(p => {
    const button = make('button',p.name,'person-button');
    button.dataset.person = p.id;
    button.setAttribute('aria-pressed',String(p.id === personId));
    button.onclick = () => { personId = p.id; personTab = 'bio'; renderPeople(true); list.querySelector('[aria-pressed=true]')?.focus(); };
    return button;
  }));
  if (!matches.length) list.append(make('p','未找到匹配人物。','meta'));
  const person = people.find(p => p.id===personId);
  if (!person) return;
  renderPersonDetail(person,animate);
}

function renderPersonDetail(person, animate = false) {
  const heading = make('h3',person.name);
  heading.tabIndex = -1;
  const tabs = make('div',null,'person-tabs');
  tabs.setAttribute('role','group');
  tabs.setAttribute('aria-label','人物档案分类');
  const detail = make('div');
  for (const [key,label] of [['bio','生平'],['family','亲属'],['sources','来源'],['memories','记忆']]) {
    const button = make('button',label);
    button.dataset.tab = key;
    button.setAttribute('aria-pressed',String(personTab===key));
    button.onclick = () => {
      personTab = key;
      renderPersonDetail(person,true);
      document.querySelector('.person-tabs [aria-pressed=true]').focus({preventScroll:true});
    };
    tabs.append(button);
  }
  if (personTab === 'bio') detail.append(make('p',person.bio || '暂无生平记述。'));
  if (personTab === 'family') {
    const relations = make('div',null,'relations');
    const relatives = [['父亲',person.father],['母亲',person.mother],['配偶',person.spouse],
      ...people.filter(p => p.father===person.id || p.mother===person.id).map(p => ['子女',p.id])];
    for (const [label,id] of relatives) {
      const relative = people.find(p => p.id===id);
      if (!relative) continue;
      const button = make('button',label+' · '+relative.name);
      button.onclick = () => {
        personId = id;
        $('#search').value = '';
        renderPeople(true);
        $('#person-detail h3').focus({preventScroll:true});
      };
      relations.append(button);
    }
    detail.append(relations.childElementCount ? relations : make('p','暂无关联亲属。'));
  }
  if (personTab === 'sources' || personTab === 'memories') {
    const items = (personTab === 'sources' ? sources : memories).filter(item => item.person===person.id);
    for (const item of items) {
      const row = make('article',null,'person-material');
      row.append(make('strong',item.title),make('p',item.year+' · '+item.desc,'meta'));
      if (item.quote) {
        row.append(make('blockquote',item.quote));
        const link = make('a','打开史料对照 ↓','detail-link');
        link.href = '#records';
        link.onclick = () => { $('#record-a').value = item.id; $('#record-a').onchange(); };
        row.append(link);
      } else if (item.body) row.append(make('p',item.body));
      detail.append(row);
    }
    if (!items.length) detail.append(make('p',personTab === 'sources' ? '暂无关联来源。' : '暂无关联记忆。'));
  }
  $('#person-detail').replaceChildren(make('p','人物资料','eyebrow'),heading,
    make('p',[person.birth,person.death,person.place].filter(Boolean).join(' · ') || '年代与地点待补','meta'),tabs,detail);
  if (animate) enterDetail(detail);
}

function renderRecords() {
  const options = [...new Map([...sourceSeed,...sources].map(source => [source.id,source])).values()];
  const cards = sourceSeed.slice(0,2).map((initial,index) => {
    const card = make('article',null,'record');
    const select = make('select');
    select.id = index===0 ? 'record-a' : 'record-b';
    select.setAttribute('aria-label',index===0 ? '左侧史料' : '右侧史料');
    for (const s of options) select.add(new Option(s.title,s.id));
    select.value = initial.id;
    const body = make('div');
    select.onchange = () => {
      const s = options.find(record => record.id===select.value);
      const image = make('img');
      image.alt = s.type+'演示插图';
      body.replaceChildren(make('h3',s.title),make('p',[s.year,s.desc].filter(Boolean).join(' · '),'meta'),make('blockquote',s.quote));
      const asset = s.image?.match(/^assets\/([\w-]+\.svg)$/);
      if (asset) {
        image.src = './workspace/assets/'+asset[1];
        body.prepend(image);
      }
      enterDetail(body);
    };
    select.onchange();
    card.append(select,body);
    return card;
  });
  $('#record-grid').replaceChildren(...cards);
}

function renderPedigree() {
  const root = people.find(p => p.id === 'p0') ?? people[0];
  if (!root) return;
  function branch(person, depth, ancestors) {
    const item = make('li');
    const button = make('button',person.name,'lineage-person');
    button.type = 'button';
    button.append(make('small',[person.birth,person.place].filter(Boolean).join(' · ')));
    button.onclick = () => {
      personId = person.id;
      personTab = 'bio';
      $('#search').value = '';
      renderPeople(true);
      location.hash = 'people';
      $('#person-detail h3')?.focus({preventScroll:true});
    };
    item.append(button);
    if (depth === 0) return item;
    const seen = new Set([...ancestors,person.id]);
    const parents = [...new Set([person.father,person.mother])]
      .map(id => people.find(p => p.id === id))
      .filter(parent => parent && !seen.has(parent.id));
    if (parents.length) {
      const row = make('ul');
      row.append(...parents.map(parent => branch(parent,depth-1,seen)));
      item.prepend(row);
    }
    return item;
  }
  const tree = make('ul');
  tree.append(branch(root,2,new Set()));
  $('#pedigree').replaceChildren(tree);
}

document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => setView(button.dataset.view));
$('#search').addEventListener('input',() => renderPeople());
new ResizeObserver(drawMap).observe(canvas);
renderPedigree();
setupMotion();
setView(view);
selectPlace(0);
renderPeople();
renderRecords();
addEventListener('storage',event => {
  if (event.key !== workspaceKey) return;
  readWorkspace();
  if (!people.some(person => person.id===personId)) personId = people[0]?.id;
  renderPedigree();
  renderPeople();
  renderRecords();
});
fetch('./land.json').then(response => {
  if (!response.ok) throw new Error('底图加载失败');
  return response.json();
}).then(data => { land = data; drawMap(); }).catch(() => {
  $('.map-credit').textContent = '底图暂不可用 · 仍可查看地点和史料';
});
