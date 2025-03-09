const Koa = require("koa");
const cors = require("@koa/cors");
const bodyParser = require("koa-bodyparser");

const app = new Koa();

app.use(cors());
app.use(bodyParser());
let counterId = 1;
tickets = [];

app.use(async (ctx) => {
    const {method} = ctx.query;
    switch (method) {
        case "allTickets": {
            ctx.body = tickets.map(({id, name, status, created, description  }) => ({
                id,
                name,
                status,
                created,
                description,
            }));
            break;
        }
        case "getTicketId": {
            const ticketId = parseInt(ctx.query.id, 10);
            const ticket = tickets.find((t) => t.id === ticketId);
            if (ticket) {
                ctx.body = ticket;
            } else {
                ctx.status = 404;
                ctx.body = { error: "Ticket not found" };
            }
            break;
        }
        
        case "createTicket": {
            const { name, description, status } = ctx.request.body;
            if (!name || !description) {
                ctx.status = 400;
                ctx.body = { error: "Name and description are required" };
                return;
            }
            const newTicket = {
                id: counterId++,
                name,
                description,
                status: status || false,
                created: Date.now(),
            };
            tickets.push(newTicket);
            ctx.body = newTicket;
            break;
        }

        case "updateTicket": {
            const ticketId = parseInt(ctx.query.id, 10);
            const { name, description, status } = ctx.request.body;
            const ticket = tickets.find((t) => t.id === ticketId);
            if (!ticket) {
                ctx.status = 404;
                ctx.body = { error: "Ticket not found" };
                return;
            }
            if (name !== undefined) {
                ticket.name = name;
            }
            if (description !== undefined) {
                ticket.description = description;
            }
            if (status !== undefined) {
                ticket.status = status;
            }
            ctx.body = ticket;
            break;
                
        }
       
        case "deleteTicket": {
            const ticketId = parseInt(ctx.query.id, 10);
            const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
            if (ticketIndex === -1) {
                ctx.status = 404;
                ctx.body = { error: "Ticket not found" };
                return;
            }
            tickets.splice(ticketIndex, 1);
            ctx.body = { message: "Ticket deleted successfully" };
            break;
        }
        default: {
            ctx.status = 404;
            ctx.body = { error: "Method not found" };
            break;
        }
    }
});

app.listen(7070, () => console.log("Server started on port 7070"));