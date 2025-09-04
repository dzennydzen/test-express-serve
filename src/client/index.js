import './style/style.css';
//тикеты 
const ticketsContainer = document.querySelector('.tickets_container');
//формы
const addForm = document.querySelector('.add_form')
//кнопка создания тикета
const addTicketBtn = document.querySelector('.add_ticket__btn');
//модалки
const overlay = document.querySelector('.overlay');
const addModal = document.querySelector('.add_modal');
const editModal = document.querySelector('.edit_modal');
const deleteModal = document.querySelector('.delete_modal');
const modals = document.querySelectorAll('.modal')


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

async function addTicket(shortVal, fullVal) {
    const response = await fetch('http://localhost:7070/api?method=createTicket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({name: shortVal, description: fullVal, status: false})
    });
    const data = await response.json();

    console.log(data);
    console.log(response);
}

async function handleAddTicket(e) {
    e.preventDefault();
    
    const shortInputVal = e.currentTarget.elements.short_desc.value;
    const fullInputVal = e.currentTarget.elements.full_desc.value;

    console.log(shortInputVal);
    console.log(fullInputVal);

    if (!shortInputVal.trim()) {
        return;
    }

    try {
        const request = await addTicket(shortInputVal, fullInputVal);
        closeModal(addModal)
        renderTickets();
        return;
    } catch (e) {
        console.error('Ошибка при добавлении тикета: ', e.message);
        alert(e.message);
    }
}

function initApp() {
    renderTickets();

    addTicketBtn.addEventListener('click', () => openModal(addModal));
    addForm.addEventListener('submit', handleAddTicket);

    ticketsContainer.addEventListener('click', (e) => {
        const ticket = e.target.closest('.ticket');
        if (!ticket) return;

        const ticketId = ticket.id;

        if (e.target.classList.contains('edit_ticket__btn')) {
            // handleEditTicket(ticketId);
        };
        if (e.target.classList.contains('del_ticket__btn')) {
            // handleDeleteTicket(ticketId)
        }
    })
}

function openModal(modal) {
    if (!modal) return;

    overlay.classList.remove('hidden');
    modal.classList.remove('hidden')
}

function closeModal(modalClass) {
    overlay.classList.add('hidden');
    modals.forEach(m => m.classList.add('hidden'))
}


initApp();