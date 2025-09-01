import './style/style.css';

const ticketsContainer = document.querySelector('.tickets_container');

async function fetchAllTickets() {
    const allTickets = await fetch('http://localhost:7070/api/?method=allTickets');
    if (!allTickets) {
        const errorData = await allTickets.json();
        throw new Error(errorData.error || 'Ошибка при загрузке тикетов');
    }

    return await allTickets.json();
}

async function fetchTicketById(id) {
    const ticket = await fetch(`http://localhost:7070/api/?method=ticketById&id=${id}`);
    return await ticket.json();
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
    }
    return date.toLocaleString('ru-RU', options).replace(',', '');
}

function renderTicket(ticket) {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'ticket';
    mainDiv.id = ticket.id;

    const innerTicketInfo = `
        <input type="checkbox" class="done_checkbox" ${ticket.status ? 'checked' : ''}>
        <span class="ticket_desc">${ticket.name}</span>
        <span class="date_time">${formatDate(ticket.created)}</span>
        <div class="btns_block">
            <button class="edit_ticket__btn">✎</button>
            <button class="del_ticket__btn">X</button>
        </div>
    `;

    mainDiv.innerHTML = innerTicketInfo;
    return mainDiv;
}

async function renderTickets() {
    ticketsContainer.innerHTML = '';

    try {
        const ticketsList = await fetchAllTickets();
        ticketsList.forEach(t => {
            const ticketElem = renderTicket(t);
            ticketsContainer.append(ticketElem);
        })
    } catch (err) {
        console.error('Ошибка в работе renderTickets: ', err.message);
        ticketsContainer.innerHTML = `<p style="color:red">${err.message}</p>`;
    }
}

renderTickets()