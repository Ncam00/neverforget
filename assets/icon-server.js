const http = require('http');
const fs = require('fs');
const path = require('path');

const HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;background:#000">
<canvas id="c1" width="1024" height="1024" style="display:none"></canvas>
<canvas id="c2" width="2048" height="2048" style="display:none"></canvas>
<canvas id="c3" width="1024" height="1024" style="display:none"></canvas>
<div id="status" style="color:#fff;font:20px sans-serif;padding:20px">Generating icons...</div>
<script>
function drawElephant(ctx, ox, oy, scale, color) {
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  function path(points, w) {
    ctx.lineWidth = w * scale;
    ctx.beginPath();
    const cmds = points.trim().match(/[MC][^MC]*/g);
    cmds.forEach(cmd => {
      const t = cmd[0];
      const n = cmd.slice(1).trim().split(/[\\s,]+/).map(Number).filter(x=>!isNaN(x));
      if (t==='M') ctx.moveTo(ox+n[0]*scale, oy+n[1]*scale);
      else if (t==='C') {
        let i=0; while(i<n.length-5) {
          ctx.bezierCurveTo(ox+n[i]*scale,oy+n[i+1]*scale,ox+n[i+2]*scale,oy+n[i+3]*scale,ox+n[i+4]*scale,oy+n[i+5]*scale);
          i+=6;
        }
      }
    });
    ctx.stroke();
  }
  path('M 20 130 C 20 130 15 110 18 90 C 21 70 30 55 50 45 C 70 35 95 30 120 32 C 145 34 165 38 180 50 C 195 62 200 75 200 90 C 200 105 195 118 190 128', 4.5);
  path('M 50 45 C 38 42 28 38 22 30 C 16 22 15 14 18 8 C 21 2 30 4 34 10 C 38 16 36 24 38 30 C 40 36 44 40 50 45', 4.5);
  path('M 18 8 C 14 4 10 6 8 12 C 6 18 10 24 16 22', 4);
  path('M 50 45 C 55 32 60 20 72 16 C 84 12 95 18 98 30 C 101 42 92 52 80 55 C 68 58 55 52 50 45', 4);
  path('M 80 115 C 78 125 76 138 77 148', 4.5);
  path('M 100 118 C 100 128 100 138 101 148', 4.5);
  path('M 155 120 C 153 130 151 140 152 148', 4.5);
  path('M 175 116 C 175 126 176 136 177 148', 4.5);
  path('M 200 90 C 208 88 215 92 218 100 C 221 108 216 115 210 112', 3.5);
  path('M 34 10 C 28 6 20 8 16 14 C 12 20 16 28 22 26', 3);
}

async function generate() {
  // ICON 1024x1024
  const c1 = document.getElementById('c1');
  const x1 = c1.getContext('2d');
  x1.fillStyle = '#000'; x1.fillRect(0,0,1024,1024);
  // Subtle radial glow
  const g = x1.createRadialGradient(512,480,100,512,480,520);
  g.addColorStop(0,'rgba(196,160,0,0.12)'); g.addColorStop(1,'rgba(0,0,0,0)');
  x1.fillStyle=g; x1.fillRect(0,0,1024,1024);
  x1.shadowColor='#C4A000'; x1.shadowBlur=22;
  drawElephant(x1, (1024-240*3.5)/2, (1024-156*3.5)/2-60, 3.5, '#C4A000');
  x1.shadowBlur=0;
  x1.fillStyle='#C4A000'; x1.font='bold 68px system-ui,Arial';
  x1.textAlign='center'; x1.letterSpacing='6px';
  x1.fillText('NEVERFORGET', 512, 875);

  // SPLASH 2048x2048
  const c2 = document.getElementById('c2');
  const x2 = c2.getContext('2d');
  x2.fillStyle='#000'; x2.fillRect(0,0,2048,2048);
  const g2=x2.createRadialGradient(1024,900,200,1024,900,900);
  g2.addColorStop(0,'rgba(196,160,0,0.1)'); g2.addColorStop(1,'rgba(0,0,0,0)');
  x2.fillStyle=g2; x2.fillRect(0,0,2048,2048);
  x2.shadowColor='#C4A000'; x2.shadowBlur=36;
  drawElephant(x2, (2048-240*5.5)/2, 620, 5.5, '#C4A000');
  x2.shadowBlur=0;
  x2.fillStyle='#C4A000'; x2.font='bold 120px system-ui,Arial';
  x2.textAlign='center'; x2.fillText('NEVERFORGET', 1024, 1620);
  x2.fillStyle='rgba(196,160,0,0.55)'; x2.font='52px system-ui,Arial';
  x2.fillText('An elephant never forgets', 1024, 1710);

  // ADAPTIVE (transparent bg)
  const c3 = document.getElementById('c3');
  const x3 = c3.getContext('2d');
  x3.clearRect(0,0,1024,1024);
  x3.shadowColor='#C4A000'; x3.shadowBlur=16;
  drawElephant(x3, (1024-240*3.2)/2, (1024-156*3.2)/2-30, 3.2, '#C4A000');

  // Save all three
  const saves = [
    {name:'icon.png', data: c1.toDataURL('image/png').split(',')[1]},
    {name:'splash.png', data: c2.toDataURL('image/png').split(',')[1]},
    {name:'adaptive-icon.png', data: c3.toDataURL('image/png').split(',')[1]},
  ];
  for (const s of saves) {
    await fetch('/save', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(s)});
  }
  document.getElementById('status').textContent = '✅ All 3 icons saved! You can close this tab.';
}
generate().catch(e => { document.getElementById('status').textContent = '❌ Error: '+e.message; });
</script>
</body></html>`;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
  } else if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const { name, data } = JSON.parse(body);
        const dest = path.join(__dirname, name);
        fs.writeFileSync(dest, Buffer.from(data, 'base64'));
        console.log('Saved', dest, Math.round(data.length * 3/4 / 1024) + 'KB');
        res.writeHead(200); res.end('ok');
      } catch (e) {
        res.writeHead(500); res.end(e.message);
      }
    });
  } else {
    res.writeHead(404); res.end('not found');
  }
});

server.listen(3456, () => {
  console.log('Icon server ready → http://localhost:3456');
});
