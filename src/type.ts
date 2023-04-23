/**路由配置类型 */
export type RouteProps = {
  element?: string;
  path: string;
  children?: RouteProps[];
  name?: string;
  /**是否懒加载 */
  lazy?: boolean;
};

/**插件参数类型 */
export type PluginProps = {
  pathName: string;
};

export type ConfigProps = {
  routes: RouteProps[];
};

export type ModeType = 'string';

export type CommandType = 'development' | 'production';
