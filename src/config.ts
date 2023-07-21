export const id = "NTHttp" as const;

export const defaults: PluginConfig = {
    switchConfigItem: false,
    anotherSwitchConfigItem: false,
    inputConfigItem: "4544",
    dropdownConfigItem: "A",
    httpApiPort: "4544",
    http: true,
    httpUrl: "http://127.0.0.1:4544",
    wss: false,
    wsServerPort: "4543",
    wsServerUrl: "ws://127.0.0.1:4543",
    ws: false,
    wsTarUrl: "ws://127.0.0.1:4545",
    sendHttpMsg: false,
    sendHttpTar: "http://114.514.19.19:810/recv",
    sendWssMsg: true,
    acc: "123456",
    sendHistoryMsg: true
};
export function getPluginConfig(config: Config | undefined) {
    return Object.assign({}, defaults, config?.[id] || {});
}

export interface PluginConfig {
    switchConfigItem: boolean;
    anotherSwitchConfigItem: boolean;
    inputConfigItem: string;
    dropdownConfigItem: "A" | "B" | "C";
    httpApiPort: string;
    wsServerPort: string;
    http: boolean;
    httpUrl: string;
    wss: boolean;
    wsServerUrl: string;
    ws: boolean;
    wsTarUrl: string;
    sendHttpMsg: boolean;
    sendHttpTar: string;
    sendWssMsg: boolean;
    sendHistoryMsg: boolean;
    acc: string;
}
export type Config = {
    [X in typeof id]?: Partial<PluginConfig>;
};
