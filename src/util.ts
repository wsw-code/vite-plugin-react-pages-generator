export function componentReplacer(str: string, replaceStr: string) {

  return `"element":${replaceStr.replace(/"/gi, "")}`;
}


export const ReactElement = (str:string,props?:string)=> `React.createElement(${str}${props?`,${props}`:''})` 