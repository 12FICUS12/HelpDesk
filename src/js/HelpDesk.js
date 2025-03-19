import Api from './api.js';
import Modal from './modal.js';

export default class HelpDesk {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.api = new Api(baseURL);
        this.ticketContainer = document.querySelector('#ticketContainer');
        this.addTicketModal = new Modal(document.querySelector('#modalAdd'));
        this.editTicketModal = new Modal(document.querySelector('#modalEdit'));
        this.deleteTicketModal = new Modal(document.querySelector('#modalDelete'));

        this.currentEditTicketId = null;
        this.currentDeleteTicketId = null;

        this.initEventListeners();
        this.fetchTickets();
    }

    initEventListeners() {
        document.querySelector('#ticketAdd').addEventListener('click', () => {
            this.openModal(this.addTicketModal);
        });

        document.querySelector('#closeTicket').addEventListener('click', () => {
            this.closeModal(this.addTicketModal);
        });

        document.querySelector('#closeEditTicket').addEventListener('click', () => {
            this.closeModal(this.editTicketModal);
        });

        document.querySelector('#closeDeleteTicket').addEventListener('click', () => {
            this.closeModal(this.deleteTicketModal);
        });

        document.querySelector('#addTicket').addEventListener('click', () => this.addTicket());
        document.querySelector('#editTicket').addEventListener('click', () => this.updateTicket());
        document.querySelector('#deleteTicket').addEventListener('click', () => this.deleteTicket());
    }

    openModal(modal) {
        if (modal) {
            modal.open(); // Используем метод из Modal
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.close(); // Используем метод из Modal
        } else {
            console.error('Модальное окно не найдено:', modal);
        }
    }

    errorShow(message, errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    errorHide(errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
    }

    async fetchTickets() {
        fetch(`${this.baseURL}?method=allTickets`)
            .then((response) => response.json())
            .then((tickets) => {
                this.ticketContainer.innerHTML = "";
                tickets.forEach((ticket) => this.renderTicket(ticket));
            })
            .catch((error) => {
                console.error('Ошибка при получении тикетов:', error);
            });
    }

    renderTicket(ticket) {
        const ticketElementDiv = document.createElement('div');
        ticketElementDiv.className = 'ticket';
const description = ticket.description || 'Нет описания';
        const date = new Date(ticket.created).toLocaleString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', '');
        ticketElementDiv.innerHTML = `
            <div class="ticket-content">
                <input type="checkbox" ${ticket.status ? "checked" : ""}>
                <span>${ticket.name}</span>
                <span class="ticket-time">${date}</span>
                <button data-id="${ticket.id}" class="edit-btn">✎</button>
                <button data-id="${ticket.id}" class="delete-btn">x</button>
            </div>
            <div class="ticket-details" style="display: none;">${description}</div>`;

        ticketElementDiv
            .querySelector('.edit-btn')
            .addEventListener('click', () => this.openEditModal(ticket));

        ticketElementDiv
            .querySelector('.delete-btn')
            .addEventListener('click', () => this.openDeleteModal(ticket.id));

        ticketElementDiv
            .querySelector('.ticket-content')
            .addEventListener('click', (e) => {
                if (!e.target.classList.contains('edit-btn') && !e.target.classList.contains('delete-btn')) {
                    this.toggleTicketDetails(ticketElementDiv);
                }
            });

        this.ticketContainer.appendChild(ticketElementDiv);
    }

    toggleTicketDetails(ticketElement) {
        const details = ticketElement.querySelector('.ticket-details');
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }

    openEditModal(ticket) {
        this.editTicketModal.open();
        document.querySelector('#editTicketName').value = ticket.name;
        document.querySelector('#editTicketDescription').value = ticket.description;
        this.currentEditTicketId = ticket.id;
    }

    openDeleteModal(id) {
        this.deleteTicketModal.open();
        this.currentDeleteTicketId = id;
    }

    async addTicket() {
        const name = document.querySelector('#ticketName').value;
        const description = document.querySelector('#ticketDescription').value;
 
        if (!name) {
            console.error('Ошибка: название тикета обязательно.');
            // Выводим сообщение об ошибке пользователю
            return;
        }
 
        try {
            await this.api.createTicket({ name, description });
            this.addTicketModal.close();
            this.fetchTickets();
        } catch (error) {
            console.error('Ошибка добавления тикета:', error);
        }
    }

    async updateTicket() {
        const name = document.querySelector('#editTicketName').value;
        const description = document.querySelector('#editTicketDescription').value;

        try {
            await this.api.updateTicketById(this.currentEditTicketId, { name, description });
            this.editTicketModal.close();
            this.fetchTickets();
        } catch (error) {
            console.error('Ошибка обновления тикета:', error);
        }
    }

    async deleteTicket() {
        try {
            await this.api.deleteTicketById(this.currentDeleteTicketId);
            this.deleteTicketModal.close();
            this.fetchTickets();
        } catch (error) {
            console.error('Ошибка удаления тикета:', error);
        }
    }
}