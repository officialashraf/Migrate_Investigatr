# Step 1: Build stage
FROM node:18 AS build
WORKDIR /app

# Copy only package.json first for better caching
COPY package*.json ./

# Install dependencies with lockfile
RUN npm install --legacy-peer-deps
RUN npm install react-scripts --legacy-peer-deps

# Copy rest of the app
COPY . .

# Fix browserslist DB issue
RUN npx browserslist@latest --update-db

# Increase memory for node build
ENV NODE_OPTIONS="--max_old_space_size=4096"

# Run custom script + build
RUN node generate-build-info.js
RUN npm run build

# Step 2: Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
