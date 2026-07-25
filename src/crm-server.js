import express from 'express';
import prisma from './db.js';
import { registerUser, loginUser } from './auth.js';
import { authenticateToken } from './authMiddleware.js';

const app = express();
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ status: 'ok', service: 'crm', userCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    const user = await registerUser(name, email, password, role);
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: { tickets: true }
    });
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Internal, service-to-service endpoint — used by the AI service to fetch
// ticket + customer data for the draft-email feature. Still requires a
// valid JWT (forwarded from the original caller), same as any other route.
app.get('/internal/tickets/:ticketId', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { customer: true }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`CRM service running on http://localhost:${PORT}`);
});