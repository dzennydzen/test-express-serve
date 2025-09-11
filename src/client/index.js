import './style/style.css';
//тикеты 
const ticketsContainer = document.querySelector('.tickets_container');
//формы
const addForm = document.querySelector('.add_form');
const editForm = document.querySelector('.edit_form');
const delForm = document.querySelector('.delete_form');
//кнопки
const addTicketBtn = document.querySelector('.add_ticket__btn');
const cancelBtns = document.querySelectorAll('.cancel_modal__btn');
//модалки
const overlay = document.querySelector('.overlay');
const addModal = document.querySelector('.add_modal');
const editModal = document.querySelector('.edit_modal');
const deleteModal = document.querySelector('.delete_modal');
const modals = document.querySelectorAll('.modal');

let tickets = [];

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

function toShort(t) {
    return {
        id: t.id,
        name: t.name,
        status: t.status,
        created: t.created
    };
};

function renderTicket(ticket) {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'ticket';
    mainDiv.id = ticket.id;

    const innerTicketInfo = `
        <div class='ticket_main_info'>
        <input type="checkbox" class="done_checkbox" ${ticket.status ? 'checked' : ''}>
        <span class="ticket_name">${ticket.name}</span>
        <span class="date_time">${formatDate(ticket.created)}</span>
        <div class="btns_block">
            <button class="edit_ticket__btn">✎</button>
            <button class="del_ticket__btn">X</button>
        </div>
        </div>
        <div class="ticket_description hidden">
            aboba
        </div>
    `;

    mainDiv.innerHTML = innerTicketInfo;
    return mainDiv;
}

async function renderTickets() {
    ticketsContainer.innerHTML = '';

    try {
        tickets.forEach(t => {
            const ticketElem = renderTicket(t);
            ticketsContainer.append(ticketElem);

            const ticketName = ticketElem.querySelector('.ticket_name');
            const nameRect = ticketName.getBoundingClientRect();
            const parentRect = ticketElem.getBoundingClientRect();
            const offsetLeft = nameRect.left - parentRect.left;

            const ticketDesc = ticketElem.querySelector('.ticket_description');
            ticketDesc.style.marginLeft = `${offsetLeft}px`;
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

    console.log('Ответ из addTicket: ', data);
    console.log('Ответ целиком оттуда же: ', response);

    if (!response.ok || data.error) {
        throw new Error(data.error || 'Ошибка сервера')
    }

    const fullTicket = await fetchTicketById(data.id);
    tickets.push(fullTicket)

    alert(`Тикет id ${data.id.slice(0,8)} успешно создан!`);
    return;
}

async function handleAddTicket(e) {
    e.preventDefault();
    
    const shortInputVal = e.currentTarget.elements.short_desc.value;
    const fullInputVal = e.currentTarget.elements.full_desc.value;

    if (!shortInputVal.trim()) {
        return;
    }

    try {
        const request = await addTicket(shortInputVal, fullInputVal);
        console.log(request)
        closeModal(addModal);
        renderTickets();
        return;
    } catch (e) {
        closeModal(addModal)
        console.error('Ошибка при добавлении тикета: ', e.message);
        alert(e.message);
    }
}

async function handleEditTicket(e) {
    e.preventDefault();
    
    const ticketId = e.currentTarget.dataset.id;
    const savedTicket = tickets.find(t => t.id === ticketId)
    const oldShortVal = savedTicket.name;
    const oldFullVal = savedTicket.description;

    const newShortVal = e.currentTarget.elements.short_desc.value === oldShortVal 
    ? null 
    : e.currentTarget.elements.short_desc.value;

    const newFullVal = e.currentTarget.elements.full_desc.value === oldFullVal
    ? null
    : e.currentTarget.elements.full_desc.value;

    const valuePairs = [['name', newShortVal], ['description', newFullVal]];
    const updatedFields = valuePairs.reduce((finalObj, pair) => {
        if (pair[1] !== null) {
          finalObj[pair[0]] = pair[1].trim();
        }
        return finalObj;
    }, {});

    try {
        const request = await editTicket(ticketId, updatedFields);
        console.log(request);
        renderTickets();
        return;
    } catch (e) {
        console.error('Ошибка при изменении тикета: ', e.message);
        alert(e.message);
    } finally {
        closeModal(editModal);
    }
}

async function editTicket(ticketId, updatedFields, showAlert = true) {
    const response = await fetch(`http://localhost:7070/api?method=editTicket&id=${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
    })

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || 'Ошибка сервера')
    }

    const index = tickets.findIndex(t => t.id === ticketId);
    if (index >= 0) {
        tickets[index] = {...toShort(data)};
    }

    if (showAlert) {
        alert(`Тикет id ${data.id.slice(0,8)} успешно отредактирован!`);
    }

    return;
}

async function handleDeleteTicket(e) {
    e.preventDefault();

    const ticketId = delForm.dataset.id;

    try {
       await deleteTicket(ticketId);
       renderTickets(); 
    } catch (e) {
        console.error('Ошибка при удалении тикета: ', e.message);
        alert(e.message);
    } finally {
        closeModal(deleteModal);
    }
}

async function deleteTicket(ticketId) {
    const response = await fetch(`http://localhost:7070/api?method=deleteTicket&id=${ticketId}`, {
        method: 'DELETE'
    });

    const data = await response.json();
    console.log(data)

    if (!response.ok || data.error) {
        throw new Error(data.error || 'Ошибка сервера')
    };

    tickets = tickets.filter(t => t.id !== ticketId);
    alert(`Тикет id ${ticketId.slice(0,8)} успешно удален!`);
    return;
} 

async function handleToggleStatus(e) {
    const ticketId = e.target.closest('.ticket').id;
    const changedTicket = tickets.find(t => t.id === ticketId);
    changedTicket.status = e.target.checked;

    const ticketDesc = e.target.nextElementSibling;
    if (changedTicket.status) {
        ticketDesc.classList.add('crossed');
    } else {
        ticketDesc.classList.remove('crossed');
    }

    await editTicket(ticketId, { status: e.target.checked }, false);
}

async function initApp() {
    closeModal();
    tickets = await fetchAllTickets();
    renderTickets();

    addTicketBtn.addEventListener('click', () => openModal(addModal));
    addForm.addEventListener('submit', handleAddTicket);
    editForm.addEventListener('submit', handleEditTicket);
    delForm.addEventListener('submit', handleDeleteTicket);

    ticketsContainer.addEventListener('click', async (e) => {
        const ticket = e.target.closest('.ticket');
        if (!ticket) return;

        const ticketId = ticket.id;
        const ticketObj = tickets.find(t => t.id === ticketId)

        if (e.target.classList.contains('edit_ticket__btn')) {
            editForm.dataset.id = ticketId;
            editForm.elements.short_desc.value = ticketObj.name;
            const fetchedTicket = await fetchTicketById(ticketId);
            editForm.elements.full_desc.value = fetchedTicket.description;

            openModal(editModal);
        };
        if (e.target.classList.contains('del_ticket__btn')) {
            delForm.dataset.id = ticketId;
            openModal(deleteModal);
        };
        if (!e.target.closest('.edit_ticket__btn') && !e.target.closest('.del_ticket__btn') && !e.target.classList.contains('done_checkbox')) {
            const fetchedDesc = await loadTicketDesc(ticket.id);
            showTicketDesc(ticket, fetchedDesc)
        };
        if (e.target.classList.contains('done_checkbox')) {
            e.target.addEventListener('change', handleToggleStatus)
        }
    });

    cancelBtns.forEach(btn => btn.addEventListener('click', () => closeModal()));
}


async function loadTicketDesc(ticketId) {
    const response = await fetchTicketById(ticketId);
    return response.description;
}

async function showTicketDesc(ticketElem, description) {
    const descBlock = ticketElem.querySelector('.ticket_description');
    descBlock.innerText = description;
    descBlock.classList.toggle('hidden')
}

function openModal(modal) {
    if (!modal) return;

    overlay.classList.remove('hidden');
    modal.classList.remove('hidden')
}

function closeModal() {
    overlay.classList.add('hidden');
    modals.forEach(m => m.classList.add('hidden'))
}


initApp();

