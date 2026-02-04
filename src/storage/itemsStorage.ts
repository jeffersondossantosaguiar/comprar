import { FilterStatus } from "@/types/FilterStatus"
import AsyncStorage from "@react-native-async-storage/async-storage"

const ITEMS_STORAGE_KEY = "@comprar:items"

export type ItemStorage = {
  id: string
  description: string
  status: FilterStatus
}

async function get(): Promise<ItemStorage[]> {
  try {
    const storedItems = await AsyncStorage.getItem(ITEMS_STORAGE_KEY)
    return storedItems ? JSON.parse(storedItems) : []
  } catch (error) {
    throw new Error("GET_ITEMS: " + error)
  }
}

async function getByStatus(status: FilterStatus): Promise<ItemStorage[]> {
  const storedItems = await get()
  return storedItems.filter((item) => item.status === status)
}

async function save(items: ItemStorage[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    throw new Error("SAVE_ITEMS: " + error)
  }
}

async function add(newItem: ItemStorage): Promise<ItemStorage[]> {
  const storedItems = await get()
  const updatedItems = [...storedItems, newItem]
  await save(updatedItems)
  return updatedItems
}

async function remove(itemId: string): Promise<void> {
  const storedItems = await get()
  const updatedItems = storedItems.filter((item) => item.id !== itemId)
  await save(updatedItems)
}

async function clear(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ITEMS_STORAGE_KEY)
  } catch (error) {
    throw new Error("CLEAR_ITEMS: " + error)
  }
}

async function toggleStatus(itemId: string): Promise<void> {
  const storedItems = await get()
  const updatedItems = storedItems.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        status:
          item.status === FilterStatus.PENDING
            ? FilterStatus.DONE
            : FilterStatus.PENDING
      }
    }
    return item
  })
  await save(updatedItems)
}

export const itemsStorage = {
  add,
  clear,
  get,
  getByStatus,
  remove,
  save,
  toggleStatus
}
