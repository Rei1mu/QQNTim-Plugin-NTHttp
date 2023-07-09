# QQNTim-Plugin-NTHttp
基于QQNTim的插件，WebSocket+HttpApi的通信实现

[![License](https://img.shields.io/github/license/Rei1mu/QQNTim-Plugin-NTHttp.svg)](https://raw.githubusercontent.com/Rei1mu/QQNTim-Plugin-NTHttp/master/LICENSE)


## 安装
请先安装QQNTim,教程见：
https://github.com/FlysoftBeta/QQNTim#安装插件

下载Releases,执行脚本安装QQNTim
### 下面是Windows简易教程， Linux可参照原教程文档
下载本插件解压至 `用户文件夹\.qqntim\plugins\NTHttp`  
(plugins中可创建子目录 `NThttp` 也不限定名称)

并在本插件目录下执行:
```bash
> npm i
```

P.S: 用户文件夹位于 `C:\Users\你的用户名\.qqntim`

若多账号同时登录请在 `.\setting.json` 中指定 `acc` 账号字段，并增加对应 `acc` 的Web配置

重载本插件：按F5刷新即可




## 消息支持
功能仅为解析\收发消息
推送消息: 将Messages融汇成一句,附带简码的msg进行处理


## Web支持

- HttpApi
- HttpPostMessage
- WebSocketClient
- WebSocketServer


