import { getPluginConfig } from "./config";
import * as qqntim from "qqntim/main";

export default class Entry implements QQNTim.Entry.Main {
    constructor() {
        const config = getPluginConfig(qqntim.env.config.plugins.config);
        console.log("[Template] Hello world!", qqntim);
        console.log("[Template] 当前插件配置：", config);
    }
}
