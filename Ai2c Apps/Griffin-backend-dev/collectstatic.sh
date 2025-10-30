#!/bin/bash

# remove the existing static files
rm -rf static/assets
rm -rf static/pwa

# copy in the new static files
python manage.py collectstatic --settings=griffin_ai.settings.dev.dse --noinput

# move the index.html file into the templates directory
mv static/index.html templates/auto_dsr/

# Update the references in the index.html file
sed -i 's/\/light-mode-favicon.svg/\/static\/light-mode-favicon.svg/g' templates/auto_dsr/index.html
sed -i 's/\/dark-mode-favicon.svg/\/static\/dark-mode-favicon.svg/g' templates/auto_dsr/index.html
sed -i 's/\/apple-touch-icon-180x180.png/\/static\/pwa\/apple-touch-icon-180x180.png/g' templates/auto_dsr/index.html
sed -i 's/\/manifest.webmanifest/\/static\/pwa\/manifest.webmanifest/g' templates/auto_dsr/index.html
sed -i 's/\/registerSW.js/\/static\/pwa\/registerSW.js/g' templates/auto_dsr/index.html
sed -i 's/\/assets/\/static\/assets/g' templates/auto_dsr/index.html

# Organize the PWA content
mkdir static/pwa
mv static/registerSW.js static/pwa
mv static/sw.js static/pwa
mv static/workbox-* static/pwa
mv static/*.png static/pwa
mv static/manifest.webmanifest static/pwa

# Update the references for the service worker
sed -i 's/\/sw.js/\/static\/pwa\/sw.js/g' static/pwa/registerSW.js
