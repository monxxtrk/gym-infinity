# Gyminfinity Android

App Android Studio que envuelve la plataforma web Gyminfinity en un `WebView`.

## Modo emulador

1. En la raiz del proyecto web instala dependencias con `npm install`.
2. Inicia el servidor web con `npm start`.
3. Abre esta carpeta (`android-app`) desde Android Studio.
4. Ejecuta la configuracion `app` en el emulador.

La app debug carga `http://10.0.2.2:3000`, que es la forma en que el emulador Android entra al `localhost` del PC.

## Pruebas

Desde Android Studio:

- Ejecuta `app` para verificar navegacion real en el emulador.
- Ejecuta `MainActivityTest` para validar que la actividad y el `WebView` levantan correctamente.

Desde terminal, si Android Studio ya genero el wrapper de Gradle:

```powershell
cd android-app
.\gradlew.bat connectedDebugAndroidTest
```

## Produccion

Antes de generar un APK/AAB final, cambia `GYMINFINITY_BASE_URL` en `app/build.gradle` dentro de `release` por el dominio HTTPS real del servidor Gyminfinity.
