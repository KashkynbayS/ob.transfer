FROM nginx:stable-alpine

LABEL name=ob.transfer.ui
LABEL version=cicd_app_version

RUN apk add --no-cache tzdata  && \
    cp /usr/share/zoneinfo/Asia/Almaty  /etc/localtime && \
    apk del tzdata && \
    sed -i '/index.htm;/a \ \ \ \ \ \ \ \ try_files $uri /index.html;' /etc/nginx/conf.d/default.conf

COPY ./dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
