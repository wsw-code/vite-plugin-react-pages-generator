
import fs from 'fs';
import {normalizePath,transformWithEsbuild} from 'vite';
import * as Contants from '../constants';
import {pathToFileURL} from 'url'

/** 加载配置文件 */

export default async (routerPath:string) => {
    /**是否是ts文件 */
    const isTs = routerPath.endsWith('ts')

    if(isTs) {
        const str = fs.readFileSync(normalizePath(routerPath), "utf-8")
        /**把文件代码转为iife格式 */
        const _iife_code = await transformWithEsbuild(str,'test',{loader:'ts',format:'iife',globalName:Contants.GLOBAL_NAME})
        /**执行转化后代码，获取 路由配置中的数据 */
        const result = new Function(`${_iife_code.code} return ${Contants.GLOBAL_NAME}`)()
        
        if(result.default) {
          return  result.default
        }

      
    } else {
      const {href} = pathToFileURL(routerPath)
      const result = await import(href);
      if(result.default) {
        // console.log('result',result)
        return  result.default
      }
    }
    
    return null;

}