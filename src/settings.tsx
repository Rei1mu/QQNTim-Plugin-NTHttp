import { getPluginConfig } from "./config";
import { usePluginConfig } from "./utils/hooks";
import { defineSettingsPanels } from "qqntim-settings";
import { Dropdown, Input, SettingsBox, SettingsBoxItem, SettingsSection, Switch } from "qqntim-settings/components";
import { env } from "qqntim/renderer";
import { useMemo } from "react";


export default class Entry implements QQNTim.Entry.Renderer {
    constructor() {
        // 如果不需要设置界面，将下一行注释掉即可；如果需要在设置项目旁边加一个小图标，请将 `undefined` 改为一段 HTML 代码（可以是 `<svg>`, `<img>` 等等）。
        defineSettingsPanels(["NTHttp 设置", SettingsPanel, `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.25 9C15.4926 9 16.5 7.99264 16.5 6.75C16.5 5.50736 15.4926 4.5 14.25 4.5C13.0074 4.5 12 5.50736 12 6.75C12 7.99264 13.0074 9 14.25 9ZM14.25 3C16.1515 3 17.7225 4.41532 17.967 6.25H21V7.75H17.8652C17.4276 9.33559 15.9748 10.5 14.25 10.5C12.5252 10.5 11.0724 9.33559 10.6348 7.75H3V6.25H10.533C10.7775 4.41532 12.3485 3 14.25 3ZM21 16.25V17.75H13.467C13.2225 19.5847 11.6515 21 9.75 21C7.84846 21 6.27749 19.5847 6.03304 17.75H3V16.25H6.13481C6.57243 14.6644 8.02523 13.5 9.75 13.5C11.4748 13.5 12.9276 14.6644 13.3652 16.25H21ZM7.5 17.25C7.5 18.4926 8.50736 19.5 9.75 19.5C10.9926 19.5 12 18.4926 12 17.25C12 16.0074 10.9926 15 9.75 15C8.50736 15 7.5 16.0074 7.5 17.25Z" fill="currentColor"></path></svg>`,
        ]);
    }
}

function SettingsPanel({ config: _config, setConfig: _setConfig }: QQNTim.Settings.PanelProps) {
    const [pluginConfig, setPluginConfig] = usePluginConfig(_config, _setConfig);
    const currentPluginConfigString = useMemo(() => JSON.stringify(getPluginConfig(env.config.plugins.config)), []);
    const acc = ""
    return (
        <>
            <SettingsSection title="插件设置">
                <SettingsBox>
                    <SettingsBoxItem title="账号设置" description={["账号设置(无需设置,点击右下角保存并重启自动显示)"]} isLast={true}>
                        <Input value={pluginConfig.acc} onChange={(state) => setPluginConfig("acc", state)} />
                    </SettingsBoxItem>
                </SettingsBox>
            </SettingsSection>
            <SettingsSection title="HTTP">
                <SettingsBox>
                    <SettingsBoxItem title="HttpApi端口设置" description={["HttpApi接口服务对应端口, 多账号登录端口均不可冲突"]} isLast={true}>
                        <Input value={pluginConfig.httpApiPort} onChange={(state) => {
                            setPluginConfig("httpApiPort", state)
                            let p = pluginConfig.httpUrl

                            const L = p.indexOf(":")
                            const L1 = p.indexOf(":", L + 1)
                            if (L1 !== -1 && p.startsWith('http')) {
                                p = p.substring(0, L1)
                                setPluginConfig("httpUrl", `${p}:${state}`)
                            } else {
                                setPluginConfig("httpUrl", `http://127.0.0.1:${state}`)
                            }
                        }
                        } />
                    </SettingsBoxItem>
                    <SettingsBoxItem title="HttpApiUrl" description={["由插件开放的接口地址,若非此设备连接,则改为局域/公网ip"]} isLast={true}>
                        <Input value={pluginConfig.httpUrl} onChange={(state) =>
                            setPluginConfig("httpUrl", `${state}`)
                        } />
                    </SettingsBoxItem>
                    <SettingsBoxItem title="HTTP开关" description={[`HTTP开关，当前状态为：${pluginConfig.http ? "开" : "关"}`]}>
                        <Switch checked={pluginConfig.http} onToggle={(state) => setPluginConfig("http", state)} />
                    </SettingsBoxItem>
                    {pluginConfig.switchConfigItem && (
                        <SettingsBoxItem title="另一个开关" description={["这是另一个开关。", `当前状态为：${pluginConfig.anotherSwitchConfigItem ? "开" : "关"}`]}>
                            <Switch checked={pluginConfig.anotherSwitchConfigItem} onToggle={(state) => setPluginConfig("anotherSwitchConfigItem", state)} />
                        </SettingsBoxItem>
                    )}
                </SettingsBox>
            </SettingsSection>
            <SettingsSection title="HttpPost">
                <SettingsBox>
                    <SettingsBoxItem title="HttpPostUrl" description={["填入对接SDK的POST接收地址"]} isLast={true}>
                        <Input value={pluginConfig.sendHttpTar} onChange={(state) =>
                            setPluginConfig("sendHttpTar", `${state}`)
                        } />
                    </SettingsBoxItem>
                    <SettingsBoxItem title="Post推送开关" description={[`当前状态为：${pluginConfig.sendHttpMsg ? "开" : "关"}，仅为向目标地址推送EventMsg`]}>
                        <Switch checked={pluginConfig.sendHttpMsg} onToggle={(state) => setPluginConfig("sendHttpMsg", state)} />
                    </SettingsBoxItem>
                </SettingsBox>
            </SettingsSection>
            <SettingsSection title="WebSocketServer">
                <SettingsBox>
                    <SettingsBoxItem title="wss端口设置" description={["ws服务端端口号, 多账号登录端口均不可冲突"]} isLast={true}>
                        <Input value={pluginConfig.wsServerPort} onChange={(state) => {
                            setPluginConfig("wsServerPort", `${state}`)
                            let p = pluginConfig.wsServerPort
                            const L = p.indexOf(":")
                            const L1 = p.indexOf(":", L + 1)
                            if (L1 !== -1) {
                                p = p.substring(0, L1)
                                setPluginConfig("wsServerUrl", `${p}:${state}`)
                            } else {
                                setPluginConfig("wsServerUrl", `ws://127.0.0.1:${state}`)
                            }
                        }
                        } />
                    </SettingsBoxItem>
                    <SettingsBoxItem title="wsServerUrl" description={["由插件开放的接口地址,若非此设备连接,则改为局域/公网ip"]} isLast={true}>
                        <Input value={pluginConfig.wsServerUrl} onChange={(state) =>
                            setPluginConfig("wsServerUrl", `${state}`)
                        } />
                    </SettingsBoxItem>
                    <SettingsBoxItem title="wss开关" description={[`wss开关，当前状态为：${pluginConfig.wss ? "开" : "关"}，支持wsApi和推送EventMsg`]}>
                        <Switch checked={pluginConfig.wss} onToggle={(state) => setPluginConfig("wss", state)} />
                    </SettingsBoxItem>

                </SettingsBox>
            </SettingsSection>
            <SettingsSection title="WebSocket">
                <SettingsBox>
                    <SettingsBoxItem title="ws连接地址设置" description={["填入对接SDK的wsServer接收地址"]} isLast={true}>
                        <Input value={pluginConfig.wsTarUrl} onChange={(state) =>
                            setPluginConfig("wsTarUrl", `${state}`)
                        } />
                    </SettingsBoxItem>
                    <SettingsBoxItem title="ws开关" description={[`ws开关，当前状态为：${pluginConfig.ws ? "开" : "关"}，支持wsApi和推送EventMsg`]}>
                        <Switch checked={pluginConfig.ws} onToggle={(state) => setPluginConfig("ws", state)} />
                    </SettingsBoxItem>
                </SettingsBox>
            </SettingsSection>
        </>
    );
}
