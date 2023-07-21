import { Config, PluginConfig, getPluginConfig, id } from "../config";
import { useEffect, useState } from "react";

export function usePluginConfig(config: Record<string, object>, setConfig: React.Dispatch<React.SetStateAction<Record<string, object>>>) {
    const [pluginConfig, _setPluginConfig] = useState<PluginConfig>(getPluginConfig(config));

    useEffect(
        () =>
            setConfig((prev) => {
                return { ...prev, [id]: pluginConfig };
            }),
        [pluginConfig],
    );

    const setPluginConfig = function <T extends keyof PluginConfig>(key: T, value: PluginConfig[T]) {
        _setPluginConfig((prev) => {
            return {
                ...prev,
                [key]: value,
            };
        });
    };

    return [pluginConfig, setPluginConfig] as const;
}
