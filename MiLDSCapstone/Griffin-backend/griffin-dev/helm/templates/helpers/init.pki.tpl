{{/* vim: set filetype=mustache: */}}
{{/* Create an init container to setup pki for an application */}}

{{- define "init.pki" }}
{{- $ := get . "$" }}
{{- $app := get . "app" }}
{{- $volume := get . "volume" | default "pki-volume" }}
- name: init-pki-{{ regexReplaceAll "_" $app "-" }}-{{ $volume }}
  image: {{ $.Values.ltac.baseImage.repository }}:{{ $.Values.ltac.baseImage.tag }}
  imagePullPolicy: {{ $.Values.ltac.baseImage.pullPolicy }}
  securityContext:
    runAsUser: 0
    runAsGroup: 0
    runAsNonRoot: false
    allowPrivilegeEscalation: false
    readOnlyRootFilesystem: false
  env:
    - name: NAMESPACE
      value: "{{ $.Release.Namespace }}"
    {{- range $name, $values := $.Values.system_certs }}
    - name: {{ upper $name }}_TLS_CRT
      valueFrom:
        secretKeyRef:
          name: {{ regexReplaceAll "_" $name "-" }}-tls-secret
          key: tls.crt
    - name: {{ upper $name }}_TLS_KEY
      valueFrom:
        secretKeyRef:
          name: {{ regexReplaceAll "_" $name "-" }}-tls-secret
          key: tls.key
    {{- end }}
{{/*    {{- range $name, $values := $.Values.default_users }}*/}}
{{/*    {{- if (and (index $values "crt") (index $values "key")) }}*/}}
{{/*    - name: {{ upper $name }}_TLS_CRT*/}}
{{/*      valueFrom:*/}}
{{/*        secretKeyRef:*/}}
{{/*          name: {{ regexReplaceAll "_" $name "-" }}-tls-secret*/}}
{{/*          key: tls.crt*/}}
{{/*    - name: {{ upper $name }}_TLS_KEY*/}}
{{/*      valueFrom:*/}}
{{/*        secretKeyRef:*/}}
{{/*          name: {{ regexReplaceAll "_" $name "-" }}-tls-secret*/}}
{{/*          key: tls.key*/}}
{{/*    {{- end }}*/}}
{{/*    {{- end }}*/}}
    - name: K8S_CA_CRT
      valueFrom:
        secretKeyRef:
          name: k8s-cert
          key: k8s.crt
          optional: true
  volumeMounts:
    - name: {{ $volume }}
      mountPath: /pki
  command:
    - /bin/bash
    - -lc
    - init_pki {{ $app }}
  resources:
    requests:
      cpu: "30m"
      memory: "64Mi"
{{- end }}
