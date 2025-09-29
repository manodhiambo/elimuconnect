#!/usr/bin/env bash
set -e
set -a
source ~/.config/elimuconnect/.env.development
set +a
java -jar ./app.jar
