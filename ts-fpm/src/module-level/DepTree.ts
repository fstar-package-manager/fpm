import { verificationBinaries } from "./../../types/types"
import { basename } from "path"
import { withDir } from "tmp-promise"
import { fstar } from "./../utils/FStarCli"

type mod_qual = "UseInterface" | "PreferInterface" | "UseImplementation" | "FriendImplementation"

export let depTree = async (
    opts: {
        bin: verificationBinaries["Resolved"],
        include?: string[],
    },
    ...modules: string[]
): Promise<{ [key: string]: Set<string> }> => {
    let [checked_dir, r] = await withDir(
        async ({ path }) => [path, await fstar(
            { ...opts, quiet: true },
            "--dep", "raw",
            "--cache_dir", path,
            "--warn_error", "-321", // TODO: disable?
            ...modules
        )]
    );
    let rules: { [key: string]: Set<[mod_qual, string]> } = {};
    let raw: string[] = r.stdout.toString().split('\n')
        .filter(line => line.trim());
    while (raw.length) {
        let line = raw.shift() as string;
        let match = line.match(/^(.*) -> \[$/);
        if (match === null)
            throw "Expected begining of rule (got '" + line + "').";
        let [_, f] = match;
        f = basename(f);
        let dependencies: Set<[mod_qual, string]> = new Set();
        while (raw.length) {
            let line = raw.shift() as string;
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

    let interfaces: { [key: string]: string } = {};
    let implementations: { [key: string]: string } = {};
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

    return Object.fromEntries(
        Object.entries(rules).map(([rule, deps]) =>
            [rule, new Set([...deps].map(([qual, name]) =>
                qual == "FriendImplementation" || qual == "UseImplementation" ? implementations[name] : interfaces[name]
            ))]
        )
    );
}

export let transitive_closure = (f: { [key: string]: Set<string> }) => {
    type t = { [key: string]: Set<string> };
    let cache: t = {};
    let rec = (x: string): Set<string> => {
        if (cache[x] !== undefined)
            return cache[x];
        if (!f[x])
            throw new Error(`Missing key ${x}`);
        return cache[x] = new Set([...f[x]].map(y => [y, ...rec(y)]).flat());
    };
    return Object.fromEntries(Object.keys(f).map(x => [x, rec(x)]));
};

export let sort_by_dependencies =
    async (opts: {
        bin: verificationBinaries["Resolved"],
        include?: string[]
    },
        ...modules: string[]
    ): Promise<string[]> => {
        let sorted: string[] = [];
        let deps = await depTree(opts, ...modules);
        let h = (x: string): void => {
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
