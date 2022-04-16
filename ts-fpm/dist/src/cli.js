#!/usr/bin/env node
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const endpoints_1 = require("./endpoints");
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = require("fs-extra");
const Config_1 = require("./utils/Config");
const Validation_1 = require("./utils/Validation");
const ResolvePackageSet_1 = require("./package-level/ResolvePackageSet");
const Utils_1 = require("./utils/Utils");
const All_1 = require("./library-level/All");
const chalk_1 = __importDefault(require("chalk"));
const FStarCli_1 = require("./utils/FStarCli");
const Exn_1 = require("./utils/Exn");
let getFiles = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield Promise.all((yield (0, fs_extra_1.readdir)(dir)).map((subdir) => __awaiter(void 0, void 0, void 0, function* () {
        const res = path_1.default.resolve(dir, subdir);
        return (yield (0, fs_extra_1.stat)(res)).isDirectory() ? getFiles(res) : [res];
    })))).flat();
});
commander_1.program
    .name('fpm')
    .description('The F* Package Manager')
    .version('0.8.0');
let packageNameRegex = /^[0-9]*[a-z][a-z0-9]*(-[0-9]*[a-z][a-z0-9]*)*$/i;
// Given a string that may not conform to [packageNameRegex],
// [suggestPackageName] crafts a conforming string or [undefined]
let suggestPackageName = (str) => {
    let s = str.replace(/[^0-9a-z]+/i, '-');
    if (s.match(packageNameRegex) !== null)
        return s;
};
let init_questions = () => [
    {
        name: 'name',
        message: 'Name:',
        default: suggestPackageName(path_1.default.basename(process.cwd()))
    },
    { name: 'license', message: 'License:', default: "none" },
    { name: 'author', message: 'Author:', default: "none" },
    { name: 'maintainer', message: 'Author:', default: "none" },
    { name: 'homepage', message: 'Homepage:', default: "none" },
    { name: 'synopsis', message: 'Synopsis:', default: "none" },
    { name: 'description', message: 'Description:', default: "none" }
];
commander_1.program.command('init')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    let root = process.cwd();
    if (yield (0, fs_extra_1.pathExists)(root + '/' + Config_1.PACKAGE_FILE_NAME)) {
        console.error(`The file [${root + '/' + Config_1.PACKAGE_FILE_NAME}] exists already, aborting.`);
        process.exit(1);
    }
    let _a = yield inquirer_1.default.prompt(init_questions()), { name } = _a, opts = __rest(_a, ["name"]);
    opts = Object.fromEntries(Object.entries(opts).filter(([_, v]) => v != 'none'));
    let lib = {
        dependencies: [],
        modules: (yield getFiles(root))
            .filter(path => path.match(/[.]fsti?/))
            .map(path => path.slice(root.length + 1)),
        verificationOptions: {}
    };
    let pkg = Object.assign(Object.assign({ name }, opts), { lib });
    console.log(`The package definition to be written to ${Config_1.PACKAGE_FILE_NAME} is:`);
    console.log(pkg);
    if ((yield inquirer_1.default.prompt({ name: 'v', message: 'Save this?', type: 'confirm', default: true })).v) {
        yield (0, fs_extra_1.writeFile)(root + '/' + Config_1.PACKAGE_FILE_NAME, JSON.stringify(pkg, null, 4));
        console.log(`Wrote file [${root + '/' + Config_1.PACKAGE_FILE_NAME}]!`);
    }
    else {
        console.log('Abort.');
        process.exit(1);
    }
}));
let loadPackage = () => __awaiter(void 0, void 0, void 0, function* () {
    let contents;
    let cwd = process.cwd();
    let path = cwd + '/' + Config_1.PACKAGE_FILE_NAME;
    try {
        contents = yield (0, fs_extra_1.readFile)(path, 'utf8');
    }
    catch (e) {
        console.error(`Error: cannot read package file ${chalk_1.default.bold(path)}. Aborting.`);
        process.exit(1);
    }
    return (0, Validation_1.mapResult)(Validation_1.validators.packageT.Unresolved(JSON.parse(contents)), p => p, err => {
        console.error(`The package file ${chalk_1.default.bold(path)} is invalid. Aborting.`);
        console.error(`Validation error details:`);
        console.error(err);
        process.exit(1);
    });
});
let withCurrent = (f) => (...rest) => __awaiter(void 0, void 0, void 0, function* () {
    let src = process.cwd();
    let config = (0, Config_1.mkDefaultConfig)();
    let unresolved_ps = yield (0, Config_1.getUnresolvedPackageSet)(config);
    let pkg = yield loadPackage();
    let packageSet = yield (0, ResolvePackageSet_1.ResolvePackageSet)(config)({
        packageSet: unresolved_ps,
        packages: pkg.lib.dependencies
    });
    let rpkg = yield (0, ResolvePackageSet_1.ResolvePackage)({ packageSet, pkg, src });
    let verificationBinaries = yield (0, Utils_1.resolveVerificationBinariesWithEnv)(pkg.lib.verificationBinaries || {});
    return yield f({
        src, config, packageSet, pkg: rpkg,
        verificationBinaries
    }, ...rest);
});
commander_1.program.command('lock')
    .action(() => { throw Error("NOT IMPLEMENTED"); });
commander_1.program.command('make')
    .action(withCurrent(({ pkg, config, verificationBinaries }) => __awaiter(void 0, void 0, void 0, function* () {
    (0, endpoints_1.call)(config)({
        VerifyLibrary: {
            lib: pkg.lib,
            ocamlBinaries: yield (0, Utils_1.ocamlBinariesOfEnv)(),
            verificationBinaries
        }
    });
})));
commander_1.program.command('extract')
    .argument('<target>', 'target to extract')
    .action(withCurrent(({ pkg, src, config, verificationBinaries }, targetName) => __awaiter(void 0, void 0, void 0, function* () {
    if (!pkg.extractions || !(targetName in pkg.extractions)) {
        console.error(`The extraction target "${chalk_1.default.bold(targetName)}" is not defined by the F* package file [${chalk_1.default.bold(src + '/' + Config_1.PACKAGE_FILE_NAME)}].`);
        let targets = Object.keys(pkg.extractions || {});
        if (targets.length) {
            console.error(`The extraction targets available are:`);
            Object.entries(pkg.extractions || {}).map(([name, { opts }]) => ` - "${chalk_1.default.bold(name)}", that extracts in ${opts.lang}`).join(';\n');
        }
        process.exit(1);
    }
    let target = (pkg.extractions || {})[targetName];
    (0, endpoints_1.call)(config)({
        ExtractTarget: {
            target,
            ocamlBinaries: yield (0, Utils_1.ocamlBinariesOfEnv)(),
            verificationBinaries
        }
    });
})));
commander_1.program.command('fstar')
    .argument('<args...>', "arguments to fstar.exe binary")
    .action(withCurrent(({ pkg, src, config, verificationBinaries }, ...args) => __awaiter(void 0, void 0, void 0, function* () {
    let lib = pkg.lib;
    let ocamlBinaries = yield (0, Utils_1.ocamlBinariesOfEnv)();
    let include = [...new Set([
            ...yield (0, All_1.IncludePathsOfLibrary_excludingSelf)(config)({
                lib, verificationBinaries, ocamlBinaries
            }),
            ...pkg.lib.modules.map(path_1.default.dirname)
        ])];
    let cmxs_files = yield Promise.all(lib.dependencies.map(lib => (0, All_1.CmxsOfLibrary)(config)({ lib, ocamlBinaries, verificationBinaries })));
    (0, FStarCli_1.fstar)({
        bin: verificationBinaries,
        include, load_cmxs: cmxs_files.map(p => path_1.default.basename(p))
    }, ...(0, Utils_1.verificationOptions_to_flags)(lib.verificationOptions), ...args);
})));
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        commander_1.program.parse();
    }
    catch (e) {
        if (e instanceof Exn_1.ErrorFPM) {
            console.error(chalk_1.default.red("Error:"));
            console.error(e.message);
        }
        else {
            throw e;
        }
    }
}))();
//# sourceMappingURL=cli.js.map