import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { getParticipants } from "../services/moodle";

interface Participant {
  id: number;
  fullname: string;
  email: string;
  profileimageurl: string | null;
  roles: string;
  groups: string;
}

export default function Participantes() {
  const { courseId, nombreCurso } = useLocalSearchParams<{
    courseId: string;
    nombreCurso?: string;
  }>();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const data = await getParticipants(Number(courseId));
      setParticipants(data);
    } catch (error) {
      console.error("Error al obtener participantes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchParticipants();
  };

  //Iconos
  const ItemRow = (icon: any, text: any) => (
    <View style={styles.row}>
      <MaterialIcons name={icon} size={20} style={styles.icon} />
      <Text style={styles.detail}>{text}</Text>
    </View>
  );

  //
  const renderParticipant = ({ item }: { item: Participant }) => (
    <View style={styles.card}>
      <Image
        source={
          item.profileimageurl
            ? { uri: item.profileimageurl }
            : require("../assets/images/no-image.jpg")
        }
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.fullname}</Text>

        {ItemRow("email", item.email)}
        {ItemRow("person", `Rol: ${item.roles}`)}
        {ItemRow("groups", `Grupo: ${item.groups}`)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Participantes" }} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {nombreCurso || "Participantes del Curso"}
        </Text>
        <Text style={styles.headerSubtitle}>
          {participants.length} participante
          {participants.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0056b3"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderParticipant}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No hay participantes</Text>
              <Text style={styles.emptyText}>
                No se encontraron participantes en este curso. Desliza hacia
                abajo para actualizar.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },

  //Iconos
  row: {
    flexDirection: "row",
    alignItems: "center", // centra verticalmente
  },

  icon: {
    marginRight: 8,
    marginTop: 1, // 👈 micro ajuste para alineación visual perfecta
  },

  header: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 15,
    backgroundColor: "#f4f6f8",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: "#e0e0e0",
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },

  detail: {
    fontSize: 13,
    color: "#666",
    marginTop: 3,
  },

  emptyBox: {
    marginTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: { textAlign: "center", color: "#777", lineHeight: 20 },
});
