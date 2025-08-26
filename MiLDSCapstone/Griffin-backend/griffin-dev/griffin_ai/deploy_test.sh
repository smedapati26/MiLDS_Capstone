#!/bin/bash

# Check if a name is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: ./deploy_test.sh <name>"
    echo "Will deploy a test application to the app tagged griffin-ai-<name>-dev for your testing convenience."
    exit 1
fi

name=$1

rsconnect deploy api -t griffin-ai-$name-dev \
-x "**/__pycache__/*" \
-x "scripts/**" \
-x "**/tests/*" \
-x "**/migrations/*" \
-x ".coverage" \
-e griffin_ai.wsgi:application \
.