#!/bin/sh
mkdir -p /usr/src/app/uploads/profiles
chmod 777 /usr/src/app/uploads/profiles
exec "$@" 