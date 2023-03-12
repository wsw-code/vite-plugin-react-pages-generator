

function isObject (a:any) {
    return Object.prototype.toString.call(a) === '[Object object]' && a !== null
}  

function isSameType(a:any,b:any) {
    return Object.prototype.toString.call(a) === Object.prototype.toString.call(b)
}


/**
 * 深度对比函数
 * @param a 
 * @param b 
 * @returns boolean
 */
export function isEqual (a:any,b:any) {

    if(a === b) {
        return true
    }

    if(!isObject(a) || !isObject(b)) {
        return a === b
    }

    if(!isSameType(a,b)) {

        return false
    }

    const aKey = Object.keys(a);

    const bKey = Object.keys(b);

    if(aKey.length !== bKey.length) {
        return false
    }

    for (let index = 0; index < aKey.length; index++) {
        const key = aKey[index];

        if(!b.hasOwnProperty(key)) {
            return false
        }

        if(!isEqual(a[key],b[key])) {
            return false
        }
        
    }


    return true
}