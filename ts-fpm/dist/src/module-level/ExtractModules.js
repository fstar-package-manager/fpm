"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractModules = void 0;
const path_1 = require("path");
const tmp_promise_1 = require("tmp-promise");
const FStarCli_1 = require("./../utils/FStarCli");
const Utils_1 = require("../utils/Utils");
const Log_1 = require("../utils/Log");
const DepTree_1 = require("./DepTree");
let tup = (a, b) => [a, b];
let makeExtractFlag = (to_include, to_exclude) => {
    let Action;
    (function (Action) {
        Action[Action["INCLUDE"] = 0] = "INCLUDE";
        Action[Action["EXCLUDE"] = 1] = "EXCLUDE";
    })(Action || (Action = {}));
    let mkFreshNode = () => ({ edges: new Map() });
    let root = mkFreshNode();
    let getPath = (path) => {
        let node = root;
        for (let chunk of path) {
            let edge = node.edges.get(chunk);
            if (!edge)
                node.edges.set(chunk, edge = mkFreshNode());
            node = edge;
        }
        return node;
    };
    let setActionOfPath = (action) => (path) => {
        let node = getPath(path);
        if (node.action !== undefined)
            throw `[makeExtractFlag] expected [to_include] and [to_exclude] to be disjoint and to have no duplicates, but module [${path.join('.')}] appears twice`;
        node.action = action;
    };
    [
        ...to_include.map(m => tup(m, setActionOfPath(Action.INCLUDE))),
        ...to_exclude.map(m => tup(m, setActionOfPath(Action.EXCLUDE)))
    ].map(([m, add]) => add(m.replace(/[.]fsti?$/i, '').split('.')));
    let flagsOfTree = (node, chunks) => [
        ...(node.action === undefined ? [] : [tup(node.action, chunks)]),
        ...[...node.edges.entries()].map(([chunk, node]) => flagsOfTree(node, [...chunks, chunk])).flat()
    ];
    let toString = (f) => f.map(([action, mod]) => (action === Action.INCLUDE ? '+' : '-') + (mod.length ? mod.join('.') : '*')).join(' ');
    let simplify = (node) => {
        let edges = [...node.edges.entries()].map(([k, n]) => tup(k, simplify(n)));
        let a = node.action;
        if (a === undefined) {
            let count = { [Action.INCLUDE]: 0, [Action.EXCLUDE]: 0 };
            edges.forEach(([_, { action }]) => action === undefined || count[action]++);
            a = count[Action.INCLUDE] > count[Action.EXCLUDE] ? Action.INCLUDE : Action.EXCLUDE;
        }
        return {
            edges: new Map(edges.map(([k, { action, edges }]) => tup(k, {
                action: action === a ? undefined : action,
                edges
            })).filter(([_, { action, edges }]) => action !== undefined || edges.size > 0)),
            action: a
        };
    };
    root = simplify(root);
    return toString(flagsOfTree(root, []));
};
let isImplem = (m) => m.endsWith('.fst');
exports.ExtractModules = (0, Log_1.logCAFn)(Log_1.Level.INFO, "Extracting set of modules", (log) => async ({ verificationBinaries, extractionOptions, includePaths, modules: module_paths, enableLaxMode }, destination) => {
    let all_includes = [...new Set([...module_paths.map(x => (0, path_1.dirname)(x)), ...includePaths])].filter(x => x);
    let dest = destination || (await (0, tmp_promise_1.dir)({ keep: true })).path;
    let module_basenames = module_paths.map(n => (0, path_1.basename)(n));
    let interfaces = new Set(module_basenames.filter(m => !isImplem(m)));
    let modules = module_basenames.filter(isImplem);
    let deps = await (0, DepTree_1.depTree)(log)({
        bin: verificationBinaries,
        include: all_includes
    }, ...modules);
    let every_modules = [...new Set([...Object.keys(deps), ...Object.values(deps).map(s => [...s]).flat()].filter(isImplem))];
    let extract = async (modules) => {
        let not_to_extract = every_modules.filter(m => !modules.includes(m));
        await (0, FStarCli_1.fstar)("Extracting modules " + modules)(log)({
            bin: verificationBinaries,
            include: all_includes,
            quiet: false
        }, "--odir", dest, "--already_cached", "+*", "--extract", makeExtractFlag(modules, not_to_extract), ...(enableLaxMode ? ['--lax'] : []), ...(0, Utils_1.extractionOptions_to_flags)(extractionOptions), ...modules);
    };
    let clusters = [
        modules.filter(m => !interfaces.has(m + 'i')),
        ...modules.filter(m => interfaces.has(m + 'i')).map(m => [m])
    ];
    for (let cluster of clusters)
        await extract(cluster);
    return dest;
});
//# sourceMappingURL=ExtractModules.js.map