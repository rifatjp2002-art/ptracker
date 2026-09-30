const fs = require('fs');
const path = require('path');

const clientMjsPath = path.resolve(__dirname, '../node_modules/vite/dist/client/client.mjs');

if (fs.existsSync(clientMjsPath)) {
  let content = fs.readFileSync(clientMjsPath, 'utf8');
  let changed = false;

  if (content.includes('ws.send(JSON.stringify(data))')) {
    content = content.replace(/ws\.send\(JSON\.stringify\(data\)\)/g, 'ws?.send?.(JSON.stringify(data))');
    changed = true;
  }
  if (content.includes('wsTransport.send(data)')) {
    content = content.replace(/wsTransport\.send\(data\)/g, 'wsTransport?.send?.(data)');
    changed = true;
  }
  if (content.includes('this.transport.send(payload)')) {
    content = content.replace(/this\.transport\.send\(payload\)/g, 'this.transport?.send?.(payload)');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(clientMjsPath, content, 'utf8');
    console.log('[patch-vite] Successfully safeguarded Vite client transport against HMR disabled state.');
  }
}
