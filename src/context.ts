import {
  Plugin,
  ViteDevServer,
  normalizePath,
  transformWithEsbuild,
} from "vite";
import type { ConfigEnv } from "vite";

import path from "path";
import { RouteProps } from "./type";
import resolveUserConfig, { getUserConfigPath } from "./util/loadConfigFile";
import * as Contants from "./constants";
import { componentReplacer } from "./util";
import { lazy } from "react";

// 虚拟模块名称
export const virtualFibModuleId = "react-router-page";
// Vite 中约定对于虚拟模块，解析后的路径需要加上`\0`前缀
export const resolvedFibVirtualModuleId = "\0" + virtualFibModuleId;

export const moduleGraphName = `\x00${virtualFibModuleId}`;

export const ElementPreName = "Pre_";

export const traverswRouteTree = (route: RouteProps[]) => {
  const res: RouteProps[] = [];

  const loopList: LoopType[] = [
    {
      parent: res,
      data: route,
    },
  ];

  while (loopList.length) {
    const { data, parent } = loopList.shift() as LoopType;
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      parent.push(element);
      if (element.children instanceof Array) {
        loopList.push({
          parent: parent[index].children as RouteProps[],
          data: element.children,
        });
      }
    }
  }

  return res;
};

type LoopType = {
  data: RouteProps[];
  parent: RouteProps[];
};

export const createElementName = (elementName: string) => {
  return `${ElementPreName}${elementName.replace(/[^A-Za-z0-9]/gi, "")}`;
};

export const genarateElePath = (element:string) => {
  return normalizePath(
    path.resolve("src", "pages", element)
  );
}

/**
 * 生成 组件名：组件引入字符串 Map
 * @param route 路由配置数据
 * @returns 例子：{A: 'import A from A路径'}
 */
export const getPathMap = (route: RouteProps[]) => {
  const res: Record<string, string> = {};
  const loopList: RouteProps[][] = [route];
  while (loopList.length) {
    const node = loopList.shift() as RouteProps[];
    for (let index = 0; index < node.length; index++) {
      const { element = null, children = null,lazy} = node[index];
      if (element && !lazy) {
        const elementPath = genarateElePath(element)
        const elementName = createElementName(element);
        res[elementName] = `import ${elementName} from '${elementPath}';`;
      }
      if (children) {
        loopList.push(children);
      }
    }
  }
  return res;
};

const injectChild = (
  element: string,
  indexList: number[],
  hasChild: boolean
) => {
  if (!hasChild) {
    return element;
  }

  return `${element},{routes:${Contants.routeData}[${indexList.join(
    "]['children']["
  )}]}`;
};


const genarateEle = (el:RouteProps,curIndexList:number[]) => {
  const { element, children = [],lazy} = el;
  if(element) {
    return lazy?{
      lazy:`React.lazy(()=>import(${genarateElePath(element)}))`
    }:{
      element: injectChild(
        createElementName(element),
        curIndexList,
        children.length ? true : false
      ),
    }
  } else {
    return {}
  }
}



/**
 * 生成符合react-router 数据
 * @param route
 */
export const generateCode = (
  route: RouteProps[],
  indexList: number[] = []
): any[] => {
  return route.map((el, index) => {
    const { element, children = [], ...rest } = el;
    const curIndexList = [...indexList, index];
    return {
      ...rest,
      ...genarateEle(el,curIndexList),
      ...(children.length
        ? { children: generateCode(children, curIndexList) }
        : {}),
    };
  });
};

const ROUTER_PATH = ["router.config.ts", "router.config.js"];

export default class PageContext {
  /**路由配置文件路径枚举 */
  routerPath = ROUTER_PATH;
  /**import 集合 */
  imports: Record<string, string> = {};

  /**目标配置文件路径 */
  targetPath?: string = "";

  config?: ConfigEnv = undefined;

  routes: RouteProps[] = [];

  constructor() {}

  initConfig(config: ConfigEnv) {
    this.config = config;
    this.targetPath = getUserConfigPath();
  }

  async genarateClientCode() {
    if (this.targetPath) {
      const { routes } = await resolveUserConfig(
        process.cwd(),
        this.config!.command,
        this.config!.mode,
        this.targetPath
      );

      const pathMap = getPathMap(routes);
      const routeString = JSON.stringify(generateCode(routes));

      const transformStr = routeString.replace(
        Contants.componentRE,
        componentReplacer
      );

      return `
      import React from "react";\n
      ${Object.values(pathMap).join("\n")} \n
      const ${Contants.routeData} = ${JSON.stringify(routes)}
      export default ${transformStr};\n
      `;
    }

    return "export default const routes = []";
  }
}
