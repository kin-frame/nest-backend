# -------- 빌드 스테이지 --------
FROM node:22-alpine AS builder

WORKDIR /app

# 패키지 설치
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 소스 복사 후 빌드
COPY . .
RUN npm run build

# -------- 런타임 스테이지 --------
FROM node:22-alpine

WORKDIR /app

# 운영에 필요한 파일만 설치
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

# 빌드 결과만 복사
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
