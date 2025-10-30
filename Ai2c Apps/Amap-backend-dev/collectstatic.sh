#!/bin/bash

mkdir templates
# copy in the new static files
python manage.py collectstatic --settings=amap.settings.dev.dse --noinput

mv static/index.html templates