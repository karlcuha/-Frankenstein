const form = document.querySelector('#chatForm');
const input = document.querySelector('#messageInput');
const sendButton = document.querySelector('#sendButton');
const messages = document.querySelector('#messages');

const avatars = {
  user: './assets/user_avatar.png',
  bot: './assets/bot_avatar.png',
};

const STAGES = {
  IDLE: 'idle',
  NAME: 'name',
  NUMBERS: 'numbers',
  OPERATION: 'operation',
};

let stage = STAGES.IDLE;
let userName = '';
let currentNumbers = [];

input.addEventListener('input', updateSendButton);

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) {
    updateSendButton();
    return;
  }

  addMessage('user', text);
  input.value = '';
  updateSendButton();

  const typingMessage = addTypingMessage();
  window.setTimeout(() => {
    typingMessage.remove();
    addMessage('bot', createBotAnswer(text));
  }, 650);
});

function updateSendButton() {
  sendButton.disabled = input.value.trim().length === 0;
}

function addMessage(author, text) {
  const message = document.createElement('article');
  message.className = `message message--${author}`;

  const avatar = document.createElement('img');
  avatar.className = 'message__avatar';
  avatar.src = avatars[author];
  avatar.alt = author === 'bot' ? 'Аватар чат-бота' : 'Аватар пользователя';

  const bubble = document.createElement('div');
  bubble.className = 'message__bubble';
  bubble.textContent = text;

  message.append(avatar, bubble);
  messages.append(message);
  keepNewestMessageVisible();

  return message;
}

function addTypingMessage() {
  const message = document.createElement('article');
  message.className = 'message message--bot message--typing';

  const avatar = document.createElement('img');
  avatar.className = 'message__avatar';
  avatar.src = avatars.bot;
  avatar.alt = 'Аватар чат-бота';

  const bubble = document.createElement('div');
  bubble.className = 'message__bubble';
  bubble.innerHTML = '<span class="typing-dots" aria-label="Чат-бот печатает"><span></span><span></span><span></span></span>';

  message.append(avatar, bubble);
  messages.append(message);
  keepNewestMessageVisible();

  return message;
}

function keepNewestMessageVisible() {
  messages.scrollTop = 0;
}

function createBotAnswer(userMessage) {
  const message = userMessage.trim();

  if (message === '/stop') {
    resetBot();
    return 'Всего доброго, если захочешь снова поговорить пиши /start';
  }

  if (stage === STAGES.IDLE) {
    if (message === '/start') {
      stage = STAGES.NAME;
      return 'Привет, меня зовут Чат-бот, а как зовут тебя?';
    }

    return 'Введите команду /start, для начала общения';
  }

  if (message === '/start') {
    stage = STAGES.NAME;
    currentNumbers = [];
    return 'Привет, меня зовут Чат-бот, а как зовут тебя?';
  }

  if (stage === STAGES.NAME) {
    const name = parseName(message);
    if (name) {
      userName = name;
      stage = STAGES.NUMBERS;
      return `Привет ${userName}, приятно познакомится. Я умею считать, введи числа и я с радостью их посчитаю)`;
    }

    return 'Я не очень вас понимаю, введите другую команду!';
  }

  if (stage === STAGES.NUMBERS) {
    const numbers = parseNumbers(message);
    if (numbers) {
      currentNumbers = numbers;
      stage = STAGES.OPERATION;
      return 'Введите одно из действий: -, +, *, /';
    }

    return 'Я не очень вас понимаю, введите другую команду!';
  }

  if (stage === STAGES.OPERATION) {
    if (['+', '-', '*', '/'].includes(message)) {
      const result = calculate(currentNumbers, message);
      stage = STAGES.NUMBERS;
      currentNumbers = [];
      return result;
    }

    return 'Я не очень вас понимаю, введите другую команду!';
  }

  resetBot();
  return 'Я не очень вас понимаю, введите другую команду!';
}

function parseName(message) {
  const match = message.match(/^\/name\s*:\s*(.+)$/i);
  if (!match) return '';

  return match[1].trim().replace(/\s+/g, ' ');
}

function parseNumbers(message) {
  const match = message.match(/^\/number\s*:\s*(.+)$/i);
  if (!match) return null;

  const tokens = match[1].match(/[-+]?\d+(?:[.,]\d+)?/g);
  if (!tokens || tokens.length < 2) return null;

  const numbers = tokens.map((token) => Number(token.replace(',', '.')));
  if (numbers.some((number) => Number.isNaN(number))) return null;

  return numbers;
}

function calculate(numbers, operation) {
  if (!Array.isArray(numbers) || numbers.length < 2) {
    stage = STAGES.NUMBERS;
    return 'Введите числа командой /number: 7, 9';
  }

  if (operation === '/' && numbers.slice(1).some((number) => number === 0)) {
    return 'На ноль делить нельзя вы очень глупый. Введите новые числа командой /number: 7, 9';
  }

  const result = numbers.slice(1).reduce((total, number) => {
    switch (operation) {
      case '+':
        return total + number;
      case '-':
        return total - number;
      case '*':
        return total * number;
      case '/':
        return total / number;
      default:
        return total;
    }
  }, numbers[0]);

  return `Результат: ${formatNumber(result)}`;
}

function formatNumber(number) {
  if (Number.isInteger(number)) return String(number);

  return Number(number.toFixed(10)).toString().replace('.', ',');
}

function resetBot() {
  stage = STAGES.IDLE;
  userName = '';
  currentNumbers = [];
}
