import marked from 'marked';
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

const HEADER_REGEX = /^(.*?)(\s+-\s*(client|server|both))?\s+(\[(.*)\])?\s*$/i;

function buildTree({node, path=''} = {}) {
    let output = '';
    let headerText = '';
    let currentContent = '';
    let originator, subpath = path;
    const data = node.data;

    const m = data.text.match(HEADER_REGEX);
    if (m) {
        originator = m[3];
        subpath += `${path}/${m[5]}`;
        headerText = m[1];
    } else {
        headerText = data.text;
    }

    console.log(`- ${headerText}`);

    for (const child of node.children) {
        if (child.data.type !== 'heading') {
            console.log(child.data);
        }
    }

    output += `<h${data.depth}>${headerText}</h${data.depth}>`;
    output += currentContent;

    for (const child of node.children) {
        if (child.data.type === 'heading') {
            output += buildTree({
                node: child,
                path: subpath,
            });
        }
    }

    return output;
}


function generateDocs(path) {
    const data = readFileSync(path);
    const tokens = marked.lexer(data.toString());
    const hierarchy = new Node();
    hierarchy.data = {
        type: 'root',
        depth: 0,
    };

    let current = hierarchy;

    tokens.forEach((token) => {
        if (token.type === 'heading') {
            while (current.data.depth >= token.depth) {
                current = current.parent;
            }

            const newNode = new Node();
            newNode.data = token;
            current.push(newNode);
            current = newNode;
        } else {
            current.push(token);
        }
    });

    let output = '';

    for (const child of hierarchy.children) {
        output += buildTree({node: child});
    }

    console.log(html(output));

    // console.log(hierarchy.toString());
    // console.log(Array.from(hierarchy));

}

if (program.args.length) {
    generateDocs(program.args[0]);
}
