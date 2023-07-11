# ws通信

## Ws推送的EventMsg
`/setting.json` 里将`ws`设置为`true`
如果想将`NTHTTP`设置为服务端则 将`wss`设置为`true`

### ws
在 `rwsUrl` 填入你程序所开的ws地址,即可接收

### wss
在 `wsServerPort` 填入`端口号`
但注意,如果多账号登录请勿填相同端口号,且不能和其他程序端口冲突


### 成功连接
ws连接成功后会发送对应账号的 `bind:qqntim` 消息
如：
```bind:qqntim||${qjj.httpUrl}||${botID.uin}||${botID.uid}```

