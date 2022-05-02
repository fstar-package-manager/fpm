"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const DepTree_1 = require("./module-level/DepTree");
const path = __importStar(require("path"));
const Config_1 = require("./utils/Config");
const http_1 = require("http");
const url_1 = require("url");
const Log_1 = require("./utils/Log");
let getFiles = async (dir) => (await Promise.all((await (0, fs_extra_1.readdir)(dir)).map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    return (await (0, fs_extra_1.stat)(res)).isDirectory() ? getFiles(res) : [res];
}))).flat();
(async () => {
    let config = (0, Config_1.mkDefaultConfig)();
    let FSTAR_PATH = '/home/lucas/Bureau/FStar-with-fpm/';
    let modules = (await getFiles(`${FSTAR_PATH}/ulib`)).filter(p => p.match(/.*[.]fsti?$/i) &&
        !p.match(/experimental[/]/i) &&
        !p.match(/LowStar/i) &&
        !p.match(/reclaimable[/]/i) &&
        !p.match(/prim/i) &&
        !p.match(/[/][.]/i) &&
        true);
    let tree = await (0, DepTree_1.depTree)(Log_1.rootLogger)({
        bin: { fstar_binary: 'fstar.exe' },
        include: [...new Set(modules.map(path.dirname))],
        quiet: false
    }, ...modules.map(p => path.basename(p)));
    let tree_ = {};
    let uniq = (l) => [...new Set(l)];
    let mem = {};
    let closure = (dep) => mem[dep] || (mem[dep] = uniq([
        [dep],
        ...[...tree[dep]].map(closure)
    ].flat()));
    let tup = (a, b) => [a, b];
    for (let [k, s] of Object.entries(tree)) {
        let d = [...s];
        tree_[k] = d.map(x => tup(x, d.filter(y => x != y)))
            .filter(([x, d]) => !d.map(closure).flat().includes(x))
            .map(([x, _]) => x);
    }
    // let transitions: Set<string> = new Set();
    // let h = (name: string): string => name.replace(/[^a-zA-Z0-9]*/, '_');
    // let nodes = new Set(Object.entries(tree_).map(([_, deps]) => deps).flat());
    // let leaves = Object.keys(tree_).filter(k => !nodes.has(k));
    // let roots = new Set(Object.entries(tree_).filter(([_, deps]) => deps.length == 0).map(([m, _]) => m));
    // type vec = [number, number]
    // type image =
    //     { kind: 'line', p0: vec, p1: vec } |
    //     { kind: 'text', center: vec, text: string } |
    //     { kind: 'circle', center: vec, radius: number }
    //     ;
    // let sizeOfImage = (i: image): { position: vec, size: vec } =>
    //     i.kind == 'line'
    //         ? {
    //             position: [Math.min(i.p0[0], i.p1[0]), Math.min(i.p0[1], i.p1[1])],
    //             size: [Math.abs(i.p0[0] - i.p1[0]), Math.abs(i.p0[1] - i.p1[1])]
    //         }
    //         : i.kind == 'text'
    //             ? 
    //         : '0';
    // let display = (mod: string): [image, point] => {
    //     let deps = tree_[mod];
    //     deps.map(display);
    //     return
    // };
    // roots.map();
    //     var http = require('http')
    // var url = require('url')
    // var fs = require('fs')
    let json = JSON.stringify(tree_, null, 4);
    console.log('http://localhost:93100/');
    (0, http_1.createServer)(async (request, response) => {
        let requestUrl = (0, url_1.parse)(request.url || '');
        response.writeHead(200);
        response.end((await (0, fs_extra_1.readFile)('/home/lucas/Bureau/fpm-bin/ts-fpm/src/deptest.html', 'utf8')).replace(/MYJSON/, json));
        // fs.createReadStream(requestUrl.pathname).pipe(response)  // do NOT use fs's sync methods ANYWHERE on production (e.g readFileSync) 
    }).listen(9310);
    // await writeFile("/tmp/visualization.json", );
})();
//# sourceMappingURL=deptest.js.map