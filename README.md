# MoodleApp (Frontend móvil)

App móvil construida con **Expo + React Native**. Consume la API del backend **MoodleApp-Backend** (proxy hacia Moodle).

Backend: https://github.com/Gabo-UG/MoodleApp-Backend

---

## Requisitos
- Node.js 18+
- npm
- Expo Go (teléfono) o emulador Android/iOS
- Backend corriendo en tu PC (por defecto en `:3000`)

---

## Instalación
```bash
git clone https://github.com/Gabo-UG/MoodleApp-Proyecto.git
cd MoodleApp-Proyecto
npm install
cp .env.example .env
```
---

## Configuración (.env)
### Edita tu .env:
```bash
# URL del backend (NO uses localhost en móvil)
# Ej: http://192.168.1.50:3000
EXPO_PUBLIC_API_BASE_URL=http://TU_IP_AQUI:3000

# IP del servidor Moodle (solo IP, sin http://)
# Ej: 192.168.1.50
EXPO_PUBLIC_MOODLE_IP=TU_IP_AQUI
```
Nota móvil
- En teléfono/emulador localhost no es tu PC.
- Usa la IP LAN de tu computadora (misma red Wi-Fi).

---

### Ejecutar
```bash
npx expo start
```

---

## Troubleshooting
Si no conecta al backend:
- PC y teléfono en la misma red
- firewall permite el puerto 3000
- EXPO_PUBLIC_API_BASE_URL apunta a la IP correcta
