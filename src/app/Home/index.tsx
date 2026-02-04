import { Button } from "@/components/Button"
import { Filter } from "@/components/Filter"
import { Input } from "@/components/Input"
import { Item } from "@/components/Item"
import { itemsStorage, ItemStorage } from "@/storage/itemsStorage"
import { FilterStatus } from "@/types/FilterStatus"
import { useEffect, useState } from "react"
import {
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { styles } from "./styles"

const FILTER_STATUS: FilterStatus[] = [FilterStatus.PENDING, FilterStatus.DONE]

export default function App() {
  const [filter, setFilter] = useState(FilterStatus.PENDING)
  const [description, setDescription] = useState("")
  const [items, setItems] = useState<ItemStorage[]>([])

  async function handleAddItem() {
    if (!description.trim()) {
      return Alert.alert("Atenção", "Descrição inválida")
    }

    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      description: description.trim(),
      status: FilterStatus.PENDING
    }

    const updatedItems = await itemsStorage.add(newItem)

    setItems(updatedItems)
    setFilter(FilterStatus.PENDING)

    Alert.alert("Adicionado", `Adicionado ${description.trim()} à lista`)

    setDescription("")
  }

  async function getItemsByStatus() {
    try {
      const storedItems = await itemsStorage.getByStatus(filter)
      setItems(storedItems)
    } catch (error) {
      console.log(error)
      Alert.alert("Erro", "Falha ao carregar os itens")
    }
  }

  async function handleRemoveItem(itemId: string) {
    try {
      await itemsStorage.remove(itemId)
      await getItemsByStatus()
    } catch (error) {
      console.log(error)
      Alert.alert("Erro", "Falha ao remover o item")
    }
  }

  async function handleStatus(itemId: string) {
    try {
      await itemsStorage.toggleStatus(itemId)
      await getItemsByStatus()
    } catch (error) {
      console.log(error)
      Alert.alert("Erro", "Falha ao atualizar o status do item")
    }
  }

  function handleClear() {
    Alert.alert("Atenção", "Deseja limpar todos os itens?", [
      {
        text: "Cancelar",
        style: "cancel"
      },
      {
        text: "Limpar",
        style: "destructive",
        onPress: () => onClear()
      }
    ])
  }

  async function onClear() {
    try {
      await itemsStorage.clear()
      setItems([])
    } catch (error) {
      console.log(error)
      Alert.alert("Erro", "Falha ao limpar os itens")
    }
  }

  useEffect(() => {
    getItemsByStatus()
  }, [filter])

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/logo.png")} style={styles.logo} />
      <View style={styles.form}>
        <Input
          placeholder="O que você precisa comprar?"
          onChangeText={setDescription}
          value={description}
        />
        <Button title="Adicionar" onPress={handleAddItem} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          {FILTER_STATUS.map((status) => (
            <Filter
              key={status}
              status={status}
              isActive={status === filter}
              onPress={() => setFilter(status)}
            />
          ))}
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Item
              data={item}
              onRemove={() => handleRemoveItem(item.id)}
              onStatus={() => handleStatus(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>Nenhum item aqui</Text>
          )}
        />
      </View>
    </View>
  )
}
