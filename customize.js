// Customize Engine — reads/writes names via URL hash
// Format: #s=SenderName&r=ReceiverName

const DEFAULT_SENDER = "Ankit";
const DEFAULT_RECEIVER = "Someone Special";

function getNames() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return {
    sender: decodeURIComponent(params.get("s") || DEFAULT_SENDER),
    receiver: decodeURIComponent(params.get("r") || DEFAULT_RECEIVER),
  };
}

function buildHashFor(sender, receiver) {
  return `#s=${encodeURIComponent(sender)}&r=${encodeURIComponent(receiver)}`;
}

function buildShareUrl(sender, receiver) {
  const base = window.location.origin + window.location.pathname
    .replace(/\/(no1|no2|no3|yes)\.html$/, "/index.html")
    .replace(/\/index\.html$/, "/index.html");
  return base + buildHashFor(sender, receiver);
}

// Carry hash across every page link so names persist
function patchLinks() {
  const hash = window.location.hash;
  if (!hash) return;
  document.querySelectorAll("a[href]").forEach(a => {
    const href = a.getAttribute("href");
    if (href && !href.startsWith("http") && !href.startsWith("#")) {
      a.setAttribute("href", href + hash);
    }
  });
}

// Apply names everywhere text shows them
function applyNames(sender, receiver) {
  document.querySelectorAll("[data-sender]").forEach(el => {
    el.textContent = sender;
  });
  document.querySelectorAll("[data-receiver]").forEach(el => {
    el.textContent = receiver;
  });
}

// ─── Customize Panel ─────────────────────────────────────────────────────────
function injectCustomizePanel() {
  // ✅ If URL already has a shared hash (s= param), this is a RECEIVER link
  //    → hide the customize panel completely. Only sender sees it.
  const hash = window.location.hash;
  const isSharedLink = hash && new URLSearchParams(hash.substring(1)).get('s');
  if (isSharedLink) return;

  // Only show panel on index.html (main page)
  const path = window.location.pathname;
  const isIndex = path.endsWith('/') || path.endsWith('index.html') || path === '';
  if (!isIndex) return;

  const { sender, receiver } = getNames();

  const panel = document.createElement("div");
  panel.id = "cust-panel";
  panel.innerHTML = `
    <button id="cust-toggle" title="Customize">✏️ Customize</button>
    <div id="cust-form">
      <h3>✨ Customize</h3>
      <label>Your Name (Sender)
        <input id="cust-sender" type="text" placeholder="e.g. Ankit" value="${sender}" />
      </label>
      <label>Her / His Name (Receiver)
        <input id="cust-receiver" type="text" placeholder="e.g. Priya" value="${receiver}" />
      </label>
      <button id="cust-apply">✅ Apply & Preview</button>
      <button id="cust-copy">🔗 Copy Share Link</button>
      <p id="cust-msg"></p>
    </div>
  `;
  document.body.appendChild(panel);

  // Toggle form open/close
  document.getElementById("cust-toggle").addEventListener("click", () => {
    panel.classList.toggle("open");
  });

  // Apply button
  document.getElementById("cust-apply").addEventListener("click", () => {
    const s = document.getElementById("cust-sender").value.trim() || DEFAULT_SENDER;
    const r = document.getElementById("cust-receiver").value.trim() || DEFAULT_RECEIVER;
    window.location.hash = buildHashFor(s, r).substring(1);
    applyNames(s, r);
    patchLinks();
    showMsg("✅ Applied!");
  });

  // Copy share link
  document.getElementById("cust-copy").addEventListener("click", () => {
    const s = document.getElementById("cust-sender").value.trim() || DEFAULT_SENDER;
    const r = document.getElementById("cust-receiver").value.trim() || DEFAULT_RECEIVER;
    const url = buildShareUrl(s, r);
    navigator.clipboard.writeText(url).then(() => {
      showMsg("🔗 Link copied! Share karo 💌");
    }).catch(() => {
      prompt("Copy this link:", url);
    });
  });

  function showMsg(text) {
    const msg = document.getElementById("cust-msg");
    msg.textContent = text;
    setTimeout(() => { msg.textContent = ""; }, 3000);
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const { sender, receiver } = getNames();
  applyNames(sender, receiver);
  patchLinks();
  injectCustomizePanel();
});
