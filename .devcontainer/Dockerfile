FROM mcr.microsoft.com/devcontainers/typescript-node

RUN npm install -g pnpm

RUN apt-get update && apt-get install -y \
    git \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*
