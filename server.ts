import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INITIAL_BUDGETS, INITIAL_GOALS, INITIAL_PROFILE, INITIAL_TRANSACTIONS } from './src/data/initialData';
import type { Budget, SavingsGoal, Transaction, UserProfile } from './src/types/finance';
dotenv.config();

type User = { id: string; name: string; email: string; passwordHash: string; createdAt: number };
type Session = { token: string; userId: string; expiresAt: number };
type Database = { users: User[]; sessions: Session[]; profiles: Record<string, UserProfile>; transactions: Record<string, Transaction[]>; budgets: Record<string, Budget[]>; goals: Record<string, SavingsGoal[]> };
type AuthedRequest = Request & { userId?: string };
const root = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(root, 'data', 'finance-db.json');
const port = Number(process.env.PORT ?? 4000);
const emptyDb = (): Database => ({ users: [], sessions: [], profiles: {}, transactions: {}, budgets: {}, goals: {} });
function readDb(): Database {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8')) as Database;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyDb();
    throw error;
  }
}
let db = readDb();
function writeDb() { fs.mkdirSync(path.dirname(dbPath), { recursive: true }); const tmp = `${dbPath}.tmp`; fs.writeFileSync(tmp, JSON.stringify(db, null, 2)); fs.renameSync(tmp, dbPath); }
const makeId = (p: string) => `${p}-${crypto.randomUUID()}`;
const emailOf = (x: unknown) => typeof x === 'string' ? x.trim().toLowerCase() : '';
function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) { return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`; }
function validPassword(password: string, stored: string) { const [salt, digest] = stored.split(':'); if (!salt || !digest) return false; const actual = crypto.scryptSync(password, salt, 64).toString('hex'); return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(digest)); }
function seedUser(user: User) { db.profiles[user.id] = { ...INITIAL_PROFILE, name: user.name, email: user.email }; db.transactions[user.id] = INITIAL_TRANSACTIONS.map(x => ({ ...x })); db.budgets[user.id] = INITIAL_BUDGETS.map(x => ({ ...x })); db.goals[user.id] = INITIAL_GOALS.map(x => ({ ...x })); }
function auth(req: AuthedRequest, res: Response, next: NextFunction) { const token = req.header('authorization')?.replace(/^Bearer\s+/i, ''); const session = token && db.sessions.find(s => s.token === token && s.expiresAt > Date.now()); if (!session) return res.status(401).json({ error: 'Authentication required' }); req.userId = session.userId; next(); }
function data(req: AuthedRequest) { const userId = req.userId!; return { userId, profile: db.profiles[userId], transactions: db.transactions[userId] ?? [], budgets: db.budgets[userId] ?? [], goals: db.goals[userId] ?? [] }; }
function body(req: Request, res: Response) { if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) { res.status(400).json({ error: 'JSON object body required' }); return false; } return true; }
const nonNegative = (x: unknown) => typeof x === 'number' && Number.isFinite(x) && x >= 0;
const isRecord = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
type CollectionPayload<T> = Omit<T, 'id' | 'createdAt'>;

const app = express();
const allowedOrigins = process.env.CLIENT_ORIGIN
  ?.split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(root, 'dist')));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'personal-finance-api', timestamp: new Date().toISOString() }));

function issueSession(res: Response, user: User) { const session = { token: crypto.randomBytes(32).toString('hex'), userId: user.id, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 }; db.sessions = db.sessions.filter(s => s.expiresAt > Date.now()); db.sessions.push(session); writeDb(); return res.json({ token: session.token, expiresAt: session.expiresAt, user: { id: user.id, name: user.name, email: user.email } }); }
app.post('/api/auth/register', (req, res) => { if (!body(req, res)) return; const email = emailOf(req.body.email), name = typeof req.body.name === 'string' ? req.body.name.trim() : '', password = req.body.password; if (!/^\S+@\S+\.\S+$/.test(email) || !name || typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'Name, valid email, and password of at least 6 characters are required' }); if (db.users.some(u => u.email === email)) return res.status(409).json({ error: 'An account with this email already exists' }); const user = { id: makeId('user'), name, email, passwordHash: hashPassword(password), createdAt: Date.now() }; db.users.push(user); seedUser(user); return issueSession(res, user); });
app.post('/api/auth/login', (req, res) => { const user = db.users.find(u => u.email === emailOf(req.body?.email)); if (!user || typeof req.body?.password !== 'string' || !validPassword(req.body.password, user.passwordHash)) return res.status(401).json({ error: 'Invalid email or password' }); return issueSession(res, user); });
app.post('/api/auth/logout', auth, (req: AuthedRequest, res) => { const token = req.header('authorization')?.replace(/^Bearer\s+/i, ''); db.sessions = db.sessions.filter(s => s.token !== token); writeDb(); res.status(204).end(); });
app.get('/api/auth/me', auth, (req: AuthedRequest, res) => { const u = db.users.find(x => x.id === req.userId)!; res.json({ id: u.id, name: u.name, email: u.email }); });
app.use('/api', auth);

app.get('/api/profile', (req: AuthedRequest, res) => res.json(data(req).profile));
app.put('/api/profile', (req: AuthedRequest, res) => { if (!body(req, res)) return; const current = data(req).profile; const profile = { ...current, ...req.body, notifications: { ...current.notifications, ...(req.body.notifications ?? {}) } }; db.profiles[req.userId!] = profile; const user = db.users.find(u => u.id === req.userId)!; user.name = profile.name; user.email = profile.email; writeDb(); res.json(profile); });

function collection<T extends { id: string; createdAt: number }>(
  name: 'transactions' | 'budgets' | 'goals',
  prefix: string,
  validate: (x: unknown) => x is CollectionPayload<T>,
  getItems: (userId: string) => T[],
  setItems: (userId: string, items: T[]) => void,
) {
  app.get(`/api/${name}`, (req: AuthedRequest, res) => { const q = typeof req.query.q === 'string' ? req.query.q.toLowerCase() : ''; const items = getItems(req.userId!); res.json(q ? items.filter(x => JSON.stringify(x).toLowerCase().includes(q)) : items); });
  app.post(`/api/${name}`, (req: AuthedRequest, res) => { if (!body(req, res)) return; const payload: unknown = req.body; if (!validate(payload)) return res.status(400).json({ error: `Invalid ${name.slice(0, -1)} payload` }); const item = { ...payload, id: makeId(prefix), createdAt: Date.now() } as T; const items = getItems(req.userId!); items.unshift(item); setItems(req.userId!, items); writeDb(); res.status(201).json(item); });
  app.put(`/api/${name}/:id`, (req: AuthedRequest, res) => { if (!body(req, res)) return; const payload: unknown = req.body; if (!validate(payload)) return res.status(400).json({ error: `Invalid ${name.slice(0, -1)} payload` }); const items = getItems(req.userId!); const i = items.findIndex(x => x.id === req.params.id); if (i < 0) return res.status(404).json({ error: 'Record not found' }); items[i] = { ...items[i], ...payload, id: items[i].id, createdAt: items[i].createdAt }; setItems(req.userId!, items); writeDb(); res.json(items[i]); });
  app.delete(`/api/${name}/:id`, (req: AuthedRequest, res) => { const items = getItems(req.userId!); const next = items.filter(x => x.id !== req.params.id); if (next.length === items.length) return res.status(404).json({ error: 'Record not found' }); setItems(req.userId!, next); writeDb(); res.status(204).end(); });
}
const isTransaction = (x: unknown): x is CollectionPayload<Transaction> =>
  isRecord(x) &&
  (x.type === 'income' || x.type === 'expense') &&
  typeof x.date === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(x.date) &&
  typeof x.category === 'string' &&
  typeof x.description === 'string' &&
  typeof x.paymentMethod === 'string' &&
  nonNegative(x.amount);
const isBudget = (x: unknown): x is CollectionPayload<Budget> =>
  isRecord(x) && typeof x.category === 'string' && nonNegative(x.monthlyLimit) &&
  (x.month === undefined || (typeof x.month === 'string' && /^\d{4}-\d{2}$/.test(x.month)));
const isSavingsGoal = (x: unknown): x is CollectionPayload<SavingsGoal> =>
  isRecord(x) &&
  typeof x.name === 'string' &&
  nonNegative(x.targetAmount) &&
  nonNegative(x.currentAmount) &&
  typeof x.targetDate === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(x.targetDate);
collection<Transaction>('transactions', 'tx', isTransaction, userId => db.transactions[userId] ?? [], (userId, items) => { db.transactions[userId] = items; });
collection<Budget>('budgets', 'bg', isBudget, userId => db.budgets[userId] ?? [], (userId, items) => { db.budgets[userId] = items; });
collection<SavingsGoal>('goals', 'goal', isSavingsGoal, userId => db.goals[userId] ?? [], (userId, items) => { db.goals[userId] = items; });
app.post('/api/goals/:id/funds', (req: AuthedRequest, res) => { const amount = req.body?.amount; if (!nonNegative(amount) || amount === 0) return res.status(400).json({ error: 'A positive amount is required' }); const goal = (db.goals[req.userId!] ?? []).find(g => g.id === req.params.id); if (!goal) return res.status(404).json({ error: 'Goal not found' }); goal.currentAmount += amount; writeDb(); res.json(goal); });

function totals(items: Transaction[]) { const income = items.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0); const expense = items.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0); return { income, expense, balance: income - expense }; }
app.get('/api/dashboard', (req: AuthedRequest, res) => { const d = data(req); res.json({ profile: d.profile, transactions: d.transactions, budgets: d.budgets, goals: d.goals, totals: totals(d.transactions), counts: { transactions: d.transactions.length, budgets: d.budgets.length, goals: d.goals.length } }); });
app.get('/api/reports/summary', (req: AuthedRequest, res) => { const month = typeof req.query.month === 'string' ? req.query.month : new Date().toISOString().slice(0, 7); const items = data(req).transactions.filter(t => t.date.startsWith(month)); const byCategory = items.filter(t => t.type === 'expense').reduce<Record<string, number>>((a, t) => { a[t.category] = (a[t.category] ?? 0) + t.amount; return a; }, {}); res.json({ month, ...totals(items), byCategory, transactionCount: items.length }); });
app.get('/api/export', (req: AuthedRequest, res) => { const d = data(req); res.json({ version: '1.0', exportedAt: new Date().toISOString(), profile: d.profile, transactions: d.transactions, budgets: d.budgets, goals: d.goals }); });
app.post('/api/data/demo', (req: AuthedRequest, res) => { db.transactions[req.userId!] = INITIAL_TRANSACTIONS.map(x => ({ ...x })); db.budgets[req.userId!] = INITIAL_BUDGETS.map(x => ({ ...x })); db.goals[req.userId!] = INITIAL_GOALS.map(x => ({ ...x })); writeDb(); res.json(data(req)); });
app.delete('/api/data', (req: AuthedRequest, res) => { db.transactions[req.userId!] = []; db.budgets[req.userId!] = []; db.goals[req.userId!] = []; writeDb(); res.status(204).end(); });
app.get('*', (req, res, next) => req.path.startsWith('/api') ? next() : res.sendFile(path.join(root, 'dist', 'index.html')));
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });
app.listen(port, () => console.log(`Personal Finance API listening on http://localhost:${port}`));
