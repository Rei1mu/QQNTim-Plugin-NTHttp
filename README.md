# QQNTim-Plugin-NTHttp
基于QQNTim的插件，WebSocket+HttpApi的简易通信实现

[![License](https://img.shields.io/github/license/Rei1mu/QQNTim-Plugin-NTHttp)](https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/LICENSE)
[![交流群](https://img.shields.io/badge/%E4%BA%A4%E6%B5%81%E7%BE%A4-869292547-green.svg)](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=IKkd3kd-5DDj-zHzbx560sd0I1YJzxVA&authKey=Y%2BgAgle5%2BAFQoH3wSYXYXM7birylnjTJC8Q44c0d54IBjYa2iOpbq%2B7vXO7v53pg&noverify=0)


## 安装
请先安装QQNTim,教程见：
https://github.com/FlysoftBeta/QQNTim#安装插件

通过Releases下载,执行脚本安装QQNTim


### Windows下教程：
(Linux请参照原文档)

下载本插件解压至 `用户文件夹\.qqntim\plugins\NTHttp`  
plugins中可创建子目录 `NThttp` (不限制命名)

然后在该目录下执行:
```bash
> npm install
```

P.S: Windows用户文件夹一般位于 `C:\Users\你的用户名\.qqntim`

重载插件：按F5刷新即可




## 使用

文档完善中...

本插件只是实现了一些对群/私聊消息`messages`的处理

通过简码形式, 简化 `原生Message` 结构变为单行的 `msg` 进行消息推送

同时发送消息的API Json数据也支持 `msg` 和 `原生消息结构` 共用, 具体请查看用例和文档

### 注意事项：
请根据`setting.json` 配置连接

若多账号同时登录请在 `.\setting.json` 中指定 `acc` 账号字段，并增加对应 `acc` 的Web配置

且多个账号登录不能和已有配置中的wss,http端口号冲突，否则第二个账号收发能力失效


### Web能力

- WebApi
- HttpPostMessage
- WebSocket
- WebSocketServer



### 支持：
<details>
<summary>WebApi</summary>

#### WebApi

| 功能                      | API                    | 指令(Ws_Json.op)  |
| ------------------------  | ---------------------- | ----------------------|
| [取自身信息]                 | /bot     | bot |
| [发送消息]                 | /smsg                  | smsg |
| [上传图片]                 | /uploadPic             | uploadPic |
| [获取图片]                 | /gpic                  | gpic |
| [获取音频]                 | /gau                  | gau |
| [撤回消息]                 | /revokeMessageById     | revokeMessageById |
| [取好友列表]                 | /friendList     | friendList |
| [取群列表]                 | /groupList     | groupList |

[取自身信息]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md
[发送消息]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md
[上传图片]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md
[获取图片]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md
[获取音频]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md
[撤回消息]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md
[取好友列表]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md
[取群列表]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md

</details>

<details>
<summary>NT简码</summary>

#### 为方便理解, 暂定为 NT码

| 功能                     | NT码                    | 解释 |
| ------------------------ | ---------------------- | ----------------------|
| [@某人]                     | [@uid]                            | 当前仅能根据uid @某人, 而非uin|
| [本地图片]                 |[pic=C:\1.png]                    | 本地任意路径图片 |
| [网络图片]                 |[pic=http://114.514.19.19/1.png]  | 支持图片url |
| [本地音频]                |[audio=C:\1.amr]     id              | 本地音频文件 |
| [表情]                 |[face,Id=index,faceType=type]  | 普通表情 |
| [大表情]                |[bigFace,id={},name={},hash={},flag={}]                   | stickers |
| [回复]                    | [reply,msgSeq=114514]             | 回复括号里面的每个参数都挺重要的,不方便拿开 |


[@某人]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md
[本地图片]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md
[网络图片]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md
[本地音频]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md
[表情]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md
[大表情]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md
[回复]: https://github.com/Rei1mu/QQNTim-Plugin-NTHttp/blob/main/help/Api.md

</details>




### 目前的不足之处：
1.接收的sender里没有uin, 只有uid(非number), 目前转换困难，群聊没法分辨是谁发的消息

2.视频/图片/语音 只能靠本地api转存

3.合并转发未支持

不过对我的bot来说, 能收发消息就足够了

其他的欢迎补充和完善不足。