FROM node:18

WORKDIR /app

# Fix OpenSSL issue for webpack
ENV NODE_OPTIONS=--openssl-legacy-provider

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npx", "serve", "-s", "build"]

