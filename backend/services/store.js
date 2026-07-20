import fs from 'fs'
import path from 'path'

const storePath = path.resolve('backend/data/store.json')

const readStore = () => {
  try {
    const content = fs.readFileSync(storePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    return { users: [], history: [], payments: [] }
  }
}

const writeStore = (store) => {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8')
}

export const getUsers = () => readStore().users
export const getHistory = () => readStore().history
export const getPayments = () => readStore().payments

export const saveUsers = (users) => {
  const store = readStore()
  store.users = users
  writeStore(store)
}

export const saveHistory = (history) => {
  const store = readStore()
  store.history = history
  writeStore(store)
}

export const savePayments = (payments) => {
  const store = readStore()
  store.payments = payments
  writeStore(store)
}
