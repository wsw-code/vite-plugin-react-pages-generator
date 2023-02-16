

import {Plugin,ViteDevServer,normalizePath,transformWithEsbuild,loadConfigFromFile} from 'vite';
import * as Contants from './constants'
import {componentReplacer} from './util';
import {RouteProps,PluginProps} from './type'

import {createRequire} from 'node:module'

import path from 'path'

import fs from 'fs'
// 虚拟模块名称
const virtualFibModuleId = 'react-router-config';
// Vite 中约定对于虚拟模块，解析后的路径需要加上`\0`前缀
const resolvedFibVirtualModuleId = '\0' + virtualFibModuleId;



export const dynamicImport = new Function('file', 'return import(file)')
  



export default function virtualFibModulePlugin({pathName}:PluginProps): Plugin {

  // 路由配置文件路径
  let routerPath = process.cwd() + '/'+pathName;

  console.log('routerPath=',routerPath)

  // let preMd5 = '';

  let routesList:RouteProps[] = []

  let myServer:ViteDevServer;
  let imports: Record<string, string> = {};

  const getRouteString = (arr: RouteProps[], indexList: number[] = []) => {
    return arr.map((el, index) => {
      const { element, children = null } = el;
  
      let elementStr = element
      const curIndexList = [...indexList, index];
      if (element) {
        if (!children) {
          imports[element] = `import ${element} from './src/pages/${element}';`
          elementStr = element
        } else {
          imports[element] = `import ${element} from './src/pages/${element}';`;
          elementStr = `${element},{routes:${Contants.routeData}[${curIndexList.join("]['children'][")}]}`
        }
      }
  
      const temp = {
        ...el
      }
      if (element) {
        temp.element = elementStr
      }
  
      if (children) {
        temp.children = getRouteString(children, curIndexList)
      }
  
      return temp
  
  
    })
  }
  

  return {
    name: 'vite-plugin-react-pages-generator',
    resolveId(id) {
      if (id === virtualFibModuleId) { 
        return resolvedFibVirtualModuleId;
      }
      return id
    },


    async configResolved(config) {

      /**读取文件 */
      const str = fs.readFileSync(normalizePath(routerPath), "utf-8")
      /**把文件代码转为iife格式 */
      const _code = await transformWithEsbuild(str,'test',{loader:'ts',format:'iife',globalName:Contants.GLOBAL_NAME})
      /**执行转化后代码，获取 路由配置中的数据 */
      const result = new Function(`${_code.code} return ${Contants.GLOBAL_NAME}`)()
      
      if(result.default) {
        routesList = result.default
      }
      
    },

    configureServer(server:ViteDevServer) {
      myServer = server;
      myServer.watcher.on('change',(path)=>{
        console.log(`${path} is changed`);
        console.log(normalizePath(routerPath) , path)
        if(normalizePath(routerPath) === normalizePath(path)) {
          console.log('路由文件变更了，reload')
        }
      })
    },

    load(id) {
      
      // console.log('loadId',id)
      // 加载虚拟模块
      if (id === resolvedFibVirtualModuleId) {
        /**创建返回路由 */
        const routeString = JSON.stringify(getRouteString(routesList));
        const transformStr = routeString.replace(Contants.componentRE, componentReplacer);
        const _code = `
        import React from "react";\n
        ${Object.values(imports).join('\n')} \n
        const ${Contants.routeData} = ${JSON.stringify(routesList)}
        export default ${transformStr};\n
        `
        // fs.writeFileSync('test.ts',_code);
        return {
          code:_code
        }
      }

      return null
    }
  }
}