#!/bin/sh
rm -rf /tmp/mongo_dump
mkdir /tmp/mongo_dump
mongodump -u $2 -p $3 -h 127.0.0.1 --port 27017 -d $1 -o /tmp/mongo_dump/ --authenticationDatabase admin
zip -jr /tmp/mongo_dump/$1.zip /tmp/mongo_dump/