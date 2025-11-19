import { sendMessageToGroq } from './groq-api.js';

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const modelSelect = document.getElementById('model-select');
const status = document.getElementById('status');

let messages = [
  { role: "system", content: "Kamu adalah asisten AI yang sangat ramah, cerdas, jenaka, dan selalu menjawab dalam bahasa Indonesia." }
];

function addMessage(content, role) {
  const wrapper = document.createElement('div');
  wrapper.className = role === 'user' ? 'message-user' : 'message-bot';

  const bubble = document.createElement('div');
  bubble.className = role === 'user' ? 'bubble user-bubble' : 'bubble bot-bubble';
  bubble.innerHTML = marked.parse(content);

  wrapper.appendChild(bubble);
  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function streamResponse() {
  const userText = userInput.value.trim();
  if (!userText) return;

  addMessage(userText, 'user');
  messages.push({ role: "user", content: userText });
  userInput.value = '';
  sendBtn.disabled = true;
  typingIndicator.classList.remove('hidden');
  status.textContent = 'Sedang mengetik...';

  let botMessage = '';
  let botWrapper = document.createElement('div');
  botWrapper.className = 'message-bot';
  let botBubble = document.createElement('div');
  botBubble.className = 'bubble bot-bubble';
  botBubble.id = 'streaming-text';
  botWrapper.appendChild(botBubble);
  chatContainer.appendChild(botWrapper);

  try {
    const reader = await sendMessageToGroq(messages, modelSelect.value);
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith("data: ") && !line.includes("[DONE]")) {
          try {
            const json = JSON.parse(line.slice(6));
            const text = json.choices[0]?.delta?.content || "";
            if (text) {
              botMessage += text;
              botBubble.innerHTML = marked.parse(botMessage);
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
          } catch (e) {}
        }
      }
    }

    messages.push({ role: "assistant", content: botMessage });
  } catch (err) {
    botBubble.innerHTML = `<span class="text-red-400">Error: ${err.message}</span>`;
  } finally {
    typingIndicator.classList.add('hidden');
    status.textContent = 'Siap';
    sendBtn.disabled = false;
    userInput.focus();
  }
}

// Event
sendBtn.addEventListener('click', streamResponse);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    streamResponse();
  }
});

// Auto resize textarea
userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = userInput.scrollHeight + 'px';
});

// Welcome
addMessage(`Halo bro! 👋  
Aku adalah AI **super cepat** pakai **Groq** + **${modelSelect.selectedOptions[0].text}**.  
Mau ngobrol apa hari ini? Bisa coding, curhat, nanya apa aja — gas! 🚀`, 'assistant');
