#wechatlook

A server that crawls wechat looks

## Docker commands

docker exec -it wemongo bash

## 本机调试模式：

打包：

docker build -t wechatlook .

跑 mongo：

docker run -d -v /data/db --name wemongo mongo

跑 app：

docker run -d  --name wl -p 80:3000 --link=wemongo:mongodb -it wechatlook

## 发布到线上：

sudo docker login --username=xiekw2016 registry.cn-hangzhou.aliyuncs.com

sudo docker tag [tagId] registry.cn-hangzhou.aliyuncs.com/xiekw2016/kaiwei:latest

sudo docker push registry.cn-hangzhou.aliyuncs.com/xiekw2016/kaiwei:latest

## 线上操作：

sudo docker login --username=xiekw2016 registry.cn-hangzhou-internal.aliyuncs.com

sudo docker pull registry.cn-hangzhou.aliyuncs.com/xiekw2016/kaiwei:latest

跑 mongo：

docker run -d -v /data/db --name wemongo mongo

跑 应用：

docker run -d  --name wl -p 80:3000 --link=wemongo:mongodb -it registry.cn-hangzhou.aliyuncs.com/xiekw2016/kaiwei

看日志：

