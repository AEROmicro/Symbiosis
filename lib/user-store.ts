import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

export interface UserPreferences {
  watchlist: string[]
  widgetLayout: object[]
  theme: string
  exchange: string
  modernEnabled: boolean
  modernTheme: string
  scanlineEnabled: boolean
}

export interface StoredUser {
  id: string
  email: string
  passwordHash: string
  displayName: string
  createdAt: string
  preferences: UserPreferences
}

interface UsersStore {
  users: Record<string, StoredUser>
}

const DEFAULT_PREFS: UserPreferences = {
  watchlist: ['^IXIC', '^GSPC', '^DJI'],
  widgetLayout: [],
  theme: 'default',
  exchange: 'NYSE',
  modernEnabled: false,
  modernTheme: 'dark',
  scanlineEnabled: true,
}

async function ensureDataDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }) } catch { /* ignore */ }
}

async function readStore(): Promise<UsersStore> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { users: {} }
  }
}

async function writeStore(store: UsersStore): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(USERS_FILE, JSON.stringify(store, null, 2), 'utf-8')
}

export async function createUser(email: string, passwordHash: string, displayName: string): Promise<StoredUser> {
  const store = await readStore()
  const key = email.toLowerCase()
  if (store.users[key]) throw new Error('User already exists')
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: key,
    passwordHash,
    displayName,
    createdAt: new Date().toISOString(),
    preferences: { ...DEFAULT_PREFS },
  }
  store.users[key] = user
  await writeStore(store)
  return user
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const store = await readStore()
  return store.users[email.toLowerCase()] ?? null
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const store = await readStore()
  return Object.values(store.users).find(u => u.id === id) ?? null
}

export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
  const store = await readStore()
  const user = Object.values(store.users).find(u => u.id === userId)
  if (user) {
    user.preferences = { ...user.preferences, ...preferences }
    await writeStore(store)
  }
}
