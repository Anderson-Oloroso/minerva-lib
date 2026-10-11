# Usamos una imagen oficial y ligera de Node.js
FROM node:18-alpine

# Creamos y nos situamos en el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos primero los archivos de dependencias para aprovechar la caché de Docker
COPY package*.json ./

# Instalamos las dependencias del backend
RUN npm install

# Copiamos el resto del código fuente del backend
COPY . .

# Exponemos el puerto en el que corre Express (ej. 5000)
EXPOSE 5000

# Comando para iniciar la aplicación en modo desarrollo o producción
CMD ["npm", "run", "dev"]