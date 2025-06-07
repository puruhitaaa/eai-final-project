FROM node:18-alpine

# Install curl for healthchecks
RUN apk --no-cache add curl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${PORT:-4006}

CMD ["node", "index.js"] 