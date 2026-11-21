export const convertMapToObject = function(m){
    var obj = [...m.entries()].reduce( (acc, c) => ( 
        acc[c[0]] = c[1], 
        acc), {}); //convert to object
        return obj
}