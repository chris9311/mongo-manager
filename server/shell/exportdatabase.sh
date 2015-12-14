#!/bin/sh
rm -rf /tmp/mongo_dump
mkdir /tmp/mongo_dump
mongodump -h $1 --port $2 -d $3 -o /tmp/mongo_dump/ --authenticationDatabase admin
zip -jr /tmp/mongo_dump/$3.zip /tmp/mongo_dump/