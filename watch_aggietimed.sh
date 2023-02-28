#!/bin/sh

socket=/tmp/aggietimed.sock
env_file=/home/lizzy/work/simple_scripts/aggietime_cli/.env

export $(cat $env_file | xargs)

while true
do
    aggietimed -d -s $socket
    if [ $? -eq 0 ]
    then
        break
    else
        sleep 1
    fi
done
