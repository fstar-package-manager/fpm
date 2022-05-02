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
exports.OCamlCmxsBuilder = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const tmp_promise_1 = require("tmp-promise");
const Utils_1 = require("./../utils/Utils");
const Log_1 = require("../utils/Log");
exports.OCamlCmxsBuilder = (0, Log_1.logCAFn)(Log_1.Level.INFO, ({ cmxsName }) => "Building plugin " + cmxsName, (log) => ({ ocamlBinaries, ocamlPackages, extractionProduct, cmxsName }, destination) => __awaiter(void 0, void 0, void 0, function* () {
    let dest = destination || (yield (0, tmp_promise_1.dir)({ keep: true })).path;
    yield (0, tmp_promise_1.withDir)((d) => __awaiter(void 0, void 0, void 0, function* () {
        let temp_packages_dir = d.path;
        let ocamlPackagesNames = [];
        for (let p of ocamlPackages) {
            let META = p + '/META';
            if (!(yield (0, fs_extra_1.pathExists)(META)))
                continue;
            let name = ((yield (0, fs_extra_1.readFile)(META, 'utf8')).match(/name="([^"]+)"/) || [])[1];
            if (!name)
                throw new Error("Bad META file " + META);
            ocamlPackagesNames.push(name);
            yield (0, fs_extra_1.symlink)(p, temp_packages_dir + '/' + name);
        }
        let modules = (yield (0, fs_extra_1.readdir)(extractionProduct)).filter(x => x.endsWith('.ml'));
        let clean_ml_modules = yield (() => __awaiter(void 0, void 0, void 0, function* () {
            let links = yield Promise.all(modules.map((m) => __awaiter(void 0, void 0, void 0, function* () {
                let link = `${dest}/${m}`;
                yield (0, fs_extra_1.symlink)(`${extractionProduct}/${m}`, link);
                return link;
            })));
            return () => __awaiter(void 0, void 0, void 0, function* () { yield Promise.all(links.map(link => (0, fs_extra_1.unlink)(link))); });
        }))();
        yield (0, fs_extra_1.writeFile)(`${dest}/${cmxsName}.mllib`, modules.map(m => m.replace(/[.]ml$/, '')).join('\n'));
        // TODO!
        // ocamlPackages = ocamlPackages.map(p => basename(p));
        let rr = yield (0, Utils_1.execFile)(log)("ocamlbuild", [
            ["-use-ocamlfind", "-cflag", "-g"],
            ["-package", "fstar-tactics-lib"],
            ocamlPackagesNames.map(p => ["-package", p]).flat(),
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
                    temp_packages_dir,
                    ocamlBinaries.OCAMLPATH
                ].join(':') })
        });
        for (let name of yield (0, fs_extra_1.readdir)(`${dest}/_build`)) {
            let path = `${dest}/_build/${name}`;
            if (name.match(/[.]cm(i|a|x[sa]?)$/))
                yield (0, fs_extra_1.move)(path, `${dest}/${name}`);
            else {
                yield (0, fs_extra_1.unlink)(path);
            }
        }
        yield (0, fs_extra_1.rmdir)(`${dest}/_build/`);
        yield (0, fs_extra_1.writeFile)(`${dest}/META`, `name="${cmxsName}"
requires="${ocamlPackagesNames.join(',')}"`);
        yield clean_ml_modules();
    }));
    return dest;
}));
//# sourceMappingURL=OCamlCmxsBuilder.js.map