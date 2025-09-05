// appblocker.js (Electron main process)
const net = require('net');
const SOCKET = '/var/run/app-blocker.sock';
const DEFAULT_TIMEOUT = 2000;

function sendCmd(cmd, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const sock = net.createConnection(SOCKET);
    let resp = '';
    const to = setTimeout(() => {
      sock.destroy();
      reject(new Error('timeout'));
    }, timeout);

    sock.on('connect', () => sock.write(cmd + '\n'));
    sock.on('data', d => resp += d.toString());
    sock.on('end', () => { clearTimeout(to); resolve(resp.trim()); });
    sock.on('error', err => { clearTimeout(to); reject(err); });
  });
}

module.exports = {
  list:    () => sendCmd('LIST'),
  add:     name => sendCmd('ADD ' + name),
  remove:  name => sendCmd('REMOVE ' + name),
  pause:   () => sendCmd('PAUSE'),
  resume:  () => sendCmd('RESUME'),
  clear:   () => sendCmd('CLEAR'),
};
