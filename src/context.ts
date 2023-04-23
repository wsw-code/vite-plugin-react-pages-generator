import { normalizePath } from 'vite';
import type { ConfigEnv } from 'vite';
import path from 'path';
import { RouteProps } from './type';
import resolveUserConfig, { getUserConfigPath } from './util/loadConfigFile';
import * as Contants from './constants';
import { componentReplacer, ReactElement } from './util';

// 虚拟模块名称
export const virtualFibModuleId = 'react-router-page';
// Vite 中约定对于虚拟模块，解析后的路径需要加上`\0`前缀
export const resolvedFibVirtualModuleId = '\0' + virtualFibModuleId;

export const moduleGraphName = `\x00${virtualFibModuleId}`;

export const ElementPreName = 'Pre_';

export const createElementName = (elementName: string) => {
  return `${ElementPreName}${elementName.replace(/[^A-Za-z0-9]/gi, '')}`;
};

export const genarateElePath = (element: string) => {
  return normalizePath(path.resolve('src', 'pages', element));
};

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
      const { element = null, children = null, lazy } = node[index];
      if (element) {
        const elementPath = genarateElePath(element);
        const elementName = createElementName(element);
        console.log('createElementName', elementName);
        if (lazy) {
          res[
            elementName
          ] = `const ${elementName} = React.lazy(()=>import('${elementPath}'))`;
        } else {
          res[elementName] = `import ${elementName} from '${elementPath}';`;
        }
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
  hasChild: boolean,
  isLazy?: boolean
) => {
  const elementName = createElementName(element);
  let reactString = hasChild
    ? ReactElement(
        elementName,
        `{routes:${Contants.routeData}[${indexList.join(']["children"][')}]}`
      )
    : ReactElement(elementName);

  if (isLazy) {
    reactString = ReactElement('React.Suspense', `{children:${reactString}}`);
  }

  return reactString;
};

const genarateEle = (el: RouteProps, curIndexList: number[]) => {
  const { element, children = [], lazy } = el;
  if (element) {
    return {
      element: injectChild(
        element,
        curIndexList,
        children.length ? true : false,
        lazy
      )
    };
  } else {
    return {};
  }
};

/**
 * 生成符合react-router 数据
 * @param route
 */
export const generateCode = (
  route: RouteProps[],
  indexList: number[] = []
): RouteProps[] => {
  return route.map((el, index) => {
    const { children = [], lazy, ...rest } = el;
    const curIndexList = [...indexList, index];
    return {
      ...rest,
      ...genarateEle(el, curIndexList),
      ...(children.length
        ? { children: generateCode(children, curIndexList) }
        : {})
    };
  });
};

const ROUTER_PATH = ['router.config.ts', 'router.config.js'];

export default class PageContext {
  /**路由配置文件路径枚举 */
  routerPath = ROUTER_PATH;
  /**import 集合 */
  imports: Record<string, string> = {};

  /**目标配置文件路径 */
  targetPath?: string = '';

  config?: ConfigEnv = undefined;

  routes: RouteProps[] = [];

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
      const route = generateCode(routes);
      const routeString = JSON.stringify(route);
      const transformStr = routeString.replace(
        Contants.componentRE,
        componentReplacer
      );

      return `
      import React from "react";\n
      ${Object.values(pathMap).join('\n')} \n
      const ${Contants.routeData} = ${JSON.stringify(routes)}
      export default ${transformStr};\n
      `;
    }

    return 'export default const routes = []';
  }
}
