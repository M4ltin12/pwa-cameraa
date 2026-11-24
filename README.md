# CamView

PWA universitaria para instalabilidad nativa y acceso ético a la cámara frontal y trasera. La vista previa se muestra solo en el dispositivo; no se envían imágenes a servidores externos.

## Ejecución local

La cámara y el Service Worker requieren un contexto seguro (HTTPS o `localhost`).

1. Abre una terminal en la carpeta del proyecto.
2. Sirve los archivos con un servidor HTTP local, por ejemplo:

```bash
npx --yes serve .
```

3. Abre en el navegador la URL que indique el servidor (normalmente `http://localhost:3000`).

También puedes usar la extensión Live Server de tu editor apuntando a `index.html`.

## Despliegue en GitHub Pages

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta.
2. En el repositorio ve a **Settings → Pages**.
3. En **Source** selecciona la rama principal y la carpeta `/` (root).
4. Guarda y espera a que GitHub publique el sitio.
5. Abre la URL HTTPS asignada (por ejemplo `https://usuario.github.io/nombre-repo/`).

Las rutas del proyecto son relativas para funcionar correctamente bajo esa URL.
