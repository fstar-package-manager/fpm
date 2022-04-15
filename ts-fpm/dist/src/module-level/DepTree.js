"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sort_by_dependencies = exports.transitive_closure = exports.depTree = void 0;
const path_1 = require("path");
const tmp_promise_1 = require("tmp-promise");
const FStarCli_1 = require("./../utils/FStarCli");
let depTree = (opts, ...modules) => __awaiter(void 0, void 0, void 0, function* () {
    let [checked_dir, r] = yield (0, tmp_promise_1.withDir)(({ path }) => __awaiter(void 0, void 0, void 0, function* () {
        return [path, yield (0, FStarCli_1.fstar)(Object.assign(Object.assign({}, opts), { quiet: true }), "--dep", "raw", "--cache_dir", path, "--warn_error", "-321", // TODO: disable?
            ...modules)];
    }));
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
exports.depTree = depTree;
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
let sort_by_dependencies = (opts, ...modules) => __awaiter(void 0, void 0, void 0, function* () {
    let sorted = [];
    let deps = yield (0, exports.depTree)(opts, ...modules);
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
});
exports.sort_by_dependencies = sort_by_dependencies;
//# sourceMappingURL=DepTree.js.map