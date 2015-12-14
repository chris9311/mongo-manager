#!/bin/sh
rm -rf /tmp/mongo_dump
mkdir /tmp/mongo_dump
mongodump -h $1 --port $2 -d $3 -c $4 -o /tmp/mongo_dump/
zip -jr /tmp/mongo_dump/$3_$4.zip /tmp/mongo_dump/