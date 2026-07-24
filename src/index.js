import express from 'express';
import prisma from './db.js';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { chunkText, splitIntoPages, getAllowedCategories } from './utils.js';
import { registerUser, loginUser, authenticateToken } from './auth.js';

const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(express.json());

async function generateEmbedding(text) {
  const response = await fetch('http://localhost:11434/api/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nomic-embed-text', input: text })
  });
  const data = await response.json();
  return data.embeddings[0];
}

async function generateAnswer(question, contextChunks) {
  const contextText = contextChunks
    .map((c, i) => `[Source ${i + 1}: ${c.title}, Page ${c.page ?? 'N/A'}]\n${c.content}`)
    .join('\n\n');

  const systemPrompt = `You are a helpful assistant answering questions using ONLY the provided context. 
Rules:
- Only use information from the context below to answer.
- If the context doesn't contain the answer, say "I don't have enough information to answer that."
- Always cite which source(s) you used, like (Source 1) or (Source 2).
- Be concise and direct.`;

  const userPrompt = `Context:\n${contextText}\n\nQuestion: ${question}`;

  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.1:8b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      stream: false
    })
  });

  const data = await response.json();
  return data.message.content;
}

async function generateEmailDraft(customer, ticket, contextChunks) {
  const contextText = contextChunks.length > 0
    ? contextChunks
        .map((c, i) => `[Source ${i + 1}: ${c.title}, Page ${c.page ?? 'N/A'}]\n${c.content}`)
        .join('\n\n')
    : 'No relevant policy documents found.';

  const systemPrompt = `You are a customer support agent drafting a professional, empathetic email reply.
Rules:
- Address the customer by name.
- Reference their specific issue.
- ONLY state specific policy terms (timeframes, coverage periods, conditions) if they are EXPLICITLY present in the policy context below. Do not infer, estimate, or invent numbers, timeframes, or policy details that aren't literally stated in the context.
- If the policy context doesn't contain a clear answer to the customer's specific issue, write a helpful, empathetic general reply acknowledging the issue, and explicitly state that a team member will review the specific policy and follow up — do not guess.
- Keep it concise — 3-5 short paragraphs.
- Sign off as "The Support Team".`;

  const userPrompt = `Customer name: ${customer.name}
Customer email: ${customer.email}
Ticket subject: ${ticket.subject}
Ticket description: ${ticket.description}

Relevant policy context:
${contextText}

Draft a reply email to this customer.`;

  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.1:8b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      stream: false
    })
  });

  const data = await response.json();
  return data.message.content;
}

app.get('/health', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ status: 'ok', userCount });
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

app.post('/documents/upload', authenticateToken, upload.single('file'), async (req, res) => {
  let parser;
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin users can upload documents' });
    }

    const fs = await import('fs');
    const fileBuffer = fs.readFileSync(req.file.path);

    parser = new PDFParse({ data: fileBuffer });
    const pdfData = await parser.getText();

    const document = await prisma.document.create({
      data: {
        title: req.body.title || req.file.originalname,
        category: req.body.category || 'general',
      }
    });

    console.log(`Extracted ${pdfData.text.length} characters from ${req.file.originalname}`);

    const pages = splitIntoPages(pdfData.text);
    let totalChunks = 0;

    for (const page of pages) {
      const pageChunks = chunkText(page.text);

      for (const chunkContent of pageChunks) {
        const embedding = await generateEmbedding(chunkContent);
        const vectorString = `[${embedding.join(',')}]`;

        const chunk = await prisma.documentChunk.create({
          data: {
            content: chunkContent,
            page: page.pageNumber,
            documentId: document.id,
          }
        });

        await prisma.$executeRawUnsafe(
          `UPDATE "DocumentChunk" SET embedding = $1::vector WHERE id = $2`,
          vectorString,
          chunk.id
        );

        totalChunks++;
      }
    }

    console.log(`Created ${totalChunks} chunks across ${pages.length} pages for document ${document.id}`);

    res.json({
      document,
      totalCharacters: pdfData.text.length,
      pagesDetected: pages.length,
      chunksCreated: totalChunks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (parser) await parser.destroy();
  }
});

app.post('/query', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    const questionEmbedding = await generateEmbedding(question);
    const vectorString = `[${questionEmbedding.join(',')}]`;

    const results = await prisma.$queryRawUnsafe(
      `SELECT dc.id, dc.content, dc.page, d.title, d.category,
              1 - (dc.embedding <=> $1::vector) AS similarity
       FROM "DocumentChunk" dc
       JOIN "Document" d ON d.id = dc."documentId"
       WHERE dc.embedding IS NOT NULL
       ORDER BY dc.embedding <=> $1::vector
       LIMIT 5`,
      vectorString
    );

    res.json({ question, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/ask', authenticateToken, async (req, res) => {
  try {
    const { question } = req.body;
    const role = req.user.role;

    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    const allowedCategories = getAllowedCategories(role);

    const questionEmbedding = await generateEmbedding(question);
    const vectorString = `[${questionEmbedding.join(',')}]`;

    const chunks = await prisma.$queryRawUnsafe(
      `SELECT dc.id, dc.content, dc.page, d.title, d.category,
              1 - (dc.embedding <=> $1::vector) AS similarity
       FROM "DocumentChunk" dc
       JOIN "Document" d ON d.id = dc."documentId"
       WHERE dc.embedding IS NOT NULL
         AND d.category = ANY($2::text[])
       ORDER BY dc.embedding <=> $1::vector
       LIMIT 5`,
      vectorString,
      allowedCategories
    );

    const SIMILARITY_THRESHOLD = 0.5;
    const topScore = chunks.length > 0 ? chunks[0].similarity : 0;

    if (chunks.length === 0 || topScore < SIMILARITY_THRESHOLD) {
      return res.json({
        question,
        role,
        answer: "I don't have enough information in the documents you have access to, to answer that question.",
        sources: [],
        topScore
      });
    }

    const answer = await generateAnswer(question, chunks);

    res.json({
      question,
      role,
      answer,
      sources: chunks.map((c) => ({
        title: c.title,
        page: c.page,
        category: c.category,
        similarity: c.similarity
      })),
      topScore
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/tickets/:ticketId/draft-email', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const role = req.user.role;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { customer: true }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const allowedCategories = getAllowedCategories(role);
    const searchQuery = `${ticket.subject} ${ticket.description}`;
    const questionEmbedding = await generateEmbedding(searchQuery);
    const vectorString = `[${questionEmbedding.join(',')}]`;

    const chunks = await prisma.$queryRawUnsafe(
      `SELECT dc.id, dc.content, dc.page, d.title, d.category,
              1 - (dc.embedding <=> $1::vector) AS similarity
       FROM "DocumentChunk" dc
       JOIN "Document" d ON d.id = dc."documentId"
       WHERE dc.embedding IS NOT NULL
         AND d.category = ANY($2::text[])
       ORDER BY dc.embedding <=> $1::vector
       LIMIT 3`,
      vectorString,
      allowedCategories
    );

    const RELEVANCE_THRESHOLD = 0.55;
    const relevantChunks = chunks.filter((c) => c.similarity >= RELEVANCE_THRESHOLD);

    const draft = await generateEmailDraft(ticket.customer, ticket, relevantChunks);

    res.json({
      ticket: { id: ticket.id, subject: ticket.subject, status: ticket.status },
      customer: { name: ticket.customer.name, email: ticket.customer.email },
      draft,
      usedPolicyContext: relevantChunks.length > 0,
      sources: relevantChunks.map((c) => ({ title: c.title, page: c.page, similarity: c.similarity }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});