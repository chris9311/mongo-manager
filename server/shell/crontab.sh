#!/bin/sh
cronfile=/tmp/crontab.${USER}
    crontab -l > $cronfile
    echo "$1 $2" >> $cronfile
    crontab $cronfile
    rm -rf $cronfilel
