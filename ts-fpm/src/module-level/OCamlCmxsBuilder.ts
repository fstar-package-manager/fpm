import { ocamlPackagePlugin } from "./../../types/types"
import * as api from "./../../types/api"
import { symlink, rename, readdir, writeFile, unlink, rmdir } from "fs-extra"
import { basename, dirname } from "path"
import { dir, withDir } from "tmp-promise"
import { execFile, withDestination } from "./../utils/Utils"

export let OCamlCmxsBuilder: withDestination<api.OCamlCmxsBuilder> = async (
    {
        ocamlBinaries,
        ocamlPackages,
        extractionProduct,
        cmxsName
    },
    destination?: string
): Promise<ocamlPackagePlugin> => {
    let dest: string = destination || (await dir({ keep: true })).path;
    await withDir(async d => {
        let temp_packages_dir = d.path;
        for (let p of ocamlPackages)
            await symlink(p, temp_packages_dir + '/' + basename(p));
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

        await execFile("ocamlbuild", [
            ["-use-ocamlfind", "-cflag", "-g"],
            ["-package", "fstar-tactics-lib"],
            ocamlPackages.map(p => ["-package", basename(p)]).flat(),
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
                    temp_packages_dir,
                    ocamlBinaries.OCAMLPATH
                ].join(':')
            }
        });

        for (let name of await readdir(`${dest}/_build`)) {
            let path = `${dest}/_build/${name}`;
            if (name.match(/[.]cm(i|a|x[sa]?)$/))
                await rename(path, `${dest}/${name}`)
            else
                await unlink(path);
        }
        await rmdir(`${dest}/_build/`);

        clean_ml_modules();
    });
    return dest;
};

