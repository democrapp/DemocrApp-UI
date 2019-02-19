FROM node:alpine
RUN npm install yarn
ADD package.json /srv/ui/package.json
WORKDIR /srv/ui
RUN yarn install --allow-root --unsafe-perm=true
ADD . /srv/ui
RUN yarn build
