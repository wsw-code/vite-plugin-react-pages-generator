



export function componentReplacer(str: string, replaceStr: string, path: string) {
  return `"element":React.createElement(${replaceStr.replace(/"/ig, '')})`
}



