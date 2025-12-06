# Step 1: Build stage
FROM node:18 AS build
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy rest of the project
COPY . .

# Optional: increase build memory
ENV NODE_OPTIONS="--max_old_space_size=4096"

# Run custom script + vite build
# RUN node generate-build-info.jsx
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Copy final build output
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

