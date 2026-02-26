FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY frontend/package*.json ./
COPY frontend/tsconfig*.json ./
COPY frontend/vite.config.ts ./vite.config.ts
COPY frontend/postcss.config.js ./postcss.config.js
COPY frontend/tailwind.config.ts ./tailwind.config.ts
COPY frontend/components.json ./components.json
COPY frontend/. .

RUN npm ci && npm run build

FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

