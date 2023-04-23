import fs from 'fs-extra';
import type { ConfigEnv } from 'vite';
import { loadConfigFromFile } from 'vite';
import { resolve } from 'path';

import { ConfigProps } from '../type';

type RawConfig =
  | ConfigProps
  | Promise<ConfigProps>
  | (() => ConfigProps | Promise<ConfigProps>);

export function getUserConfigPath(root: string = process.cwd()) {
  try {
    const supportConfigFiles = ['router.config.ts', 'router.config.js'];
    const configPath = supportConfigFiles
      .map((file) => resolve(root, file))
      .find(fs.pathExistsSync);
    return configPath;
  } catch (e) {
    console.error(`Failed to load user config: ${e}`);
    throw e;
  }
}

export default async function (
  root: string,
  command: ConfigEnv['command'],
  mode: ConfigEnv['mode'],
  configPath: string
) {
  // 2. 读取配置文件的内容
  const result = await loadConfigFromFile(
    {
      command,
      mode
    },
    configPath,
    root
  );

  if (result) {
    const { config: rawConfig = {} as RawConfig } = result;
    // 三种情况:
    // 1. object
    // 2. promise
    // 3. function
    const userConfig = await (typeof rawConfig === 'function'
      ? rawConfig()
      : rawConfig);

    return userConfig as ConfigProps;
  } else {
    return {} as ConfigProps;
  }
}

// export default async function resolveConfig(
//   root: string,
//   command: "serve" | "build",
//   mode: "development" | "production"
// ): Promise<any> {
//   const userConfig = await resolveUserConfig(root, command, mode);
//   return userConfig;
// }
