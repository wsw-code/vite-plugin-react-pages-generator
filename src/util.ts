export function componentReplacer(
  str: string,
  replaceStr: string,
  path: string
) {
  return `"element":React.createElement(${replaceStr.replace(/"/gi, "")})`;
}

export function lazyReplacer(str: string, replaceStr: string) {
  return `lazy:${replaceStr.replace(/"/gi, "")}`;
}
