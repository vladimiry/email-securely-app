import {Configuration} from "webpack";

import {buildBaseConfig, typescriptLoaderRule} from "webpack-configs/lib";

export function buildRendererConfig(entry: Configuration["entry"], tsConfigFile: string): Configuration {
    return buildBaseConfig(
        {
            target: "web",
            entry,
            module: {
                rules: [
                    typescriptLoaderRule({tsConfigFile}),
                ],
            },
            externals: {
                electron: "require('electron')",
            },
            resolve: {
                fallback: {
                    "path": false,
                    "fs": false,
                },
            },
        },
        {
            tsConfigFile,
        },
    );
}
