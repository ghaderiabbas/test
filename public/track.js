// --- helper: canvas fingerprinting ---
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200; canvas.height = 50;
    ctx.textBaseline = "top";
    ctx.font = "16px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125,1,62,20);
    ctx.fillStyle = "#069";
    ctx.fillText("Fingerprint Test 🤖", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Fingerprint Test 🤖", 4, 17);
    return canvas.toDataURL();
  } catch (e) { return ''; }
}

function getWebGLInfo() {
  try {
    const canv = document.createElement('canvas');
    const gl = canv.getContext('webgl') || canv.getContext('experimental-webgl');
    if (!gl) return {};
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      return {
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      };
    }
    return {};
  } catch (e) { return {}; }
}

async function collectFingerprint() {
  const canvasFp = getCanvasFingerprint();
  const webgl = getWebGLInfo();
  const data = {
    ua: navigator.userAgent || '',
    language: navigator.language || '',
    languages: navigator.languages || [],
    platform: navigator.platform || '',
    screen: { w: screen.width, h: screen.height, availW: screen.availWidth, availH: screen.availHeight, colorDepth: screen.colorDepth },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    touchPoints: navigator.maxTouchPoints || 0,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || navigator.msDoNotTrack || navigator.doNotTrack,
    canvas: canvasFp,
    webgl,
    plugins: Array.from(navigator.plugins || []).map(p => p.name).slice(0,10),
    timestamp: new Date().toISOString(),
    referrer: document.referrer || '',
    url: location.href
  };

  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(JSON.stringify(data)));
  const hashArray = Array.from(new Uint8Array(digest));
  const fingerprint = hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
  data.fingerprint = fingerprint;
  return data;
}

async function sendFingerprint(url) {
  try {
    const payload = await collectFingerprint();
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    });
  } catch (e) {
    console.error('sendFingerprint error', e);
  }
}

// Run immediately
sendFingerprint('/collect');
