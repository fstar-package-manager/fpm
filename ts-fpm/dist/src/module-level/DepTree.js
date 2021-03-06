"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sort_by_dependencies = exports.transitive_closure = exports.depTree = void 0;
const path_1 = require("path");
const tmp_promise_1 = require("tmp-promise");
const FStarCli_1 = require("./../utils/FStarCli");
const Log_1 = require("../utils/Log");
exports.depTree = (0, Log_1.logCAFn)(Log_1.Level.NOTICE, "Computing dependencies", log => async (opts, ...modules) => {
    let [checked_dir, r] = await (0, tmp_promise_1.withDir)(async ({ path }) => [path, await (0, FStarCli_1.fstar)("Running F*")(log)(Object.assign(Object.assign({}, opts), { quiet: "quiet" in opts ? opts.quiet : true }), "--dep", "raw", "--cache_dir", path, "--warn_error", "-321", // TODO: disable?
        ...modules)]);
    let rules = {};
    let raw = r.stdout.toString().split('\n')
        .filter(line => line.trim());
    while (raw.length) {
        let line = raw.shift();
        let match = line.match(/^(.*) -> \[$/);
        if (match === null)
            throw "Expected begining of rule (got '" + line + "').";
        let [_, f] = match;
        f = (0, path_1.basename)(f);
        let dependencies = new Set();
        while (raw.length) {
            let line = raw.shift();
            if (line.match(/^\] *(;;)?/))
                break;
            let match = line.match(/^[ \t]+([^ ]+)[ \t]+([^;]+);? *$/);
            if (match === null)
                throw "Expected dependency (got '" + line + "').";
            let [_, qual, mod] = match;
            if (qual != "UseInterface" && qual != "PreferInterface" &&
                qual != "UseImplementation" && qual != "FriendImplementation")
                throw `Invalid qualifier '${qual}'.`;
            dependencies.add([qual, mod]);
        }
        rules[f] = dependencies;
    }
    let interfaces = {};
    let implementations = {};
    for (let path in rules) {
        let match = path.match(/^(.*)[.]fst(i)?/);
        if (match === null)
            throw `Malformed filename ${path}`;
        let [_, mod, kind] = match;
        mod = mod.toLowerCase();
        // console.log({ path, mod, kind })
        if (!interfaces[mod] || kind == 'i')
            interfaces[mod] = path;
        if (!kind)
            implementations[mod] = path;
    }
    return Object.fromEntries(Object.entries(rules).map(([rule, deps]) => [rule, new Set([...deps].map(([qual, name]) => qual == "FriendImplementation" || qual == "UseImplementation" ? implementations[name] : interfaces[name]))]));
});
let transitive_closure = (f) => {
    let cache = {};
    let rec = (x) => {
        if (cache[x] !== undefined)
            return cache[x];
        if (!f[x])
            throw new Error(`Missing key ${x}`);
        return cache[x] = new Set([...f[x]].map(y => [y, ...rec(y)]).flat());
    };
    return Object.fromEntries(Object.keys(f).map(x => [x, rec(x)]));
};
exports.transitive_closure = transitive_closure;
let sort_by_dependencies = (log) => async (opts, ...modules) => {
    let sorted = [];
    let deps = await ((0, exports.depTree)(log)(opts, ...modules));
    let h = (x) => {
        if (modules.includes(x)) {
            for (let k of deps[x])
                h(k);
            sorted.includes(x) || sorted.push(x);
        }
    };
    for (let m of modules)
        h(m);
    return sorted;
};
exports.sort_by_dependencies = sort_by_dependencies;
//# sourceMappingURL=DepTree.js.map