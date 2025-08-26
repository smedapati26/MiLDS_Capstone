rsconnect write-manifest api -o \
-x "**/__pycache__/*" \
-x "scripts/**" \
-x "**/tests/*" \
-x "**/migrations/*" \
-e griffin_ai.wsgi:application \
.