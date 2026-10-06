# Frontend (Next.js) — imagen de producción para docker compose o cualquier
# runtime de contenedores. En local: docker compose up --build -> :3000
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# NEXT_PUBLIC_* se inyecta en build: hay que pasarla como build-arg (en
# docker-compose.yaml está hecha). API_URL, AUTH_SECRET, etc., son de runtime
# y se inyectan con `environment:` en compose o en la plataforma.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
