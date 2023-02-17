
import {Plugin,ViteDevServer,normalizePath,transformWithEsbuild} from 'vite';
import type { FSWatcher } from 'fs';
import * as Contants from './constants'
import path from 'path';
import {RouteProps,PluginProps} from './type';


type Props = {
  children?: Props[]
  element?: string;
  path: string
}

export default class PageContext {

  /**路由配置文件路径 */
  routerPath:string = ''
  /**server实例 */
  private _server: ViteDevServer | undefined;

  /**import 集合 */
  imports:Record<string,string> = {};

  constructor() {

  }


  setupViteServer(server: ViteDevServer) {
    if (this._server === server)
      return

    this._server = server
    this.setupWatcher(server.watcher)
  }


  setupWatcher(watcher: FSWatcher) {
    watcher
    .on('change', async(path) => {
      console.log(path)
    })
  }


  getRouteString(arr: Props[], indexList: number[] = []) {
    return arr.map((el, index) => {
      const { element, children = null } = el;
  
      let elementStr = element
      const curIndexList = [...indexList, index];
      if (element) {

        const elementPath = normalizePath(path.resolve('src','pages',element));
        const elementName = element.replace(/[^A-Za-z0-9 ]/ig,'')
        this.imports[elementName] = `import ${elementName} from '${elementPath}';`

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
        temp.children = this.getRouteString(children, curIndexList)
      };
  
      return temp
  
    })
  }

  


}