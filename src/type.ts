

/**路由配置类型 */
export type RouteProps = {
  element?:string;
  path:string;
  children?:RouteProps[]
}

/**插件参数类型 */
export type PluginProps = {
  pathName:string
}


export type ConfigProps = {
  routes:RouteProps[]
}