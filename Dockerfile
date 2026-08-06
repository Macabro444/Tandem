FROM node:22-bookworm-slim AS frontend-build
WORKDIR /build/frontend
COPY tandemfrontend/package.json tandemfrontend/package-lock.json ./
RUN npm ci
COPY tandemfrontend/ ./
RUN npm run build

FROM node:22-bookworm-slim AS backend-build
WORKDIR /build/backend
COPY tandembackend/package.json tandembackend/package-lock.json ./
RUN npm ci
COPY tandembackend/ ./
RUN npm run build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/python
COPY Tamdem/tandem_backend/requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt
COPY Tamdem/tandem_backend/ ./

WORKDIR /app/backend
COPY tandembackend/package.json tandembackend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=backend-build /build/backend/dist ./dist

COPY --from=frontend-build /build/frontend/dist /app/frontend/dist
COPY railway-server.mjs /app/railway-server.mjs

WORKDIR /app
EXPOSE 8080
CMD ["node", "railway-server.mjs"]
