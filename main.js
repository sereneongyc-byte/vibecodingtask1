class TotoGenerator extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'toto-card');

    const title = document.createElement('h1');
    title.textContent = 'Toto Number Generator';

    const icon = document.createElement('div');
    icon.innerHTML = '&#127922;'; // Dice icon
    icon.setAttribute('class', 'icon');

    const numberContainer = document.createElement('div');
    numberContainer.setAttribute('class', 'number-container');

    const button = document.createElement('button');
    button.textContent = 'Generate Numbers';
    button.addEventListener('click', () => {
      this.generateNumbers(numberContainer);
    });

    const style = document.createElement('style');
    style.textContent = `
      .toto-card {
        background-color: #fff;
        border-radius: 15px;
        padding: 2rem;
        box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
        text-align: center;
      }
      .icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      .number-container {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin: 1rem 0;
      }
      .number-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        font-weight: bold;
        color: #333;
      }
      button {
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
      }
      button:hover {
        background-color: #45a049;
      }
    `;

    shadow.appendChild(style);
    wrapper.appendChild(title);
    wrapper.appendChild(icon);
    wrapper.appendChild(numberContainer);
    wrapper.appendChild(button);
    shadow.appendChild(wrapper);
  }

  generateNumbers(container) {
    container.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 49) + 1);
    }
    for (const number of numbers) {
      const circle = document.createElement('div');
      circle.setAttribute('class', 'number-circle');
      circle.textContent = number;
      container.appendChild(circle);
    }
  }
}

customElements.define('toto-generator', TotoGenerator);
