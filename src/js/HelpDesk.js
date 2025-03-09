export default class HelpDesk {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.ticketContainer = document.querySelector('#ticketContainer');
        this.addTicketBtn = document.querySelector('#ticketAdd');
        this.modalAdd = document.querySelector('#modalAdd');
        this.modalEdit = document.querySelector('#modalEdit');
        this.modalDelete = document.querySelector('#modalDelete');
        this.addTicketButton = document.querySelector('#addTicket'); // Переименовано для ясности
        this.editTicketButton = document.querySelector('#editTicket'); // Переименовано для ясности
        this.deleteTicketButton = document.querySelector('#deleteTicket'); // Переименовано для ясности
        this.closeTicket = document.querySelector('#closeTicket');
        this.closeEditTicket = document.querySelector('#closeEditTicket');
        this.closeDeleteTicket = document.querySelector('#closeDeleteTicket');
        this.ticketNameInput = document.querySelector('#ticketName');
        this.ticketDescriptionInput = document.querySelector('#ticketDescription');
        this.editTicketNameInput = document.querySelector('#editTicketName');
        this.editTicketDescriptionInput = document.querySelector('#editTicketDescription');

        this.addMessageError = document.querySelector('#addMessageError');
        this.editModalError = document.querySelector('#editModalError');
        this.currentEditTicketId = null;
        this.currentDeleteTicketId = null;

        this.initEventListeners();
        this.fetchTickets();
        this.closeModal(this.modalAdd);
        this.closeModal(this.modalEdit);
        this.closeModal(this.modalDelete);
    }

    initEventListeners() {
        this.addTicketBtn.addEventListener('click', () => {
            this.openModal(this.modalAdd);
        });
        this.closeTicket.addEventListener('click', () => {
            this.closeModal(this.modalAdd);
        });
        this.closeEditTicket.addEventListener('click', () => {
            this.closeModal(this.modalEdit);
        });
        this.closeDeleteTicket.addEventListener('click', () => {
            this.closeModal(this.modalDelete);
        });

        this.addTicketButton.addEventListener('click', () => this.addTicket());
        this.editTicketButton.addEventListener('click', () => this.updateTicket());
        this.deleteTicketButton.addEventListener('click', () => this.deleteTicket());
    }

    openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
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

    fetchTickets() {
        fetch(`${this.baseURL}?method=allTickets`)
            .then((response) => response.json())
            .then((tickets) => {
                this.ticketContainer.innerHTML = "";
                tickets.forEach((ticket) => this.renderTicket(ticket));
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
            minute: '2-digit',
        }).replace(',', '');
        ticketElementDiv.innerHTML = `
            <div class="ticket-content">
                <input type="checkbox" ${ticket.status ? "checked" : ""}>
                <span>${ticket.name}</span>
                <span class="ticket-time">${date}</span>
                <button class="edit-btn">✎</button>
                <button class="delete-btn">x</button>
            </div>
            <div class="ticket-details" style="display: none;">
                ${description}
            </div>`;
        
        ticketElementDiv
            .querySelector(".ticket-content")
            .addEventListener("click", (e) => {
                if (!e.target.classList.contains("edit-btn") && !e.target.classList.contains("delete-btn")) {
                    this.toggleTicketDetails(ticketElementDiv); // Исправлено на ticketElementDiv
                }
            });
        
        ticketElementDiv
            .querySelector("input")
            .addEventListener("click", (e) => this.toggleTicketStatus(ticket.id, e));
        
        ticketElementDiv
            .querySelector(".edit-btn")
            .addEventListener("click", (e) => this.openEditModal(ticket.id, e));
        
        ticketElementDiv
            .querySelector(".delete-btn")
            .addEventListener("click", (e) => this.openDeleteModal(ticket.id, e));
        
        this.ticketContainer.appendChild(ticketElementDiv);
    }

    toggleTicketDetails(ticketElement) {
        const details = ticketElement.querySelector(".ticket-details");
        details.style.display = details.style.display === "none" ? "block" : "none";
    }

    toggleTicketStatus(id, event) {
        event.stopPropagation();
        fetch(`${this.baseURL}?method=updateTicket&id=${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: event.target.checked }),
        }).then(() => this.fetchTickets());
    }

    addTicket() {
        const name = this.ticketNameInput.value.trim();
        const description = this.ticketDescriptionInput.value.trim();

        if (!name || !description) {
            this.errorShow('Заполните все поля!', this.addMessageError);
            return;
        }

        this.errorHide(this.addMessageError);

        fetch(`${this.baseURL}?method=createTicket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description })
        })
            .then(response => response.json())
            .then(data => {
                this.closeModal(this.modalAdd);
                this.fetchTickets(); // Обновить список тикетов
            })
            .catch(error => {
                console.error('Ошибка при добавлении тикета:', error);
                this.errorShow('Ошибка добавления тикета. Пожалуйста, попробуйте снова.', this.addMessageError);
            });
    }

    openEditModal(id, event) {
        event.stopPropagation();
        this.currentEditTicketId = id;
        fetch(`${this.baseURL}?method=getTicketId&id=${id}`) // Исправлено на this.baseURL
            .then((response) => response.json())
            .then((ticket) => {
                this.editTicketNameInput.value = ticket.name;
                this.editTicketDescriptionInput.value = ticket.description;
                this.openModal(this.modalEdit);
            });
    }

    updateTicket() {
        const name = this.editTicketNameInput.value.trim();
        const description = this.editTicketDescriptionInput.value.trim();

        if (!name || !description) {
            this.errorShow('Заполните все поля!', this.editModalError);
            return;
        }

        this.errorHide(this.editModalError);

        fetch(`${this.baseURL}?method=updateTicket&id=${this.currentEditTicketId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                description,
            }),
        })
            .then((response) => response.json())
            .then(() => {
                this.closeModal(this.modalEdit);
                this.fetchTickets();
            })
            .catch(error => {
                console.error('Ошибка при обновлении тикета:', error);
                this.errorShow('Ошибка обновления тикета. Пожалуйста, попробуйте снова.', this.editModalError);
            });
    }

    openDeleteModal(id, event) {
        event.stopPropagation();
        this.currentDeleteTicketId = id;
        this.openModal(this.modalDelete);
    }

    deleteTicket() {
        fetch(`${this.baseURL}?method=deleteTicket&id=${this.currentDeleteTicketId}`)
            .then(() => {
                this.closeModal(this.modalDelete);
                this.fetchTickets();
            })
            .catch(error => {
                console.error('Ошибка при удалении тикета:', error);
            });
    }
}