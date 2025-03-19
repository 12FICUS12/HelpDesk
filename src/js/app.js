import HelpDesk from './HelpDesk.js';

const baseURL = 'http://localhost:7070'; // Замените на ваш


document.addEventListener("DOMContentLoaded", () => {
    new HelpDesk(baseURL); // Создаем экземпляр HelpDesk после загрузки DOM
});