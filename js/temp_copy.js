(function () {
  'use strict';

  const MAX_PIN_LENGTH = 6;
  const KEYPAD_SIZE = 12;
  const FACE_BUTTON_INDEX = 9;
  const BACK_BUTTON_INDEX = 11;

  const keypadContainer = document.querySelector('#keypad_container');
  if (!keypadContainer) return;

  keypadContainer.innerHTML = '';

  let keypadButtons = [];
  let inputDigits = [];
  let keypadData = [];

  function getButtonType(index) {
    if (index === FACE_BUTTON_INDEX) return 'face';
    if (index === BACK_BUTTON_INDEX) return 'back';
    return 'number';
  }

  function createShuffledKeypadData() {
    const numbers = Array.from({ length: 10 }, (_, i) => i);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    const data = [];
    for (let i = 0; i < KEYPAD_SIZE; i++) {
      const type = getButtonType(i);
      if (type === 'face') {
        data.push('face');
      } else if (type === 'back') {
        data.push('back');
      } else {
        data.push(numbers.shift());
      }
    }
    return data;
  }

  function createButton(value, type) {
    const button = document.createElement('button');
    button.type = 'button';
    const typeClass =
      type === 'face' ? 'btn_face' : type === 'back' ? 'btn_back' : 'btn_number';
    button.classList.add(typeClass);
    const span = document.createElement('span');
    span.textContent = value;
    button.appendChild(span);
    return button;
  }

  function renderKeypad() {
    keypadData.forEach((value, index) => {
      const type = getButtonType(index);
      const button = createButton(value, type);
      keypadContainer.appendChild(button);
    });
    keypadButtons = keypadContainer.querySelectorAll('button');
    attachButtonListeners();
  }

  function attachButtonListeners() {
    keypadButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (button.closest('.btn_face')) {
          handleFaceIdClick();
        } else if (button.closest('.btn_back')) {
          handleBackClick();
        } else {
          handleNumberClick(button);
        }
      });
    });
  }

  function handleNumberClick(button) {
    if (inputDigits.length >= MAX_PIN_LENGTH) {
      inputDigits = [];
      return;
    }
    if (inputDigits.length < MAX_PIN_LENGTH) {
      inputDigits.push(button.textContent.trim());
      playButtonEffect(button);
    }
  }

  function handleBackClick() {
    if (inputDigits.length > 0) {
      inputDigits.pop();
    }
  }

  function handleFaceIdClick() {
    alert('안면인식');
  }

  function playButtonEffect(button) {
    button.classList.add('active');
    button.addEventListener(
      'animationend',
      () => button.classList.remove('active'),
      { once: true }
    );
  }

  const btnAdd = document.querySelector('.btnAdd');
  if (btnAdd) {
    btnAdd.addEventListener(
      'click',
      () => {
        keypadData = createShuffledKeypadData();
        renderKeypad();
      },
      { once: true }
    );
    btnAdd.click();
  }
})();
