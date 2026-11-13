import {peopleSeed, sourceSeed} from './demo.js';

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
let view = 'world';
let activePlace = 0;
let land;
let people = peopleSeed;
try {
  const saved = JSON.parse(localStorage.getItem('jiaxu-mobile-offline-v2'));
  if (Array.isArray(saved?.people) && saved.people.length) people = saved.people.filter(p => !p.archived);
} catch {}
let personId = people.some(p => p.id === 'p3') ? 'p3' : people[0]?.id;
const canvas = $('#map');
const ctx = canvas.getContext('2d');
const pins = $('#markers');

function drawMap() {
  const {width, height} = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(ratio,0,0,ratio,0,0);
  const [centerX,centerY,spanX,spanY] = views[view];
  const scale = Math.min(width/spanX,height/spanY);
  const project = (lon,lat) => [width/2+(lon-centerX)*scale,height/2-(lat-centerY)*scale];
  ctx.fillStyle = '#e2ebe4';
  ctx.fillRect(0,0,width,height);
  const grid = view === 'world' ? 30 : view === 'region' ? 10 : 1;
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
      for (const offset of view === 'world' ? [-360,0,360] : [0]) {
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
  if (view === 'local') {
    ctx.beginPath();
    points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.setLineDash([6,5]);ctx.lineWidth = 2;
    ctx.strokeStyle = '#986037';ctx.stroke();ctx.setLineDash([]);
  }
  pins.replaceChildren();
  const indices = view === 'local' ? [0,1,2] : [activePlace];
  for (const i of indices) {
    const pin = make('button',null,'map-pin');
    const group = view !== 'local';
    const label = group ? '闽台 · 3 处地点' : places[i].short;
    pin.append(make('span',label));
    pin.style.left = points[i][0]+'px';
    pin.style.top = points[i][1]+'px';
    pin.dataset.label = String(group || i !== 1);
    pin.setAttribute('aria-pressed',String(!group && i === activePlace));
    pin.setAttribute('aria-label',group ? '放大查看闽台三处地点' : '查看'+label);
    pin.onclick = () => {
      if (group) setView('local');
      selectPlace(i);
      pins.querySelector('[aria-pressed=true]')?.focus();
    };
    pins.append(pin);
  }
}
function setView(next) {
  view = next;
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.view===view)));
  drawMap();
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
  drawMap();
}

function renderPeople() {
  const query = $('#search').value.trim().toLowerCase();
  const matches = people.filter(p => [p.name,p.place,p.origin].some(field => String(field ?? '').toLowerCase().includes(query)));
  const list = $('#people-list');
  list.replaceChildren(...matches.map(p => {
    const button = make('button',p.name,'person-button');
    button.dataset.person = p.id;
    button.setAttribute('aria-pressed',String(p.id === personId));
    button.onclick = () => { personId = p.id; renderPeople(); list.querySelector('[aria-pressed=true]')?.focus(); };
    return button;
  }));
  if (!matches.length) list.append(make('p','未找到匹配人物。','meta'));
  const person = people.find(p => p.id===personId);
  if (!person) return;
  const relations = make('div',null,'relations');
  for (const [label,id] of [['父亲',person.father],['母亲',person.mother],['配偶',person.spouse]]) {
    const relative = people.find(p => p.id===id);
    if (!relative) continue;
    const button = make('button',label+' · '+relative.name);
    button.onclick = () => { personId = id; $('#search').value = ''; renderPeople(); $('#person-detail h3').focus(); };
    relations.append(button);
  }
  const heading = make('h3',person.name);
  heading.tabIndex = -1;
  const link = make('a','在移动端查看完整档案 ↗','detail-link');
  link.href = '../#person/'+encodeURIComponent(person.id)+'/details';
  $('#person-detail').replaceChildren(make('p','人物资料','eyebrow'),heading,make('p',[person.birth,person.place].filter(Boolean).join(' · ') || '年代与地点待补','meta'),make('p',person.bio || '暂无生平记述。'),relations,make('p'));
  document.getElementById("person-detail").lastElementChild.append(link);
}

function renderRecords() {
  const cards = sourceSeed.slice(0,2).map((initial,index) => {
    const card = make('article',null,'record');
    const select = make('select');
    select.id = index===0 ? 'record-a' : 'record-b';
    select.setAttribute('aria-label',index===0 ? '左侧史料' : '右侧史料');
    for (const s of sourceSeed) select.add(new Option(s.title,s.id));
    select.value = initial.id;
    const body = make('div');
    select.onchange = () => {
      const s = sourceSeed.find(record => record.id===select.value);
      const image = make('img');
      image.src = './'+s.image.split('/').at(-1);
      image.alt = s.type+'演示插图';
      body.replaceChildren(image,make('h3',s.title),make('p',s.year+' · '+s.desc,'meta'),make('blockquote',s.quote));
    };
    select.onchange();
    card.append(select,body);
    return card;
  });
  $('#record-grid').replaceChildren(...cards);
}

document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => setView(button.dataset.view));
$('#search').addEventListener('input',renderPeople);
new ResizeObserver(drawMap).observe(canvas);
setView(view);
selectPlace(0);
renderPeople();
renderRecords();
fetch('./land.json').then(response => {
  if (!response.ok) throw new Error('底图加载失败');
  return response.json();
}).then(data => { land = data; drawMap(); }).catch(() => {
  $('.map-credit').textContent = '底图暂不可用 · 仍可查看地点和史料';
});



