FROM quay.io/lyfe00011/md:beta
RUN (apt-get update && apt-get install -y procps) || (apk add --no-cache procps)
RUN git clone https://github.com/lyfe00011/levanter.git /root/LyFE/
WORKDIR /root/LyFE/
RUN yarn install
CMD ["npm", "start"]