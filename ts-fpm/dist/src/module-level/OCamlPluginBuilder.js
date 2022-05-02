"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCamlPluginBuilder = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const tmp_promise_1 = require("tmp-promise");
const Utils_1 = require("./../utils/Utils");
const Log_1 = require("../utils/Log");
// Given [ocamlPackages] a list of [n] directories containing a [META]
// file, [prepareOCamlPathDirectory(ocamlPackages)] is a path pointing
// to a directory containing [n] sub-directories named after the field
// [name] of [META] files.
let prepareOCamlPathDirectory = async (ocamlPackages) => {
    let temp = await (0, tmp_promise_1.dir)({ keep: true });
    let files = [];
    return [temp.path, await Promise.all(ocamlPackages.map(async (pkg) => {
            let META = pkg + '/META';
            if (!(await (0, fs_extra_1.pathExists)(META)))
                throw new Error("[prepareOCamlPathDirectory] The META file [" + META + "] was not found");
            let name = ((await (0, fs_extra_1.readFile)(META, 'utf8')).match(/name="([^"]+)"/) || [])[1];
            if (!name)
                throw new Error("[prepareOCamlPathDirectory] Missing [name] field in META file [" + META + "]");
            let dest = temp.path + '/' + name;
            files.push(dest);
            await (0, fs_extra_1.symlink)((0, path_1.resolve)(pkg), (0, path_1.resolve)(dest));
            return name;
        })), async () => { await Promise.all(files.map(fs_extra_1.unlink)); }];
};
exports.OCamlPluginBuilder = (0, Log_1.logCAFn)(Log_1.Level.INFO, ({ cmxsName }) => "Building plugin " + cmxsName, (log) => async ({ ocamlBinaries, ocamlPackages, extractionProduct, cmxsName }, destination) => {
    let dest = destination || (await (0, tmp_promise_1.dir)({ keep: true })).path;
    let modules = (await (0, fs_extra_1.readdir)(extractionProduct)).filter(x => x.endsWith('.ml'));
    let clean_ml_modules = await (async () => {
        let links = await Promise.all(modules.map(async (m) => {
            let link = `${dest}/${m}`;
            await (0, fs_extra_1.symlink)(`${extractionProduct}/${m}`, link);
            return link;
        }));
        return async () => { await Promise.all(links.map(link => (0, fs_extra_1.unlink)(link))); };
    })();
    await (0, fs_extra_1.writeFile)(`${dest}/${cmxsName}.mllib`, modules.map(m => m.replace(/[.]ml$/, '')).join('\n'));
    let [ocamlPkgsDir, ocamlPkgsNames, ocamlPkgsCleanDir] = await prepareOCamlPathDirectory(ocamlPackages);
    ocamlPkgsNames = [
        ...ocamlPkgsNames,
        "batteries", "compiler-libs", "compiler-libs.common", "dynlink", "pprint", "stdint", "yojson", "zarith",
        "ppxlib", "ppx_deriving.std", "ppx_deriving_yojson", "ppx_deriving_yojson.runtime"
    ];
    await (0, Utils_1.execFile)(log)("ocamlbuild", [
        ["-use-ocamlfind", "-cflag", "-g"],
        // ["-package", "fstar-tactics-lib"], // TODO, should be inherited
        ocamlPkgsNames.map(p => ["-package", p]).flat(),
        [cmxsName + ".cmxs"]
    ].flat(), {
        cwd: dest,
        env: Object.assign(Object.assign({}, process.env), { PATH: [
                ...(process.env.PATH || '').split(':'),
                ocamlBinaries.ocamlbin,
                (0, path_1.dirname)(ocamlBinaries.ocamlbuild),
                (0, path_1.dirname)(ocamlBinaries.gcc),
                (0, path_1.dirname)(ocamlBinaries.ocamlfind)
            ].join(':'), OCAMLPATH: [
                ...(process.env.OCAMLPATH || '').split(':'),
                ocamlPkgsDir,
                ocamlBinaries.OCAMLPATH
            ].join(':') })
    });
    for (let name of await (0, fs_extra_1.readdir)(`${dest}/_build`)) {
        let path = `${dest}/_build/${name}`;
        if (name.match(/[.]cm(i|a|x[sa]?)$/))
            await (0, fs_extra_1.move)(path, `${dest}/${name}`);
        else
            await (0, fs_extra_1.unlink)(path);
    }
    await (0, fs_extra_1.rmdir)(`${dest}/_build/`);
    await (0, fs_extra_1.writeFile)(`${dest}/META`, `name="${cmxsName}"
requires="${ocamlPkgsNames.join(',')}"`);
    await clean_ml_modules();
    await ocamlPkgsCleanDir();
    return dest;
});
//# sourceMappingURL=OCamlPluginBuilder.js.map