export const setParent = function (o) {
    if (o.nodes != undefined) {
        for (n in o.nodes) {
            o.nodes[n].parent = o;
            setParent(o.nodes[n]);
        }
    }
}

// var structure = {
//     "root":{
//         "name":"Main Level",
//         nodes:{
//             "node1":{
//                 "name":"Node 1"  
//             },
//             "node2":{
//                 "name":"Node 2"  
//             },
//             "node3":{
//                 "name":"Node 3"  
//             }
//         }
//     }
// }
// // Then I just call that function and can now get the parent of the current node in this object tree.

// setParent(structure.root);
// // If I now have a reference to the seconds sub node of root, I can just call.

// var node2 = structure.root.nodes["node2"];
// console.log(node2.parent.name);
// // and it will output "Main Level".