FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 🔴 THIS LINE FIXES YOUR ISSUE
RUN CI=false npm run build

RUN npm install -g serve
EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
