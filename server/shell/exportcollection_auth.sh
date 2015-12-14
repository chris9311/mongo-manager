#!/bin/sh
rm -rf /tmp/mongo_dump
mkdir /tmp/mongo_dump
mongodump -h $1 --port $2 -u $3 -p $4 -d $5 -c $6 -o /tmp/mongo_dump/ --authenticationDatabase admin
zip -jr /tmp/mongo_dump/$5_$6.zip /tmp/mongo_dump/