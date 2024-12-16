# Ejemplo de flujo para firmar un documento

* En la aplicación de escritorio se creará un archivo con una clave aleatoria de 1024 caracteres
* Esta clave será enviada por correo todos los usuarios.
* La aplicación móvil permitirá cargar esta clave de forma local
* Cada vez que se necesite subir un archivo a la aplicación móvil, se deberá crear una firma del archivo usando la clave enviada con la aplicación de escritorio.
* La aplicación móvil deberá verificar la firma del archivo antes de permitir subir a la aplicación.

## Compilar aplicación GO

cd firma
go build firma.go

## Instalar paquetes node

cd verifica
npm install


## Crear clave y firmar archivos

En la raiz del proyecto

Generar nueva clave
./firma --generate --output signing_key.txt

Firmar un archivo
./firma --sign --key signing_key.txt --file example.txt

---

### Para el ejemplo en particular

Generar nueva clave
./firma/firma --generate --output ../signing_key.txt

Firmar archivo de ejemplo
./firma/firma  --sign --key ../signing_key.txt --file ../ejemplo.xlsx

Validar la firma
node ./verifica/mobile-verification.js
