FROM registry.levelup.cce.af.mil/cdso/containers/base-registry/python-alpine:3.10-alpine as builder
ARG APP_USER=griffin
ARG APP_UID=1001
ARG APP_HOME=/home/${APP_USER}
ARG VIRTUAL_ENV=/opt/venv
ENV LANG=C.UTF-8
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
COPY ltac.requirements.txt /tmp/requirements.txt

SHELL ["/bin/ash", "-eo", "pipefail", "-c"]

RUN set -ex  && \
    apk add --no-cache --virtual .build-deps postgresql-dev build-base && \
    mkdir -p /opt && \
    python3 -m venv "${VIRTUAL_ENV}" && \
    "${VIRTUAL_ENV}/bin/pip" install --upgrade pip && \
    # Updating setuptools to the latest version resolves CVE-2022-40897
    "${VIRTUAL_ENV}/bin/pip" install --upgrade setuptools>=65.5.1 && \
    "${VIRTUAL_ENV}/bin/pip" install --no-cache-dir -r /tmp/requirements.txt && \
    runDeps="$(scanelf --needed --nobanner --recursive "${VIRTUAL_ENV}" \
            | awk '{ gsub(/,/, "\nso:", $2); print "so:" $2 }' \
            | sort -u \
            | xargs -r apk info --installed \
            | sort -u)" && \
    apk add --no-cache --virtual rundeps $runDeps && \
    apk del .build-deps && \
    rm -f /var/cache/apk/* && \
    rm -f /tmp/requirements.txt && \
    mkdir -p /app

COPY griffin_ai /app
WORKDIR /app

ENV PATH="$VIRTUAL_ENV/bin:$PATH"

EXPOSE 8000

CMD ["gunicorn", "--env", "DJANGO_SETTINGS_MODULE=griffin_ai.settings.prod.ltac", "--bind", ":8000", "--workers", "3", "griffin_ai.wsgi"]
