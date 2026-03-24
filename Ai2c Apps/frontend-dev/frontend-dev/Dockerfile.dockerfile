# Stage 1: Builder image for React
FROM registry.cdso.army.mil/cdso/containers/approved-base/node_alpine:23 AS build

# Get the build env from the command line, default to dev
ARG BUILD_ENV=dev

WORKDIR /app
COPY . .

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

# Update all installed packages
# Install required packages
# Set up the AI2C Registry for PMx-MUI
# Remove node modules if there
# Install packages
# Check the build env and build for proper env
RUN apk update && \
    apk upgrade && \
    apk add --no-cache python3 build-base linux-headers pixman-dev cairo-dev pango-dev && \
    echo @ai2c:registry=https://code.cdso.army.mil/api/v4/projects/3083/packages/npm/ >> .npmrc && \
    rm -Rf node_modules && \
    npm config set strict-ssl false && \
    npm install --no-audit --legacy-peer-deps --save-dev && \
    if [ "${BUILD_ENV}" = "test" ] || [ "${BUILD_ENV}" = "prod" ]; then \
        npm run build:${BUILD_ENV}; \
    else \
        npm run build:dev; \
    fi

# Stage 2: Serve with Nginx
FROM registry.cdso.army.mil/cdso/containers/approved-base/alpine:3.22

# Set the working directory.
WORKDIR /var/lib/nginx/

# Install Nginx.
RUN apk add --no-cache nginx

# Copy Nginx configuration files.
COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types /etc/nginx/mine.types

# Copy the bundle built in the previous stage.  
COPY --from=build /app/dist html/

# Expose the port.
EXPOSE 5173

# Switch to the non-root user.
USER nginx

# Start the container.
CMD ["nginx", "-g", "daemon off;"]
