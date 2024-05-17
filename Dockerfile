# Usar la imagen base de Nginx
FROM nginx:alpine

# Copiar el archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos estáticos del frontend
COPY . /usr/share/nginx/html

# Exponer el puerto para Nginx
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
