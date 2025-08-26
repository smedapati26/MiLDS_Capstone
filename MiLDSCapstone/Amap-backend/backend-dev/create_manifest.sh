rsconnect write-manifest api -o \
-x "**/__pycache__/*" \
-x "scripts/**" \
-x "**/tests/*" \
-x "**/migrations/*" \
-x ".coverage" \
-e amap.wsgi:application \
.