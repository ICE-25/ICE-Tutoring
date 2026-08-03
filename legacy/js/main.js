// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', header.classList.contains('open'));
    });
  }

  // Mark active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Account page tabs (login / register)
  document.querySelectorAll('.form-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });

  document.querySelectorAll('.mock-form').forEach(f => {
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = f.querySelector('.form-note');
      if (note) note.textContent = "This is a demo form — connect it to your backend to go live.";
    });
  });

  // ICE Bot quick-reply chips
  const chatBody = document.querySelector('.chat-body');
  const replies = {
    subjects: "We tutor Maths, Sciences, English, French, Coding, Robotics and more — for Primary through Upper Secondary. Which subject is your child working on?",
    pricing: "Pricing depends on one-to-one vs group classes and how many sessions a week. Our team on WhatsApp can share a plan that fits your budget.",
    online: "Yes — we run both online and physical lessons, so your child can learn from home or in person, whichever works best.",
    talk: "Great — tap 'Continue on WhatsApp' below and one of our tutors will pick up the conversation right away."
  };
  document.querySelectorAll('.chip-btn[data-reply]').forEach(chip => {
    chip.addEventListener('click', () => {
      if (!chatBody) return;
      const userBubble = document.createElement('div');
      userBubble.className = 'bubble user';
      userBubble.textContent = chip.textContent;
      chatBody.appendChild(userBubble);

      const botBubble = document.createElement('div');
      botBubble.className = 'bubble bot';
      botBubble.textContent = replies[chip.dataset.reply] || "Let's continue this on WhatsApp so a tutor can help directly.";
      chatBody.appendChild(botBubble);

      chatBody.scrollTop = chatBody.scrollHeight;
    });
  });
});
