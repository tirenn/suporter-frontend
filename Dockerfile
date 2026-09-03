# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

ARG VITE_BACKEND_URL
ARG VITE_RECAPTCHA_SITE_KEY
ARG VITE_GA_MEASUREMENT_ID

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY
ENV VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID

RUN npm run build

# Stage 2: Serve with Nginx using dynamic template port substitution
FROM nginx:alpine

# Copy nginx config template (Nginx entrypoint automatically substitutes ${PORT} from .env)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Fallback default port
ENV PORT=7080

# Copy build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
