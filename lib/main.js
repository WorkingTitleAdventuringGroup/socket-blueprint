import md from 'markdown-tree';
import { markdown } from 'markdown';
import program from 'commander';
import { readFileSync } from 'fs';
import 'babel-regenerator-runtime'; // For generators
import { prettyPrint as html } from 'html';

program
    .usage('[option] <file>')
    .parse(process.argv);

class Node {
    parent = null;
    children = [];
    data = {};
    constructor(data) {
        if (data) {
            this.data = data;
        }
    }

    push(node) {
        if (!(node instanceof Node)) {
            const tmp = node;
            node = new Node();
            node.data = tmp;
        }

        node.parent = this;
        this.children.push(node);
    }

    toString(depth=0) {
        let s = '';

        for (let i = 0; i < depth; i += 1) {
            s += ' ';
        }

        s += `${this.data.type}\n`;
        for (const node of this.children) {
            s += node.toString(depth + 1);
        }

        return s;
    }

    *[Symbol.iterator]() {
        yield this.data;
        for (const node of this.children) {
            yield* node;
        }
    }
}

// const HEADER_REGEX = /^(.*?)(\s+-\s*(client|server|both))?\s+(\[(.*)\])?\s*$/i;

// function buildTree({node, path=''} = {}) {
//     let output = '';
//     let headerText = '';
//     let currentContent = '';
//     let originator, subpath = path;
//     const data = node.data;

//     const m = data.text.match(HEADER_REGEX);
//     if (m) {
//         originator = m[3];
//         subpath += `${path}/${m[5]}`;
//         headerText = m[1];
//     } else {
//         headerText = data.text;
//     }

//     console.log(`- ${headerText}`);

//     for (const child of node.children) {
//         if (child.data.type !== 'heading') {
//             // console.log(child.data);
//         }
//     }

//     output += `<h${data.depth}>${headerText}</h${data.depth}>`;
//     output += currentContent;

//     for (const child of node.children) {
//         if (child.data.type === 'heading') {
//             output += buildTree({
//                 node: child,
//                 path: subpath,
//             });
//         }
//     }

//     return output;
// }

// const ATTRIBUTES = {
//     parameters: consumeParameters,
//     transmission: consumeTransmission,
//     response: consumeResponse,
// };

// function consumeParameters(next, iterator) {
//     const node = new Node({
//         type: 'ParameterList',
//         parameters: {},
//     });

//     next = iterator.next();

//     while (!next.done) {
//         console.log(next.value);
//         switch (next.value.type) {
//             case 'list_end': {

//                 return [iterator.next(), node];
//             } break;
//         }

//         next = iterator.next();

//     }

//     return [next, node];
// }

// function consumeTransmission(next, iterator) {
//     return [next, iterator];
// }

// function consumeResponse(next, iterator) {
//     return [next, iterator];
// }

// function consumeList(next, iterator) {
//     let child;
//     const node = new Node({
//         type: 'list',
//     });

//     console.log('===================');

//     next = iterator.next();

//     while (!next.done) {
//         switch (next.value.type) {
//         case 'list_end': {
//             next = iterator.next();
//             return [next, node];
//         } break;

//         case 'loose_item_start':  {
//             next = iterator.next();

//             [next, child] = ATTRIBUTES[next.value.text.toLowerCase()](next, iterator);
//             node.push(child);
//         } break;
//         default: {
//             // console.log(next.value);
//         }

//         }

//         next = iterator.next();
//     }

// }

// function consumeHeading(next, iterator) {
//     const node = new Node(next.value);
//     let childNode;

//     next = iterator.next();

//     while (!next.done) {
//         switch (next.value.type) {
//             case 'heading':  {
//                 if (next.value.depth <= node.data.depth) {
//                     return [next, node];
//                 } else {
//                     [next, childNode] = consumeHeading(next, iterator);
//                     node.push(childNode);
//                 }
//             } break;
//             case 'list_start': {
//                 [next, childNode] = consumeList(next, iterator);

//                 node.push(childNode);

//             } break;
//             default: {
//                 node.push(next.value);
//             }
//         }
//         next = iterator.next();
//     }

//     return [next, node];
// }

// function buildTreeFromTokenStream(tokenStream) {
//     const tree = new Node();

//     const iterator = tokenStream[Symbol.iterator]();
//     let next = iterator.next(), node;

//     while (!next.done) {
//         // console.log(next.value);

//         if (next.value.type !== 'heading') {
//             throw new Error('Items at this level should only be headings');
//         }

//         [next, node] = consumeHeading(next, iterator);

//         tree.push(node);
//     }

//     console.log(tree.toString());
//     // for (const token of tokenStream) {

//     // }

//     return tree;
// }


function parseTree(next, iterator) {

}


function buildFromTree(tree) {
    const iterator = tree[Symbol.iterator]();
    let next = iterator.next();
    let node;

    while (!next.done) {

        if (next.value !== 'markdown') {
            throw Error('What the fuck');
        }


        node = parseTree(next, iterator);


        next = iterator.next();
    }
    console.log(next);
    // for (const node of tree) {
    //     console.log(node);
    // }

    return node;
}


function generateDocs(path) {
    const data = readFileSync(path);
    const tree = markdown.parse(data.toString());

    // console.log(JSON.stringify(tree, null, '  '));

    console.log(buildFromTree(tree));

}

if (program.args.length) {
    generateDocs(program.args[0]);
}
