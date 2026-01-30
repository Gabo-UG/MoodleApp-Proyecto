//index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

// Componentes tuyos
import { HelloWave } from "@/components/hello-wave";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

// --- CONFIGURACIÓN ---

// 1. BACKEND NODE (Para usuario/contraseña normal)
// Tu backend corre en el puerto 3000
const BACKEND_URL = "http://192.168.100.36:3000";

// 2. MOODLE DIRECTO (Para Google)
// Moodle suele correr en el puerto 80 (sin puerto) o en 8080.
// const MOODLE_LAUNCH_URL =
//   "http://192.168.100.36/moodle/admin/tool/mobile/launch.php?service=app_movil&passport=12345&urlscheme=moodleapp";
// IMPORTANTE: service=app_movil (Este nombre debe coincidir con el servicio externo en Moodle)

// const MOODLE_LAUNCH_URL =
//   "http://192.168.100.36/moodle/admin/tool/mobile/launch.php?service=moodle_mobile_app&passport=12345&urlscheme=moodleapp";

// Usamos TU servicio 'app_movil' que acabas de crear/verificar
// Asegúrate de que diga: service=moodle_mobile_app

const MOODLE_LAUNCH_URL =
  "http://192.168.100.36/moodle/admin/tool/mobile/launch.php?service=moodle_mobile_app&passport=12345&urlscheme=moodleapp";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- ESCUCHAR RETORNO DE GOOGLE ---
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      // Moodle nos devuelve algo como: moodleapp://token=EL_TOKEN_GIGANTE...
      // O a veces: moodleapp://?token=...
      console.log("Deep link recibido:", event.url);

      let token = "";

      // Lógica para extraer el token de la URL
      if (event.url.includes("token=")) {
        const parts = event.url.split("token=");
        if (parts.length > 1) {
          token = parts[1].split("&")[0]; // Tomamos lo que esté después de token= y antes de otro &
        }
      }

      if (token) {
        console.log("¡Token capturado!", token);
        await guardarSesion(token, {
          fullname: "Usuario Google",
          username: "google",
        });
      }
    };

    // Suscribirse al evento de enlace
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);

  // Función común para guardar y navegar
  const guardarSesion = async (token: string, userData: any) => {
    try {
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      router.replace("/cursos");
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar la sesión");
    }
  };

  // --- LOGIN CON GOOGLE ---
  const handleGoogleLogin = async () => {
    try {
      // Abre el navegador del sistema (Chrome/Safari) apuntando a Moodle
      await WebBrowser.openBrowserAsync(MOODLE_LAUNCH_URL);
      // Cuando el usuario termine en Moodle, el navegador se cerrará solo
      // y se disparará el useEffect de arriba.
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir el navegador");
    }
  };

  // --- LOGIN NORMAL (Backend Node) ---
  const handleNormalLogin = async () => {
    if (!username || !password) {
      Alert.alert("Campos vacíos", "Por favor ingresa usuario y contraseña");
      return;
    }

    setLoading(true);
    try {
      console.log("Conectando a:", `${BACKEND_URL}/auth/login`);
      const res = await axios.post(`${BACKEND_URL}/auth/login`, {
        username,
        password,
      });

      if (res.data.ok) {
        await guardarSesion(res.data.token, res.data.user);
        setUsername("");
        setPassword("");
      } else {
        Alert.alert(
          "Error de acceso",
          res.data.error || "Credenciales incorrectas",
        );
      }
    } catch (error: any) {
      console.error("Login error:", error.message);
      Alert.alert(
        "Error de conexión",
        "No se pudo conectar con el servidor Node.js",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerContainer}>
        <HelloWave />
        <ThemedText type="title" style={styles.title}>
          Bienvenido
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Moodle App - U. Guayaquil
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        {/* INPUTS NORMALES */}
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Usuario Institucional
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              color: colorScheme === "dark" ? "#fff" : "#000",
              borderColor: colorScheme === "dark" ? "#444" : "#ddd",
            },
          ]}
          placeholder="Ej: estudiante1"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <ThemedText type="defaultSemiBold" style={styles.label}>
          Contraseña
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              color: colorScheme === "dark" ? "#fff" : "#000",
              borderColor: colorScheme === "dark" ? "#444" : "#ddd",
            },
          ]}
          placeholder="********"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0056b3"
            style={{ marginTop: 20 }}
          />
        ) : (
          <>
            {/* BOTÓN NORMAL */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleNormalLogin}
            >
              <ThemedText style={styles.loginButtonText}>Ingresar</ThemedText>
            </TouchableOpacity>

            <ThemedView style={styles.divider}>
              <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                O ingresa con
              </ThemedText>
            </ThemedView>

            {/* BOTÓN GOOGLE */}
            <TouchableOpacity
              style={[styles.loginButton, styles.googleButton]}
              onPress={handleGoogleLogin}
            >
              {/* Puedes poner un icono de Google aquí si quieres */}
              <ThemedText style={styles.loginButtonText}>Google 🌐</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    marginTop: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 5,
    textAlign: "center",
  },
  card: {
    padding: 20,
    borderRadius: 16,
    // Sombra suave
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "transparent", // Para que tome el fondo del ThemedView si fuera necesario
  },
  loginButton: {
    backgroundColor: "#0056b3",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  googleButton: {
    backgroundColor: "#DB4437", // Rojo oficial de Google
    marginTop: 0,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    alignItems: "center",
    marginVertical: 15,
  },
});
