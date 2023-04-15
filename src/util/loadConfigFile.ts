import fs from "fs-extra";
import { normalizePath, transformWithEsbuild } from "vite";
import * as Contants from "../constants";
import { pathToFileURL } from "url";
import { loadConfigFromFile } from "vite";
import { resolve } from "path";

import { ConfigProps } from "../type";

type RawConfig =
  | ConfigProps
  | Promise<ConfigProps>
  | (() => ConfigProps | Promise<ConfigProps>);

/** 加载配置文件 */

export default async (routerPath: string) => {
  /**是否是ts文件 */
  const isTs = routerPath.endsWith("ts");
  console.log("isTs", isTs);
  if (isTs) {
    const str = fs.readFileSync(normalizePath(routerPath), "utf-8");
    /**把文件代码转为iife格式 */
    const _iife_code = await transformWithEsbuild(str, "test", {
      loader: "ts",
      format: "iife",
      globalName: Contants.GLOBAL_NAME,
    });
    console.log(_iife_code.code);
    /**执行转化后代码，获取 路由配置中的数据 */
    const result = new Function(
      `${_iife_code.code} return ${Contants.GLOBAL_NAME}`
    )();
    console.log("1111111111111111");
    console.log(result.default);

    if (result.default) {
      return result.default;
    }
  } else {
    const { href } = pathToFileURL(routerPath);
    const result = await import(href);
    if (result.default) {
      // console.log('result',result)
      return result.default;
    }
  }

  return null;
};

function getUserConfigPath(root: string) {
  console.log("root", root);
  try {
    const supportConfigFiles = ["router.config.ts", "router.config.js"];
    const configPath = supportConfigFiles
      .map((file) => resolve(root, file))
      .find(fs.pathExistsSync);
    return configPath;
  } catch (e) {
    console.error(`Failed to load user config: ${e}`);
    throw e;
  }
}

export async function resolveUserConfig(
  root: string,
  command: "serve" | "build",
  mode: "development" | "production"
) {
  const configPath = getUserConfigPath(root);
  // 2. 读取配置文件的内容
  const result = await loadConfigFromFile(
    {
      command,
      mode,
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
    const userConfig = await (typeof rawConfig === "function"
      ? rawConfig()
      : rawConfig);

    return userConfig as ConfigProps;
  } else {
    return {} as ConfigProps;
  }
}

export async function resolveConfig(
  root: string,
  command: "serve" | "build",
  mode: "development" | "production"
): Promise<any> {
  const userConfig = await resolveUserConfig(root, command, mode);
  // const siteConfig: SiteConfig = {
  //   root,
  //   configPath: configPath,
  //   // siteData: resolveSiteData(userConfig as UserConfig)
  // };
  return userConfig;
}
