import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

//создание объекта сервера и порта
const app = express();
const PORT = process.env.PORT || 7070;

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(process.cwd(), 'dist')));
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

//хранение тикетов
const ticketsFilePath = path.resolve('./src/api/tickets.json');
function readTicketsFromFile() {
    try {
        const data = fs.readFileSync(ticketsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return []; // если файла нет или ошибка — возвращаем пустой массив
    }
}

function writeTicketsToFile(tickets) {
    fs.writeFileSync(ticketsFilePath, JSON.stringify(tickets, null, 2));
}

let tickets = readTicketsFromFile();
console.log(tickets);

//функция укорачивания тикета для отображения в списке на фронте
function toShort(t) {
    return {
        id: t.id,
        name: t.name,
        status: t.status,
        created: t.created
    };
};

//заглушка для проверки жизнеспособности сервака
app.get('/', (_, res) => {
  res.send('🚀 Server is running. Try ?method=allTickets or ?method=ticketById&id=`ticketId`');
});

//обработчик GET-запросов, получение всего списка или одного конкретного тикета
app.get('/api', (req, res) => {
    const { method, id } = req.query;
    console.log('Request method from GET: ', method);
    console.log('Request URL from GET: ', req.url);
    console.log('Full query from GET: ', req.query);
    console.log('Request body from GET: ', req.body);

    let ticket = null;

    switch (method) {
        case 'allTickets':
            res.json(tickets.map(t => toShort(t)));
            break;
        case 'ticketById':
            ticket = tickets.find(t => t.id === id);
            if (ticket) {
                res.status(200).json(ticket);
            } else if (!id) {
                res.status(404).json({error: 'ID is required'})
            } else {
               res.status(404).json({ error: 'Not found' });
            }
            break;
        default: {
            res.status(400).json({ error: 'Unknown method' });
            break;
        }
    };
})

//обработчик для POST-запроса, создание тикета
app.post('/api', (req, res) => {
    const { method } = req.query;
    console.log('Request method from POST: ', method);
    console.log('Request URL from POST: ', req.url);
    console.log('Full query from POST: ', req.query);
    console.log('Request body from POST: ', req.body);

    if (method !== 'createTicket') res.status(400).json({ error: 'Unknown request' });

    const { name, description, status } = req.body;
    const id = uuidv4();
    const fullTicket = {
        id,
        name,
        description,
        status: status === 'true',
        created: Date.now()
    }
    tickets.push(fullTicket);
    writeTicketsToFile(tickets);

    res.status(201).json(toShort(fullTicket))
})

//обработчик PATCH-запроса, редактирование тикета
app.patch('/api', (req, res) => {
    let { id, method } = req.query;

    if (method !== 'editTicket') res.status(400).json({ error: 'Unknown request' });
    
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return res.status(400).json({ error: 'Ticket to delete is not found' });

    for (const key in req.body) {
        if (Object.prototype.hasOwnProperty.call(ticket, key)) {
            ticket[key] = req.body[key];
        }
    }

    writeTicketsToFile(tickets);
    res.status(200).json(ticket);
})

//обработчик DELETE-запроса, удаление тикета
app.delete('/api', (req, res) => {
    const { id, method } = req.query;

    if (method !== 'deleteTicket') res.status(400).json({ error: 'Unknown request' });

    const ticketId = id;
    const isTicketThere = tickets.some(t => t.id === ticketId);

    if (!isTicketThere) return res.status(400).json({ error: 'Ticket not found' });
    tickets = tickets.filter(t => t.id !== ticketId);
    writeTicketsToFile(tickets);

    res.status(200).json({ message: `Ticket id ${ticketId} deleted successfully` })
})

app.listen(PORT, () => {
    console.log(`My express server is listening on ${PORT}`)
})

export default app;