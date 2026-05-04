FROM nginx:alpine
RUN apk add --no-cache openssl
COPY nginx.conf /etc/nginx/nginx.conf
COPY generate-cert.sh /generate-cert.sh
RUN chmod +x /generate-cert.sh && /generate-cert.sh
EXPOSE 80 443
