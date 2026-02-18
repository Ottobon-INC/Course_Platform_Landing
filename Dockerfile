# Stage 1: Build the application
FROM node:20-alpine as build

WORKDIR /app

# Copy package files first to leverage cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output from the previous stage to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (standard for web servers)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
