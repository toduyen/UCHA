FROM --platform=linux/amd64 node:18

COPY package*.json ./

RUN npm install -g yarn --force

# RUN yarn

COPY . .

ENV TZ Asia/Ho_Chi_Minh

CMD [ "yarn", "build:prod" ]