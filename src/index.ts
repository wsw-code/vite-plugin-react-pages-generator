

import {Plugin,ViteDevServer,normalizePath,transformWithEsbuild,ModuleNode} from 'vite';
import * as Contants from './constants'
import {componentReplacer} from './util';
import {RouteProps,PluginProps} from './type';

import PageContext from './context';


import path from 'path'
import fs from 'fs'
// 虚拟模块名称
const virtualFibModuleId = 'react-router-page';
// Vite 中约定对于虚拟模块，解析后的路径需要加上`\0`前缀
const resolvedFibVirtualModuleId = '\0' + virtualFibModuleId;



export const dynamicImport = new Function('file', 'return import(file)')
  


type Props = {
  children?: Props[]
  element?: string;
  path: string
}



export default function virtualFibModulePlugin({pathName}:PluginProps): Plugin {




  const context = new PageContext();


  // 路由配置文件路径
  let routerPath = process.cwd() + '/'+pathName;

  console.log('routerPath=',routerPath);
  

  // let preMd5 = '';

  let routesList:RouteProps[] = []

  let myServer:ViteDevServer;
  let imports: Record<string, string> = {};

  const getRouteString = (arr: Props[], indexList: number[] = []) => {
    return arr.map((el, index) => {
      const { element, children = null } = el;
      let elementStr = element
      const curIndexList = [...indexList, index];
      if (element) {

        const elementPath = normalizePath(path.resolve('src','pages',element));
        const elementName = element.replace(/[^A-Za-z0-9 ]/ig,'')
        imports[elementName] = `import ${elementName} from '${elementPath}';`

        if (!children) {
          elementStr = elementName
        } else {
          elementStr = `${elementName},{routes:${Contants.routeData}[${curIndexList.join("]['children'][")}]}`
        }

      }
  
      const temp = {
        ...el
      };

      if (element) {
        temp.element = elementStr
      };
  
      if (children) {
        temp.children = getRouteString(children, curIndexList)
      };
  
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


    async configResolved() {


      
    },

    configureServer(server:ViteDevServer) {
      myServer = server;
      myServer.watcher.on('change',(path)=>{
        if(normalizePath(routerPath) === normalizePath(path)) {
          
          myServer.ws.send({
            type: 'full-reload',
          })

  
          const mods = server.moduleGraph.getModulesByFile('\x00react-router-page');

          if (mods) {
            const seen = new Set<ModuleNode>()
            mods.forEach((mod) => {
              console.log(1)
              server.moduleGraph.invalidateModule(mod, seen)
            })
          }
        }
      })
    },

    async load(id) {
      
      console.log('id',id)
      // 加载虚拟模块
      if (id === resolvedFibVirtualModuleId) {

        /**读取文件 */
        const str = fs.readFileSync(normalizePath(routerPath), "utf-8")
        /**把文件代码转为iife格式 */
        const _iife_code = await transformWithEsbuild(str,'test',{loader:'ts',format:'iife',globalName:Contants.GLOBAL_NAME})
        /**执行转化后代码，获取 路由配置中的数据 */
        const result = new Function(`${_iife_code.code} return ${Contants.GLOBAL_NAME}`)()
        
        if(result.default) {
          routesList = result.default
        }


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