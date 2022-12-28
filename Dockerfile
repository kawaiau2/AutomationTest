FROM node
RUN mkdir /apiTest
WORKDIR /apiTest
COPY package.json .
RUN npm install
COPY . .
RUN mkdir response
RUN mkdir result
CMD ${runtest}