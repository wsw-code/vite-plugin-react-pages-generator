export function componentReplacer(str: string, replaceStr: string) {
  console.log(replaceStr);
  return `"element":React.createElement(${replaceStr.replace(/"/gi, "")})`;
}
