// OWNER: Dev 2 (UI Track) | Render messages, history, typing indicator, score bar
// Exports: addMessage, clearChat, showTyping, hideTyping, playAudio

const chatWindow = document.getElementById('chat-window');
const scoreBar   = document.getElementById('score-bar');
const scoreFill  = document.getElementById('score-fill');
const scoreValue = document.getElementById('score-value');

// ── Sound Design (Web Audio API) ────────────────────────────────────
let audioCtx = null;
export function playAudio(type) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'send') {
      // Soft modern "pop"
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'success') {
      // High-tech correct chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'error' || type === 'ambiguous') {
      // Low tech blip
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    // Ignore if audio isn't supported or fails
  }
}

// ── Typing Indicator ────────────────────────────────────────────────
let typingEl = null;
let mathInterval = null;

export function showTyping() {
  if (typingEl) return;
  typingEl = document.createElement('div');
  typingEl.className = 'msg-row bot';
  typingEl.id = 'typing-indicator';
  typingEl.innerHTML = `
    <div class="msg-icon">AI</div>
    <div class="bubble-wrap">
      <div class="bubble">
        <div class="scan-line"></div>
        <div class="math-text" id="math-text-el">
          <span>dist(a,b)</span> <span>=</span> <span>min(..)</span>
        </div>
      </div>
    </div>`;
  chatWindow.appendChild(typingEl);
  _scrollToBottom();
  
  // Matrix computation effect
  const mathEl = document.getElementById('math-text-el');
  const chars = '0123456789+-_=ΔΣΛµ∂';
  mathInterval = setInterval(() => {
    if(mathEl) {
       let str = '';
       for(let i=0; i<12; i++) str += chars[Math.floor(Math.random() * chars.length)];
       mathEl.innerHTML = `<span>[${str}]</span>`;
    }
  }, 80);
}

export function hideTyping() {
  if (mathInterval) clearInterval(mathInterval);
  typingEl?.remove();
  typingEl = null;
}

// ── Add Message ─────────────────────────────────────────────────────
/**
 * Renders a chat bubble into the chat window.
 * @param {'user'|'bot'} role
 * @param {string}       text    - Message body
 * @param {string|null}  status  - 'correct' | 'ambiguous' | 'unrecognized' | 'empty' | null
 * @param {number}       score   - Similarity score 0..1 (bot only)
 */
export function addMessage(role, text, status = null, score = 0) {
  const row  = document.createElement('div');
  row.className = `msg-row ${role}`;

  const icon = role === 'bot' ? 'AI' : 'ME';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const badgeHtml = (status && role === 'bot')
    ? `<span class="status-badge ${status}">${_statusLabel(status)}</span>`
    : '';

  row.innerHTML = `
    <div class="msg-icon">${icon}</div>
    <div class="bubble-wrap">
      ${badgeHtml}
      <div class="bubble">${_escapeHtml(text)}</div>
      <span class="msg-time">${time}</span>
    </div>`;

  chatWindow.appendChild(row);
  _scrollToBottom();

  // Score bar: show on bot response, hide on user message
  if (role === 'bot' && score > 0) {
    _updateScoreBar(score, status);
  } else if (role === 'user') {
    _hideScoreBar();
  }
}

// ── Clear Chat ──────────────────────────────────────────────────────
export function clearChat() {
  chatWindow.innerHTML = '';
  _hideScoreBar();
  hideTyping();
}

// ── Private Helpers ──────────────────────────────────────────────────
function _scrollToBottom() {
  requestAnimationFrame(() => {
    chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
  });
}

function _hideScoreBar() {
  scoreBar.hidden = true;
  scoreFill.style.width = '0%';
  scoreValue.textContent = '0%';
}

function _updateScoreBar(score, status) {
  scoreBar.hidden = false;
  const targetPct = Math.round(score * 100);
  scoreFill.style.width = targetPct + '%';
  
  // Number counter animation
  let currentPct = 0;
  const step = Math.max(1, Math.floor(targetPct / 20));
  const countInterval = setInterval(() => {
    currentPct += step;
    if (currentPct >= targetPct) {
      currentPct = targetPct;
      clearInterval(countInterval);
    }
    scoreValue.textContent = currentPct + '%';
  }, 16);

  const colorMap = {
    correct:      'linear-gradient(90deg, #10b981, #059669)',
    ambiguous:    'linear-gradient(90deg, #f59e0b, #d97706)',
    unrecognized: 'linear-gradient(90deg, #f43f5e, #e11d48)',
    empty:        'linear-gradient(90deg, #64748b, #475569)',
  };
  scoreFill.style.background = colorMap[status] ?? 'linear-gradient(90deg, var(--clr-accent), var(--clr-accent-3))';
}

function _statusLabel(status) {
  const map = {
    correct:      '✓ Correct',
    ambiguous:    '~ Ambiguous',
    unrecognized: '✗ Unrecognized',
    empty:        '⚠ Empty Input',
  };
  return map[status] ?? status;
}

function _escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
