import { Plugin, normalizePath } from "vite";

import { ConfigProps } from "./type";
import PageContext, {
  resolvedFibVirtualModuleId,
  virtualFibModuleId,
  moduleGraphName,
} from "./context";

export const defineConfig = (config: ConfigProps) => {
  return config;
};

export default function virtualFibModulePlugin(): Plugin {
  const context = new PageContext();

  // 路由配置文件路径
  let routerPath = process.cwd() + "/" + "router.config.ts";

  return {
    name: "vite-plugin-react-pages-generator",

    config(config, configEnv) {
      console.log(config);
      context.initConfig(configEnv);
    },

    resolveId(id) {
      if (id === virtualFibModuleId) {
        return resolvedFibVirtualModuleId;
      }
      return id;
    },

    async handleHotUpdate(ctx) {
      if (normalizePath(routerPath) === ctx.file) {
        /**重新刷新浏览器 */
        ctx.server.ws.send({
          type: "full-reload",
        });

        /**清楚缓存 */
        ctx.server.moduleGraph.onFileChange(moduleGraphName);
      }
    },

    async load(id) {
      // 加载虚拟模块

      if (id === resolvedFibVirtualModuleId) {
        const _code = await context.genarateClientCode();
        return {
          code: _code,
        };
      }

      return null;
    },
  };
}
