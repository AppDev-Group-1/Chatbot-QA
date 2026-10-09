// OWNER: Dev 2 (UI Track) | Wire input, Send, Reset, Enter → answer()
// NOTE: Uses a local mock answer() until engine/index.js is complete.
// TODO: When Dev 1 finishes the engine, replace the mock block below with:
//       import { answer } from '../engine/index.js';

import { addMessage, clearChat, showTyping, hideTyping, playAudio } from './chat.js';

// ─── MOCK answer() — DELETE this block once engine/index.js is done ─
function answer(text) {
  const t = String(text ?? '').trim().toLowerCase();
  if (!t) return { status: 'empty', item: null, score: 0 };

  const ITEMS = [
    { name: 'Central Processing Unit (CPU)' },
    { name: 'Motherboard' },
    { name: 'Random Access Memory (RAM)' },
    { name: 'Storage Drive (SSD / HDD)' },
    { name: 'Power Supply Unit (PSU)' },
    { name: 'Graphics Processing Unit (GPU)' },
    { name: 'Computer Case (Chassis)' },
    { name: 'Cooling System (CPU Cooler / Case Fans)' },
    { name: 'Monitor' },
    { name: 'Keyboard' },
    { name: 'Mouse' },
  ];

  const keywords = [
    ['cpu', 'processor', 'central processing'],
    ['motherboard', 'mobo', 'mainboard'],
    ['ram', 'memory', 'random access'],
    ['storage', 'ssd', 'hdd', 'hard drive', 'solid state'],
    ['psu', 'power supply'],
    ['gpu', 'graphics', 'video card', 'display adapter'],
    ['case', 'chassis', 'tower'],
    ['cooling', 'cooler', 'fan', 'heatsink'],
    ['monitor', 'display', 'screen'],
    ['keyboard'],
    ['mouse'],
  ];
  for (let i = 0; i < keywords.length; i++) {
    if (keywords[i].some(kw => t.includes(kw))) {
      return { status: 'correct', item: ITEMS[i], score: 0.93 };
    }
  }
  if (t.length <= 2) return { status: 'ambiguous', item: null, score: 0.52 };
  return { status: 'unrecognized', item: null, score: 0.17 };
}
// ────────────────────────────────────────────────────────────────────

// ── DOM Refs ─────────────────────────────────────────────────────────
const inputEl  = document.getElementById('user-input');
const sendBtn  = document.getElementById('send-btn');
const resetBtn = document.getElementById('reset-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const historyList = document.getElementById('history-list');

// ── Session Management (localStorage) ────────────────────────────────
let sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
let currentSessionId = null;

function saveSessions() {
  localStorage.setItem('chatSessions', JSON.stringify(sessions));
  renderSidebar();
}

function renderSidebar() {
  historyList.innerHTML = '';
  const sorted = sessions.slice().sort((a,b) => b.date - a.date);
  
  sorted.forEach(sess => {
    const el = document.createElement('div');
    el.className = `history-item ${sess.id === currentSessionId ? 'active' : ''}`;
    el.innerHTML = `
      <div class="history-item-text">
        <div class="history-item-title">${sess.title}</div>
        <div class="history-item-date">${new Date(sess.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(sess.date).toLocaleDateString()}</div>
      </div>
      <button class="delete-sess-btn" aria-label="Delete chat" data-tooltip="Delete chat">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;
    
    el.addEventListener('click', (e) => {
      // If clicking the delete button, handle delete
      if (e.target.closest('.delete-sess-btn')) {
        deleteSession(sess.id);
      } else {
        loadSession(sess.id);
      }
    });
    
    historyList.appendChild(el);
  });
}

function deleteSession(id) {
  sessions = sessions.filter(s => s.id !== id);
  saveSessions();
  
  if (currentSessionId === id) {
    if (sessions.length > 0) {
      const latest = sessions.reduce((max, s) => s.date > max.date ? s : max, sessions[0]);
      loadSession(latest.id);
    } else {
      startNewChat();
    }
  }
}

function loadSession(id) {
  currentSessionId = id;
  const sess = sessions.find(s => s.id === id);
  if (!sess) return;
  
  clearChat();
  document.getElementById('welcome-card')?.remove();
  
  if (sess.messages.length === 0) {
    renderWelcome();
  } else {
    // Re-render old messages
    // Mute audio during load to prevent a cascade of sounds
    const audioOrig = window.AudioContext;
    window.AudioContext = null; 
    sess.messages.forEach(m => addMessage(m.role, m.text, m.status, m.score));
    window.AudioContext = audioOrig;
  }
  renderSidebar();
  inputEl.focus();
}

function startNewChat() {
  const newId = Date.now();
  sessions.push({ id: newId, date: newId, title: 'New Chat', messages: [] });
  saveSessions();
  loadSession(newId);
}

// ── Welcome Card ──────────────────────────────────────────────────────
function renderWelcome() {
  if (document.getElementById('welcome-card')) return;
  const chatWindow = document.getElementById('chat-window');
  const card = document.createElement('div');
  card.id = 'welcome-card';
  card.innerHTML = `
    <div class="welcome-icon">🖥️</div>
    <h2>Hardware QA Chatbot</h2>
    <p>Name any computer hardware component and I'll check it against the answer key. Powered by <strong>Levenshtein</strong> string matching.</p>
    <div class="chip-list">
      <button class="chip" data-val="CPU">CPU</button>
      <button class="chip" data-val="Motherboard">Motherboard</button>
      <button class="chip" data-val="RAM">RAM</button>
      <button class="chip" data-val="GPU">GPU</button>
      <button class="chip" data-val="Monitor">Monitor</button>
      <button class="chip" data-val="Keyboard">Keyboard</button>
    </div>`;
  chatWindow.appendChild(card);

  // Quick-fill chips
  card.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      inputEl.value = chip.dataset.val;
      syncSendBtn();
      handleSend();
    });
  });
}

// ── Send Handler ───────────────────────────────────────────────────────
function handleSend() {
  const text = inputEl.value.trim();
  if (!text || inputEl.disabled) return;

  const sess = sessions.find(s => s.id === currentSessionId);
  if (sess && sess.messages.length === 0) {
    sess.title = text.length > 25 ? text.substring(0, 25) + '...' : text;
  }

  document.getElementById('welcome-card')?.remove();
  
  addMessage('user', text);
  playAudio('send');
  
  if (sess) sess.messages.push({ role: 'user', text });
  saveSessions();

  inputEl.value = '';
  inputEl.style.height = 'auto';
  setInputLocked(true);

  const delay = 380 + Math.random() * 280;
  showTyping();

  setTimeout(() => {
    hideTyping();
    const result  = answer(text);
    const botText = _buildBotText(result);
    
    if (result.status === 'correct') playAudio('success');
    else if (result.status === 'unrecognized' || result.status === 'ambiguous') playAudio('error');

    addMessage('bot', botText, result.status, result.score);
    if (sess) sess.messages.push({ role: 'bot', text: botText, status: result.status, score: result.score });
    saveSessions();

    setInputLocked(false);
    inputEl.focus();
  }, delay);
}

// ── Bot Response Text ─────────────────────────────────────────────────
function _buildBotText({ status, item, score }) {
  const pct = Math.round((score ?? 0) * 100);
  switch (status) {
    case 'correct':
      return `"${item.name}" is in the answer key. (${pct}% match)`;
    case 'ambiguous':
      return `Close, but not confident enough${item ? ` — nearest: "${item.name}"` : ''}. Try being more specific. (${pct}% similarity)`;
    case 'unrecognized':
      return `That doesn't match any hardware component in the answer key. (${pct}% — below threshold)`;
    case 'empty':
      return `Please type something before sending.`;
    default:
      return `Unexpected response. Please try again.`;
  }
}

// ── Reset ──────────────────────────────────────────────────────────────
function handleReset() {
  const sess = sessions.find(s => s.id === currentSessionId);
  if (sess) {
    sess.messages = [];
    sess.title = 'New Chat';
    saveSessions();
  }
  clearChat();
  inputEl.value = '';
  inputEl.style.height = 'auto';
  setInputLocked(false);
  syncSendBtn();
  renderWelcome();
  inputEl.focus();
}

// ── Input Helpers ──────────────────────────────────────────────────────
function setInputLocked(locked) {
  inputEl.disabled  = locked;
  sendBtn.disabled  = locked;
}

function syncSendBtn() {
  sendBtn.disabled = inputEl.value.trim() === '';
}

// ── Auto-resize textarea ───────────────────────────────────────────────
inputEl.addEventListener('input', () => {
  syncSendBtn();
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
});

// ── Enter key (send); Shift+Enter (newline) ───────────────────────────
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) handleSend();
  }
});

// ── Button Events ──────────────────────────────────────────────────────
sendBtn.addEventListener('click', handleSend);
resetBtn.addEventListener('click', handleReset);
newChatBtn.addEventListener('click', startNewChat);

// ── Init ───────────────────────────────────────────────────────────────
if (sessions.length === 0) {
  startNewChat();
} else {
  // Load most recent session
  const latest = sessions.reduce((max, s) => s.date > max.date ? s : max, sessions[0]);
  loadSession(latest.id);
}
