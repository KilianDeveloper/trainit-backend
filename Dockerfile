FROM node:18-alpine
WORKDIR /srv/app
EXPOSE 8080
COPY package*.json ./
RUN npm install
RUN mkdir src
COPY src/ ./src/
COPY migration/* ./migration/
COPY tsconfig.prod.json ./tsconfig.json
COPY .eslintrc.js ./
COPY .env ./
RUN mkdir data
RUN mkdir certificates
COPY fonts/arial.ttf ./
RUN mkdir -p /usr/share/fonts/truetype/
RUN install -m644 arial.ttf /usr/share/fonts/truetype/
RUN rm ./arial.ttf
COPY fonts/abuget.ttf ./
RUN mkdir -p /usr/share/fonts/truetype/
RUN install -m644 abuget.ttf /usr/share/fonts/truetype/
RUN rm ./abuget.ttf
RUN npm run build
CMD ["npm", "run", "start"]