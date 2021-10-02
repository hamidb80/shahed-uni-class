FROM node:16-alpine3.11

# install timezones database
RUN apk add tzdata 
# set timezone to Iran
RUN cp /usr/share/zoneinfo/Iran /etc/localtime

# prepare app
WORKDIR /app
COPY package.json /app/
RUN npm install
COPY . /app/

CMD ["npm", "start"]