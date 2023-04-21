FROM mongo:4.4

ENV MONGO_INITDB_ROOT_USERNAME root
ENV MONGO_INITDB_ROOT_PASSWORD root

RUN apt-get update && apt-get install -y \
  iputils-ping \
  && rm -rf /var/lib/apt/lists/*

EXPOSE 27017
