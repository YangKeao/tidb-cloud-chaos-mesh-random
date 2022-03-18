FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common \
    bash

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn

RUN curl -L "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" > /usr/local/bin/kubectl
RUN chmod +x /usr/local/bin/kubectl
RUN curl --proto '=https' --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh 

ENV PATH=$PATH:/usr/local/bin:/root/.tiup/bin

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN yarn

CMD ["node", "index.mjs"]