import { Plugin, normalizePath } from "vite";

import * as Contants from "./constants";
import {  ConfigProps } from "./type";
import PageContext,{resolvedFibVirtualModuleId,virtualFibModuleId,moduleGraphName} from './context';
import path from "path";




export const defineConfig = (config: ConfigProps) => {
  return config;
};

export const dynamicImport = new Function("file", "return import(file)");

type Props = {
  children?: Props[];
  element?: string;
  path: string;
};

export default function virtualFibModulePlugin(): Plugin {
  const context = new PageContext();

  // 路由配置文件路径
  let routerPath = process.cwd() + "/" + 'router.config.ts';

  let imports: Record<string, string> = {};



  const getRouteString = (arr: Props[], indexList: number[] = []) => {
    return arr.map((el, index) => {
      const { element, children = null } = el;
      let elementStr = element;
      const curIndexList = [...indexList, index];
      if (element) {
        const elementPath = normalizePath(
          path.resolve("src", "pages", element)
        );
        const elementName = element.replace(/[^A-Za-z0-9]/gi, "");
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

    config(config, configEnv) {
      console.log(config)
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
        console.log("加载模块22", id);

        // const [configPath,{ routes }] = await resolveUserConfig(
        //   process.cwd(),
        //   mode,
        //   command
        // );

        //   console.log(configPath)

        // const routeString = JSON.stringify(getRouteString(routes));

        // const transformStr = routeString.replace(
        //   Contants.componentRE,
        //   componentReplacer
        // );

        // const _code = `
        // import React from "react";\n
        // ${Object.values(imports).join("\n")} \n
        // const ${Contants.routeData} = ${JSON.stringify(routes)}
        // export default ${transformStr};\n
        // `;

        // return {
        //   code: _code,
        // };

        const _code = await context.genarateClientCode();

        return {
          code:_code
        }
      }

      return null;
    },
  };
}
