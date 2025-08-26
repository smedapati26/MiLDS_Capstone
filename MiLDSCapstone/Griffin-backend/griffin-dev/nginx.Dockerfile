FROM registry.levelup.cce.af.mil/cdso/containers/base-registry/alpine:3.16

RUN apk add --no-cache nginx && rm -f /var/cache/apk/* \
    && ln -sf /dev/stdout /var/log/nginx/access.log  \
    && ln -sf /dev/stderr /var/log/nginx/error.log \
    && mkdir -p /usr/share/nginx/html/griffin-ai/static

COPY nginx/default.conf /etc/nginx/http.d/
COPY griffin_ai/static /usr/share/nginx/html/static/


EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
