#!/usr/bin/env bash
set -euo pipefail

DAEMON_PATH=/usr/local/bin/app-blocker.js
SERVICE_PATH=/etc/systemd/system/app-blocker.service
SOCKET_PATH=/var/run/app-blocker.sock
SERVICE_NAME=app-blocker.service

echo "=== app-blocker installer ==="

# ensure node exists (best-effort check)
if ! command -v node >/dev/null 2>&1; then
  echo "WARNING: 'node' not found in PATH. The service requires node. Install Node.js before starting the service."
  echo "On Debian/Ubuntu you can run: sudo apt update && sudo apt install -y nodejs"
  # Do not exit; continue writing files so user can fix Node later
fi

# Write daemon file (exact contents you provided)
echo "Writing daemon to $DAEMON_PATH..."
sudo tee "$DAEMON_PATH" > /dev/null <<'DAEMON_EOF'
#!/usr/bin/env node
// /usr/local/bin/app-blocker.js
const fs = require('fs');
const net = require('net');
const path = require('path');

const SOCKET = '/var/run/app-blocker.sock';
const LOG = '/var/log/app-blocker.log';
const SCAN_INTERVAL = 1000; // ms

// initial blacklist (comm names)
const state = {
  blacklist: new Set(['vlc']), // change as needed
  paused: false
};

function log(...args){
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`;
  try { fs.appendFileSync(LOG, line); } catch(e){ /* ignore */ }
  console.log(...args);
}

function readComm(pid){
  try { return fs.readFileSync(`/proc/${pid}/comm`, 'utf8').trim(); }
  catch(e){ return null; }
}

function isSelf(pid){
  try { return Number(pid) === process.pid; } catch(e){ return false; }
}

function killPid(pid){
  try {
    process.kill(Number(pid), 'SIGKILL');
    log('Killed', pid);
  } catch(e){
    // ignore permission/race errors
    log('Could not kill', pid, e.message);
  }
}

function scanAndKill(){
  if(state.paused) return;
  let pids;
  try {
    pids = fs.readdirSync('/proc').filter(n => /^\d+$/.test(n));
  } catch(e){ return; }
  for(const pid of pids){
    if(isSelf(pid)) continue;
    const comm = readComm(pid);
    if(!comm) continue;
    if(state.blacklist.has(comm)){
      killPid(pid);
    }
  }
}

// --- control socket ---
if(fs.existsSync(SOCKET)) try { fs.unlinkSync(SOCKET); } catch(e){}

const server = net.createServer((conn) => {
  conn.setEncoding('utf8');
  let buf = '';
  conn.on('data', d => {
    buf += d;
    if(!buf.includes('\n')) return;
    const parts = buf.trim().split(/\s+/);
    buf = '';
    const cmd = parts[0] && parts[0].toUpperCase();
    if(cmd === 'ADD' && parts[1]){
      state.blacklist.add(parts[1]);
      conn.write(`OK added ${parts[1]}\n`);
      log('ADD', parts[1]);
    } else if(cmd === 'REMOVE' && parts[1]) {
      state.blacklist.delete(parts[1]);
      conn.write(`OK removed ${parts[1]}\n`);
      log('REMOVE', parts[1]);
    } else if(cmd === 'LIST') {
      conn.write(Array.from(state.blacklist).join(',') + '\n');
    } else if(cmd === 'PAUSE') {
      state.paused = true; conn.write('OK paused\n');
    } else if(cmd === 'RESUME') {
      state.paused = false; conn.write('OK resumed\n');
    } else if(cmd === 'CLEAR') {
      state.blacklist.clear(); conn.write('OK cleared\n');
    } else {
      conn.write('ERR unknown\n');
    }
    conn.end();
  });
});
server.listen(SOCKET, () => {
  try { fs.chmodSync(SOCKET, 0o666); } catch(e){}
  log('Control socket listening at', SOCKET);
});
server.on('error', e => log('Socket error', e.message));

// start scanning loop
setInterval(scanAndKill, SCAN_INTERVAL);
scanAndKill();
DAEMON_EOF

# make executable and set perms (you asked for 777)
echo "Setting $DAEMON_PATH permissions to 777"
sudo chmod 777 "$DAEMON_PATH"

# Write systemd unit file
echo "Writing systemd unit to $SERVICE_PATH..."
sudo tee "$SERVICE_PATH" > /dev/null <<'SERVICE_EOF'
[Unit]
Description=App Blocker Service
After=network.target

[Service]
ExecStart=/usr/bin/node /usr/local/bin/app-blocker.js
Restart=always
User=root
Group=root

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# set service file perms to 777 as requested
echo "Setting $SERVICE_PATH permissions to 777"
sudo chmod 777 "$SERVICE_PATH"

# reload systemd, enable and start the service
echo "Reloading systemd daemon..."
sudo systemctl daemon-reload

echo "Enabling service..."
sudo systemctl enable "$SERVICE_NAME" >/dev/null 2>&1 || true

echo "Starting/restarting service..."
sudo systemctl restart "$SERVICE_NAME"

# brief wait for socket
sleep 1

echo "=== Installation summary ==="
sudo systemctl status "$SERVICE_NAME" --no-pager || true

if [ -e "$SOCKET_PATH" ]; then
  echo "Socket created: $(ls -l "$SOCKET_PATH")"
else
  echo "Socket not found at $SOCKET_PATH — check logs with: sudo journalctl -u $SERVICE_NAME -n 200 --no-pager"
fi

echo "Installer finished."
