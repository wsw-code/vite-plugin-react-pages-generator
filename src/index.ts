import { Plugin, ViteDevServer, normalizePath } from "vite";

import * as Contants from "./constants";
import { componentReplacer } from "./util";
import { PluginProps, ConfigProps } from "./type";
import { resolveUserConfig } from "./util/loadConfigFile";
// import PageContext from './context';
import path from "path";

// 虚拟模块名称
const virtualFibModuleId = "react-router-page";
// Vite 中约定对于虚拟模块，解析后的路径需要加上`\0`前缀
const resolvedFibVirtualModuleId = "\0" + virtualFibModuleId;

export const defineConfig = (config: ConfigProps) => {
  return config;
};

export const dynamicImport = new Function("file", "return import(file)");

type Props = {
  children?: Props[];
  element?: string;
  path: string;
};

export default function virtualFibModulePlugin({
  pathName,
}: PluginProps): Plugin {
  // const context = new PageContext();

  // 路由配置文件路径
  let routerPath = process.cwd() + "/" + pathName;

  let myServer: ViteDevServer;
  let imports: Record<string, string> = {};

  let mode: "build" | "serve" = "serve";
  let command: "development" | "production" = "development";

  const getRouteString = (arr: Props[], indexList: number[] = []) => {
    return arr.map((el, index) => {
      const { element, children = null } = el;
      let elementStr = element;
      const curIndexList = [...indexList, index];
      if (element) {
        const elementPath = normalizePath(
          path.resolve("src", "pages", element)
        );
        const elementName = element.replace(/[^A-Za-z0-9 ]/gi, "");
        imports[elementName] = `import ${elementName} from '${elementPath}';`;

        if (!children) {
          elementStr = elementName;
        } else {
          elementStr = `${elementName},{routes:${
            Contants.routeData
          }[${curIndexList.join("]['children'][")}]}`;
        }
      }

      const temp = {
        ...el,
      };

      if (element) {
        temp.element = elementStr;
      }

      if (children) {
        temp.children = getRouteString(children, curIndexList);
      }

      return temp;
    });
  };

  return {
    name: "vite-plugin-react-pages-generator",
    resolveId(id) {
      if (id === virtualFibModuleId) {
        return resolvedFibVirtualModuleId;
      }
      return id;
    },

    async configResolved() {},

    config(config, { mode, command }) {
      console.log(config);
      mode = mode;
      command = command;
    },

    async handleHotUpdate(ctx) {
      console.log(normalizePath(routerPath));
      if (normalizePath(routerPath) === ctx.file) {
        /**重新刷新浏览器 */
        ctx.server.ws.send({
          type: "full-reload",
        });

        /**清楚缓存 */
        ctx.server.moduleGraph.onFileChange("\x00react-router-page");
      }
      // const customWatchedFiles = [normalizePath(config.configPath)];
      // const include = (id: string) =>
      //   customWatchedFiles.some((file) => id.includes(file));
      // if (include(ctx.file)) {
      //   console.log(
      //     `\n${relative(config.root, ctx.file)} changed, restarting server...`
      //   );
      //   // 重点: 重启 Dev Server
      //   await restartServer();
      // }
    },

    async load(id) {
      // 加载虚拟模块

      if (id === resolvedFibVirtualModuleId) {
        console.log("加载模块", id);
        // const _path = normalizePath(routerPath);
        const { routes } = await resolveUserConfig(
          process.cwd(),
          mode,
          command
        );

        console.log("props", JSON.stringify(routes));

        // resolveUserConfig(process.cwd());
        // routesList = await loadConfigFile(_path);
        /**创建返回路由 */
        const routeString = JSON.stringify(getRouteString(routes));

        const transformStr = routeString.replace(
          Contants.componentRE,
          componentReplacer
        );

        const _code = `
        import React from "react";\n
        ${Object.values(imports).join("\n")} \n
        const ${Contants.routeData} = ${JSON.stringify(routes)}
        export default ${transformStr};\n
        `;
        return {
          code: _code,
        };
      }

      return null;
    },
  };
}
