#!/usr/bin/env bash
set -e
# load env
set -a
source ~/.config/elimuconnect/.env.production
set +a
# run (adjust path to your jar if needed)
java -jar ./app.jar
