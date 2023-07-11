
## 多账号设置:
如果是单账号单配置则可不填`acc`

多账号则每个配置都必须填`acc`字段

且已开启的wss/http 端口均不可冲突，否则将导致通信失效


```
[
    {
        "acc":123456,
        "ws": true,
        "rwsUrl": "ws://127.0.0.1:4545",
        "http": true,
        "httpApiPort": 4544,
        "httpUrl": "http://127.0.0.1:4544",
        "wss": true,
        "wsServerPort": 4543,
        "sendHttpMsg": true,
        "sendHttpTar": "http://114.514.19.19:810/recv",
        "sendHistoryMsg": true
    }, {
        "acc":123457,
        "ws": true,
        "rwsUrl": "ws://127.0.0.1:4645",
        "http": true,
        "httpApiPort": 4644,
        "httpUrl": "http://127.0.0.1:4644",
        "wss": true,
        "wsServerPort": 4643,
        "sendHttpMsg": true,
        "sendHttpTar": "http://114.514.19.19:810/recv",
        "sendHistoryMsg": true
    }
]
```