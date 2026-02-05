//index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
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

import { HelloWave } from "@/components/hello-wave";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  linkGoogleMoodle,
  loginBackend,
  loginWithGoogle,
} from "@/services/moodle";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID =
  "1022276104325-k1s713c9lvgnc571cftp2vo6ucvqpfsq.apps.googleusercontent.com";

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleResponse(id_token);
    } else if (response?.type === "error") {
      Alert.alert("Error", "Error al iniciar sesión con Google");
    } else if (response?.type === "cancel") {
      Alert.alert("Cancelado", "Inicio de sesión cancelado");
    }
  }, [response]);

  const guardarSesion = async (token: string, userData: any) => {
    try {
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      router.replace("/cursos");
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar la sesión");
    }
  };

  const handleGoogleResponse = async (idToken: string) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const result = await loginWithGoogle(idToken);

      console.log("Resultado Google login:", result);

      if (!result.ok) {
        // Mostrar error si ok es false
        setLoading(false);
        setErrorMessage(result.error || "No se pudo iniciar sesión con Google");
        return;
      }

      if (result.requiresLinking) {
        setGoogleIdToken(idToken);
        setGoogleUser(result.googleUser);
        setShowLinkForm(true);
        setLoading(false);
      } else if (result.token) {
        await guardarSesion(result.token, result.user);
      }
    } catch (error: any) {
      console.error("Error en handleGoogleResponse:", error);
      setLoading(false);
      setErrorMessage(error.message || "Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    promptAsync();
  };

  const handleLinkGoogleMoodle = async () => {
    if (!username || !password || !googleIdToken) {
      setErrorMessage("Por favor ingresa tu usuario y contraseña de Moodle");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const result = await linkGoogleMoodle(googleIdToken, username, password);

      if (result.ok) {
        await guardarSesion(result.token, result.user);
        setUsername("");
        setPassword("");
        setShowLinkForm(false);
        setGoogleIdToken(null);
        setGoogleUser(null);
      } else {
        setErrorMessage(result.error || "Error vinculando cuentas");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Error al vincular cuentas");
    } finally {
      setLoading(false);
    }
  };

  const handleNormalLogin = async () => {
    if (!username || !password) {
      setErrorMessage("Por favor ingresa usuario y contraseña");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const result = await loginBackend(username, password);

      if (result.ok) {
        await guardarSesion(result.token, result.user);
      } else {
        setErrorMessage(result.error || "Credenciales incorrectas");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Error al iniciar sesión");
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
          {showLinkForm && googleUser
            ? `Hola ${googleUser.name}, vincula tu cuenta de Moodle`
            : "Moodle App - U. Guayaquil"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Usuario {showLinkForm ? "de Moodle" : "Institucional"}
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

        {errorMessage ? (
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>❌ {errorMessage}</ThemedText>
          </ThemedView>
        ) : null}

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0056b3"
            style={{ marginTop: 20 }}
          />
        ) : (
          <>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={
                showLinkForm ? handleLinkGoogleMoodle : handleNormalLogin
              }
            >
              <ThemedText style={styles.loginButtonText}>
                {showLinkForm ? "Vincular Cuentas" : "Ingresar"}
              </ThemedText>
            </TouchableOpacity>

            {!showLinkForm && (
              <>
                <ThemedView style={styles.divider}>
                  <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                    O ingresa con
                  </ThemedText>
                </ThemedView>

                <TouchableOpacity
                  style={[styles.loginButton, styles.googleButton]}
                  onPress={handleGoogleLogin}
                >
                  <ThemedText style={styles.loginButtonText}>
                    Google 🔐
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}

            {showLinkForm && (
              <TouchableOpacity
                style={[styles.loginButton, styles.cancelButton]}
                onPress={() => {
                  setShowLinkForm(false);
                  setGoogleIdToken(null);
                  setGoogleUser(null);
                  setUsername("");
                  setPassword("");
                }}
              >
                <ThemedText style={styles.loginButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
            )}
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
    backgroundColor: "#DB4437",
    marginTop: 0,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    marginTop: 10,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    backgroundColor: "#f8d7da",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f5c6cb",
  },
  errorText: {
    color: "#721c24",
    fontSize: 14,
    textAlign: "center",
  },
  divider: {
    alignItems: "center",
    marginVertical: 15,
  },
});
