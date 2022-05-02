#!/usr/bin/env node
"use strict";
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
const Log_1 = require("./utils/Log");
let getFiles = async (dir) => (await Promise.all((await (0, fs_extra_1.readdir)(dir)).map(async (subdir) => {
    const res = path_1.default.resolve(dir, subdir);
    return (await (0, fs_extra_1.stat)(res)).isDirectory() ? getFiles(res) : [res];
}))).flat();
let log = Utils_1.defaultLogger.child({ module: "cli" });
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
    .action(async () => {
    const root = process.cwd();
    const package_file_path = root + '/' + Config_1.PACKAGE_FILE_NAME;
    if (await (0, fs_extra_1.pathExists)(package_file_path)) {
        log.error({ root, package_file_path }, `The file [${package_file_path}] exists already, aborting.`);
        process.exit(1);
    }
    let _a = await inquirer_1.default.prompt(init_questions()), { name } = _a, opts = __rest(_a, ["name"]);
    opts = Object.fromEntries(Object.entries(opts).filter(([_, v]) => v != 'none'));
    let lib = {
        dependencies: [],
        modules: (await getFiles(root))
            .filter(path => path.match(/[.]fsti?/))
            .map(path => path.slice(root.length + 1)),
        verificationOptions: {}
    };
    let pkg = Object.assign(Object.assign({ name }, opts), { lib });
    log.info(pkg, `The package definition to be written to ${Config_1.PACKAGE_FILE_NAME} is:`);
    if ((await inquirer_1.default.prompt({ name: 'v', message: 'Save this?', type: 'confirm', default: true })).v) {
        await (0, fs_extra_1.writeFile)(package_file_path, JSON.stringify(pkg, null, 4));
        log.info(`Wrote file [${package_file_path}]!`);
    }
    else {
        log.error('Abort.');
        process.exit(1);
    }
});
let loadPackage = async () => {
    let contents;
    let cwd = process.cwd();
    let path = cwd + '/' + Config_1.PACKAGE_FILE_NAME;
    try {
        contents = await (0, fs_extra_1.readFile)(path, 'utf8');
    }
    catch (e) {
        log.error({}, `Error: cannot read package file ${chalk_1.default.bold(path)}. Aborting.`);
        process.exit(1);
    }
    return (0, Validation_1.mapResult)(Validation_1.validators.packageT.Unresolved(JSON.parse(contents)), p => p, err => {
        log.error({}, `The package file ${chalk_1.default.bold(path)} is invalid. Aborting.`);
        log.error({}, `Validation error details:`);
        log.error(err);
        process.exit(1);
    });
};
let withCurrent = (f) => async (...rest) => {
    let src = process.cwd();
    let config = await (0, Config_1.mkDefaultConfig)();
    // TODO, remove [_with_overrides] below, and figure out something better
    let unresolved_ps = await (0, Config_1.getUnresolvedPackageSet_with_overrides)(config);
    let pkg = await loadPackage();
    let packageSet = await (0, ResolvePackageSet_1.ResolvePackageSet)(config, Log_1.rootLogger)({
        packageSet: unresolved_ps,
        packages: pkg.lib.dependencies
    });
    let rpkg = await (0, ResolvePackageSet_1.ResolvePackage)({ packageSet, pkg, src });
    let verificationBinaries = await (0, Utils_1.resolveVerificationBinariesWithEnv)(pkg.lib.verificationBinaries || {});
    return await f({
        src, config, packageSet, pkg: rpkg,
        verificationBinaries
    }, ...rest);
};
commander_1.program.command('lock')
    .action(() => { throw Error("NOT IMPLEMENTED"); });
commander_1.program.command('make')
    .action(withCurrent(async ({ pkg, config, verificationBinaries }) => {
    await (0, endpoints_1.call)(config, Log_1.rootLogger)({
        VerifyLibrary: {
            lib: pkg.lib,
            ocamlBinaries: await (0, Utils_1.ocamlBinariesOfEnv)(),
            verificationBinaries
        }
    });
    await (0, endpoints_1.call)(config, Log_1.rootLogger)({
        PluginOfLibrary: {
            lib: pkg.lib,
            ocamlBinaries: await (0, Utils_1.ocamlBinariesOfEnv)(),
            verificationBinaries
        }
    });
}));
commander_1.program.command('extract')
    .argument('<target>', 'target to extract')
    .action(withCurrent(async ({ pkg, src, config, verificationBinaries }, targetName) => {
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
    (0, endpoints_1.call)(config, Log_1.rootLogger)({
        ExtractTarget: {
            target,
            ocamlBinaries: await (0, Utils_1.ocamlBinariesOfEnv)(),
            verificationBinaries
        }
    });
}));
commander_1.program.command('fstar')
    .argument('<args...>', "arguments to fstar.exe binary")
    .action(withCurrent(async ({ pkg, src, config, verificationBinaries }, ...args) => {
    let lib = pkg.lib;
    let ocamlBinaries = await (0, Utils_1.ocamlBinariesOfEnv)();
    let include = [...new Set([
            ...await (0, All_1.CollectCheckedOfLibrary)(config, Log_1.rootLogger)({
                lib, verificationBinaries, ocamlBinaries, excludeSelf: true
            }),
            ...await (0, All_1.CollectModulesOfLibrary)(config, Log_1.rootLogger)({
                lib
            }),
        ])];
    let cmxs_files = await (0, All_1.CollectPluginsOfLibrary)(config, Log_1.rootLogger)({ lib, verificationBinaries, ocamlBinaries, excludeSelf: true });
    (0, FStarCli_1.fstar)("Running F*")(Log_1.rootLogger)({
        bin: verificationBinaries, include,
        load_cmxs: await Promise.all(cmxs_files.map(Utils_1.resolveCmxsFilename))
    }, ...(0, Utils_1.verificationOptions_to_flags)(lib.verificationOptions), ...args);
}));
(async () => {
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
})();
//# sourceMappingURL=cli.js.map