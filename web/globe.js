const radians = Math.PI / 180;
let texture;
const lastFrames = new WeakMap();

function createTexture(land) {
  const canvas = document.createElement('canvas');
  canvas.width = 1440;
  canvas.height = 720;
  const context = canvas.getContext('2d');
  context.fillStyle = '#172d28';
  context.fillRect(0,0,1440,720);
  context.fillStyle = '#6d8c68';
  for (const {geometry} of land.features) {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    for (const polygon of polygons) {
      context.beginPath();
      for (const ring of polygon) {
        ring.forEach(([lon,lat],i) => {
          const x = (lon+180)*4;
          const y = (90-lat)*4;
          if (i === 0) context.moveTo(x,y); else context.lineTo(x,y);
        });
        context.closePath();
      }
      context.fill('evenodd');
    }
  }
  return context.getImageData(0,0,1440,720).data;
}

export function drawGlobe(canvas, land, {lon=118.7, lat=24.8, radius=1, maxPixels=Infinity} = {}) {
  const width = canvas.clientWidth;
  const size = Math.min(maxPixels,Math.floor(width * Math.min(devicePixelRatio || 1, 2)));
  const frame = [size,lon,lat,radius].join('/');
  if (size < 2 || lastFrames.get(canvas) === frame) return;
  lastFrames.set(canvas,frame);
  texture ??= createTexture(land);
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const image = context.createImageData(size,size);
  const latitude = lat*radians;
  const sinCenter = Math.sin(latitude);
  const cosCenter = Math.cos(latitude);
  for (let y=0; y<size; y++) for (let x=0; x<size; x++) {
    const east = ((x+.5)*2/size-1)/radius;
    const north = (1-(y+.5)*2/size)/radius;
    const distance = east*east+north*north;
    if (distance >= 1) continue;
    const front = Math.sqrt(1-distance);
    const lat = Math.asin(north*cosCenter+front*sinCenter)/radians;
    const longitude = lon+Math.atan2(east,front*cosCenter-north*sinCenter)/radians;
    const tx = (Math.floor((longitude+180)*4)+2880)%1440;
    const ty = Math.min(719,Math.floor((90-lat)*4));
    const sample = (ty*1440+tx)*4;
    const pixel = (y*size+x)*4;
    const light = .65+.52*Math.max(0,.76*front-.36*east+.46*north);
    const rim = Math.pow(1-front,6)*75;
    for (let channel=0; channel<3; channel++) image.data[pixel+channel] = texture[sample+channel]*light+rim;
    image.data[pixel+3] = Math.min(255,(1-distance)*size*160);
  }
  context.putImageData(image,0,0);
}
