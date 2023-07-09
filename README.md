# QQNTim-Plugin-NTHttp
基于QQNTim的插件，WebSocket+HttpApi的通信实现

[![License](https://img.shields.io/github/license/Rei1mu/QQNTim-Plugin-NTHttp.svg)](https://raw.githubusercontent.com/Rei1mu/QQNTim-Plugin-NTHttp/master/LICENSE)


## 安装
请先安装QQNTim,教程见：
https://github.com/FlysoftBeta/QQNTim#安装插件

在Releases下载,执行脚本安装QQNTim
### Windows简易教程(Linux可参照原教程文档)：
下载本插件解压至 `用户文件夹\.qqntim\plugins\NTHttp`  
(plugins中可创建子目录 `NThttp` 不限定名称)

然后在该目录下执行:
```bash
> npm install
```

P.S: 用户文件夹位于 `C:\Users\你的用户名\.qqntim`

若多账号同时登录请在 `.\setting.json` 中指定 `acc` 账号字段，并增加对应 `acc` 的Web配置，且不能和已有配置中的端口号冲突，否则可能导致失效

重载本插件：按F5刷新即可




## 消息支持
插件只是实现了一些对群/私聊消息`messages`的处理

通过简码形式,简化 `Message` 结构为单行的 `msg`

同时请求发送消息的接口也支持 `msg` 和 `elements[]结构` 共用, 具体请查看用例和文档

我来说足够了，欢迎补充和完善


<details>
<summary>WebApi</summary>


| 功能                     | API                    | 指令(Ws_Json.op)  |
| ------------------------ | ----------------------| ----------------------|
| 发送消息                 | /smsg                  | smsg |
| 上传图片                 | /uploadPic             | uploadPic |
| 撤回消息         | /revokeMessageById     | revokeMessageById |


</details>


## Web支持

- WebApi
- HttpPostMessage
- WebSocketClient
- WebSocketServer


