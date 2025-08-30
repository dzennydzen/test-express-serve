import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 7070;

app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let tickets = [{
  id: 1,
  name: "Установить зойпер",
  description: "Просьба установить зойпер, оператор 45, Резон",
  status: false,
  created: 1717076395871
},
{
  id: 2,
  name: "Заявка на помощь",
  description: "ПОМОГИТЕ С 1С!!!",
  status: false,
  created: 1717076395871
}
];

function toShort(t) {
    return {
        id: t.id,
        name: t.name,
        status: t.status,
        created: t.created
    };
};

app.get('/', (req, res) => {
  res.send('🚀 Server is running. Try ?method=allTickets or ?method=ticketById&id=1');
});

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
            ticket = tickets.find(t => t.id === +id);
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

app.post('/', (req, res) => {
    const { method } = req.query;
    console.log('Request method from POST: ', method);
    console.log('Request URL from POST: ', req.url);
    console.log('Full query from POST: ', req.query);
    console.log('Request body from POST: ', req.body);

    if (method !== 'createTicket') res.status(400).json({ error: 'Unknown method' });

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

    res.status(201).json(toShort(fullTicket))
})


app.listen(port, () => {
    console.log(`My express server is listening on ${port}`)
})

export default app;