class Api {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async fetchTickets() {
        const response = await fetch(`${this.baseURL}?method=allTickets`);
        if (!response.ok) {
            throw new Error('Ошибка при получении тикетов');
        }
        return await response.json();
    }

    async createTicket(data) {
        const response = await fetch(`${this.baseURL}?method=createTicket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorMessage = await response.json();
            throw new Error(`Ошибка при создании тикета: ${errorMessage.error || 'Неизвестная ошибка'}`);
        }
        return await response.json();
    }

    async deleteTicketById(id) {
        const response = await fetch(`${this.baseURL}?method=deleteById&id=${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Ошибка при удалении тикета');
        }
    }

    async updateTicketById(id, data) {
        const response = await fetch(`${this.baseURL}?method=updateById&id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Ошибка при обновлении тикета');
        }
        return await response.json();
    }

    async toggleTicketStatus(id, status) {
        const response = await fetch(`${this.baseURL}?method=updateById&id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            throw new Error('Ошибка при обновлении статуса тикета');
        }
    }
}

export default Api;