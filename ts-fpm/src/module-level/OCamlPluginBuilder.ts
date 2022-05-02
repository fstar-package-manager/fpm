import { ocamlPackagePlugin } from "./../../types/types"
import * as api from "./../../types/api"
import { symlink, rename, readdir, writeFile, unlink, rmdir, pathExists, readFile, move } from "fs-extra"
import { basename, dirname, resolve } from "path"
import { dir, DirectoryResult, withDir } from "tmp-promise"
import { execFile, withDestination } from "./../utils/Utils"
import { Level, Logger, logCAFn } from "../utils/Log"


// Given [ocamlPackages] a list of [n] directories containing a [META]
// file, [prepareOCamlPathDirectory(ocamlPackages)] is a path pointing
// to a directory containing [n] sub-directories named after the field
// [name] of [META] files.
let prepareOCamlPathDirectory = async (
    ocamlPackages: string[]
): Promise<[string, string[], (() => Promise<void>)]> => {
    let temp = await dir({ keep: true });
    let files: string[] = [];
    return [temp.path, await Promise.all(ocamlPackages.map(async pkg => {
        let META = pkg + '/META';
        if (!(await pathExists(META)))
            throw new Error("[prepareOCamlPathDirectory] The META file [" + META + "] was not found");
        let name = ((await readFile(META, 'utf8')).match(/name="([^"]+)"/) || [])[1];
        if (!name)
            throw new Error("[prepareOCamlPathDirectory] Missing [name] field in META file [" + META + "]");
        let dest = temp.path + '/' + name;
        files.push(dest);
        await symlink(resolve(pkg), resolve(dest));
        return name;
    })), async () => { await Promise.all(files.map(unlink)) }];
};

export let OCamlPluginBuilder = logCAFn(
    Level.INFO, ({ cmxsName }) => "Building plugin " + cmxsName,
    (log: Logger): withDestination<api.OCamlPluginBuilder> => async (
        {
            ocamlBinaries,
            ocamlPackages,
            extractionProduct,
            cmxsName
        },
        destination?: string
    ): Promise<ocamlPackagePlugin> => {
        let dest: string = destination || (await dir({ keep: true })).path;
        let modules = (await readdir(extractionProduct)).filter(x => x.endsWith('.ml'));
        let clean_ml_modules: () => Promise<void> = await (async () => {
            let links = await Promise.all(modules.map(async m => {
                let link = `${dest}/${m}`;
                await symlink(`${extractionProduct}/${m}`, link);
                return link;
            }));
            return async () => { await Promise.all(links.map(link => unlink(link))) };
        })();
        await writeFile(`${dest}/${cmxsName}.mllib`, modules.map(m => m.replace(/[.]ml$/, '')).join('\n'));

        let [ocamlPkgsDir, ocamlPkgsNames, ocamlPkgsCleanDir] = await prepareOCamlPathDirectory(ocamlPackages);

        ocamlPkgsNames = [
            ...ocamlPkgsNames,
            "batteries", "compiler-libs", "compiler-libs.common", "dynlink", "pprint", "stdint", "yojson", "zarith",
            "ppxlib", "ppx_deriving.std", "ppx_deriving_yojson", "ppx_deriving_yojson.runtime"
        ];

        await execFile(log)("ocamlbuild", [
            ["-use-ocamlfind", "-cflag", "-g"],
            // ["-package", "fstar-tactics-lib"], // TODO, should be inherited
            ocamlPkgsNames.map(p => ["-package", p]).flat(),
            [cmxsName + ".cmxs"]
        ].flat(), {
            cwd: dest,
            env: {
                ...process.env,
                PATH: [
                    ...(process.env.PATH || '').split(':'),
                    ocamlBinaries.ocamlbin,
                    dirname(ocamlBinaries.ocamlbuild),
                    dirname(ocamlBinaries.gcc),
                    dirname(ocamlBinaries.ocamlfind)
                ].join(':'),
                OCAMLPATH: [
                    ...(process.env.OCAMLPATH || '').split(':'),
                    ocamlPkgsDir,
                    ocamlBinaries.OCAMLPATH
                ].join(':')
            }
        });

        for (let name of await readdir(`${dest}/_build`)) {
            let path = `${dest}/_build/${name}`;
            if (name.match(/[.]cm(i|a|x[sa]?)$/))
                await move(path, `${dest}/${name}`)
            else
                await unlink(path);
        }
        await rmdir(`${dest}/_build/`);
        await writeFile(`${dest}/META`, `name="${cmxsName}"
requires="${ocamlPkgsNames.join(',')}"`);
        await clean_ml_modules();
        await ocamlPkgsCleanDir();
        return dest;
    });

