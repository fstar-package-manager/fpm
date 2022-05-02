import * as api from "./../../types/api"

import { pathExists, readdir, unlink } from "fs-extra"
import { basename, dirname } from "path"
import { dir } from "tmp-promise"
import { fstar } from "./../utils/FStarCli"
import { extractionOptions_to_flags, is_implem, withDestination } from "../utils/Utils"
import { Level, logCAFn, Logger } from "../utils/Log"
import { depTree } from "./DepTree"

let tup = <A, B>(a: A, b: B): [A, B] => [a, b]

let makeExtractFlag = (to_include: string[], to_exclude: string[]) => {
    enum Action { INCLUDE, EXCLUDE }
    type Node = { action?: Action, edges: Map<string, Node> }
    type ExtractFlags = [Action, string[]][]

    let mkFreshNode = () => ({ edges: new Map() })
    let root: Node = mkFreshNode();
    let getPath = (path: string[]) => {
        let node = root;
        for (let chunk of path) {
            let edge = node.edges.get(chunk);
            if (!edge)
                node.edges.set(chunk, edge = mkFreshNode())
            node = edge;
        }
        return node;
    }
    let setActionOfPath = (action: Action) => (path: string[]) => {
        let node = getPath(path);
        if (node.action !== undefined)
            throw `[makeExtractFlag] expected [to_include] and [to_exclude] to be disjoint and to have no duplicates, but module [${path.join('.')}] appears twice`;
        node.action = action;
    };
    [
        ...to_include.map(m => tup(m, setActionOfPath(Action.INCLUDE))),
        ...to_exclude.map(m => tup(m, setActionOfPath(Action.EXCLUDE)))
    ].map(([m, add]) => add(m.replace(/[.]fsti?$/i, '').split('.')))
    let flagsOfTree = (node: Node, chunks: string[]): ExtractFlags =>
        [
            ...(node.action === undefined ? [] : [tup(node.action, chunks)]),
            ...[...node.edges.entries()].map(([chunk, node]) => flagsOfTree(node, [...chunks, chunk])).flat()
        ];
    let toString = (f: ExtractFlags): string =>
        f.map(([action, mod]) => (action === Action.INCLUDE ? '+' : '-') + (mod.length ? mod.join('.') : '*')).join(' ');
    let simplify = (node: Node): Node => {
        let edges = [...node.edges.entries()].map(([k, n]) => tup(k, simplify(n)));
        let a = node.action;
        if (a === undefined) {
            let count: { [key in Action]: number } = { [Action.INCLUDE]: 0, [Action.EXCLUDE]: 0 }
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

let isImplem = (m: string) => m.endsWith('.fst');

export let ExtractModules = logCAFn(
    Level.INFO, "Extracting set of modules",
    (log: Logger): withDestination<api.ExtractModules> => async (
        {
            verificationBinaries,
            extractionOptions,
            includePaths,
            modules: module_paths,
            enableLaxMode
        },
        destination?: string
    ) => {
        let all_includes: string[] = [...new Set([...module_paths.map(x => dirname(x)), ...includePaths])].filter(x => x);
        let dest = destination || (await dir({ keep: true })).path;

        let module_basenames = module_paths.map(n => basename(n));
        let interfaces = new Set(module_basenames.filter(m => !isImplem(m)));
        let modules = module_basenames.filter(isImplem);

        let deps = await depTree(log)({
            bin: verificationBinaries,
            include: all_includes
        }, ...modules);


        let every_modules = [...new Set([...Object.keys(deps), ...Object.values(deps).map(s => [...s]).flat()].filter(isImplem))];

        let extract = async (modules: string[]) => {
            let not_to_extract = every_modules.filter(m => !modules.includes(m));
            await fstar("Extracting modules " + modules)(log)(
                {
                    bin: verificationBinaries,
                    include: all_includes,
                    quiet: false
                },
                "--odir", dest,
                "--already_cached", "+*",
                "--extract", makeExtractFlag(modules, not_to_extract),
                ...(enableLaxMode ? ['--lax'] : []),
                ...extractionOptions_to_flags(extractionOptions),
                ...modules
            );
        };

        let clusters: string[][] = [
            modules.filter(m => !interfaces.has(m + 'i')),
            ...modules.filter(m => interfaces.has(m + 'i')).map(m => [m])
        ]

        for (let cluster of clusters)
            await extract(cluster);

        return dest;
    })

