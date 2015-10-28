#!/bin/sh
rm -rf /tmp/mongo_dump
mkdir /tmp/mongo_dump
mongodump -u $3 -p $4 -h 127.0.0.1 --port 27017 -d $1 -c $2 -o /tmp/mongo_dump/ --authenticationDatabase admin
zip -jr /tmp/mongo_dump/$1_$2.zip /tmp/mongo_dump/