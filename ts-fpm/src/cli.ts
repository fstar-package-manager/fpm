#!/usr/bin/env node

import * as types from "./../types/types"
import * as api from "./../types/api"

import { call, jsonCli } from "./endpoints"
import { program } from "commander"
import inquirer, { Question, QuestionCollection } from "inquirer"
import path from "path"
import { pathExists, readdir, readFile, stat, writeFile } from "fs-extra"
import { computeLibMetadata, Config, getUnresolvedPackageSet, getUnresolvedPackageSet_with_overrides, mkDefaultConfig, PACKAGE_FILE_NAME } from "./utils/Config"
import { mapResult, validators } from "./utils/Validation"
import { ResolvePackage, ResolvePackageSet } from "./package-level/ResolvePackageSet"
import { defaultLogger, ocamlBinariesOfEnv, resolveCmxsFilename, resolveVerificationBinariesWithEnv, verificationOptions_to_flags } from "./utils/Utils"
import { PluginOfLibrary, ExtractTarget, CollectCheckedOfLibrary, CollectModulesOfLibrary, CollectPluginsOfLibrary } from "./library-level/All"

import chalk from 'chalk'
import { fstar } from "./utils/FStarCli"
import { ErrorFPM } from "./utils/Exn"
import { depTree } from "./module-level/DepTree"
import { rootLogger } from "./utils/Log"

let getFiles = async (dir: string): Promise<string[]> =>
    (await Promise.all((await readdir(dir)).map(async (subdir: string): Promise<string[]> => {
        const res = path.resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : [res];
    }))).flat();

let log = defaultLogger.child({ module: "cli" });

program
    .name('fpm')
    .description('The F* Package Manager')
    .version('0.8.0');

let packageNameRegex = /^[0-9]*[a-z][a-z0-9]*(-[0-9]*[a-z][a-z0-9]*)*$/i

// Given a string that may not conform to [packageNameRegex],
// [suggestPackageName] crafts a conforming string or [undefined]
let suggestPackageName =
    (str: string): types.packageName | undefined => {
        let s = str.replace(/[^0-9a-z]+/i, '-');
        if (s.match(packageNameRegex) !== null)
            return s;
    }

let init_questions = () => [
    {
        name: 'name',
        message: 'Name:',
        default: suggestPackageName(path.basename(process.cwd()))
    },
    { name: 'license', message: 'License:', default: "none" },
    { name: 'author', message: 'Author:', default: "none" },
    { name: 'maintainer', message: 'Author:', default: "none" },
    { name: 'homepage', message: 'Homepage:', default: "none" },
    { name: 'synopsis', message: 'Synopsis:', default: "none" },
    { name: 'description', message: 'Description:', default: "none" }
];

program.command('init')
    .action(async () => {
        const root = process.cwd();
        const package_file_path = root + '/' + PACKAGE_FILE_NAME;
        if (await pathExists(package_file_path)) {
            log.error({ root, package_file_path }, `The file [${package_file_path}] exists already, aborting.`)
            process.exit(1);
        }

        let { name, ...opts } = await inquirer.prompt(init_questions());
        opts = Object.fromEntries(Object.entries(opts).filter(([_, v]) => v != 'none'));

        let lib: types.library["Unresolved"] = {
            dependencies: [],
            modules: (await getFiles(root))
                .filter(path => path.match(/[.]fsti?/))
                .map(path => path.slice(root.length + 1)),
            verificationOptions: {}
        }
        let pkg: types.packageT["Unresolved"] = { name, ...opts, lib };

        log.info(pkg, `The package definition to be written to ${PACKAGE_FILE_NAME} is:`);
        if ((await inquirer.prompt({ name: 'v', message: 'Save this?', type: 'confirm', default: true })).v) {
            await writeFile(package_file_path, JSON.stringify(pkg, null, 4));
            log.info(`Wrote file [${package_file_path}]!`);
        } else {
            log.error('Abort.')
            process.exit(1);
        }
    })

let loadPackage = async (): Promise<types.packageT["Unresolved"]> => {
    let contents;
    let cwd = process.cwd();
    let path = cwd + '/' + PACKAGE_FILE_NAME;
    try {
        contents = await readFile(path, 'utf8');
    } catch (e) {
        log.error({}, `Error: cannot read package file ${chalk.bold(path)}. Aborting.`);
        process.exit(1);
    }
    return mapResult(
        validators.packageT.Unresolved(JSON.parse(contents)),
        p => p,
        err => {
            log.error({}, `The package file ${chalk.bold(path)} is invalid. Aborting.`);
            log.error({}, `Validation error details:`);
            log.error(err);
            process.exit(1);
        }
    );
}

let withCurrent = <T>(f: (args: {
    src: string,
    config: Config,
    pkg: types.packageT["Resolved"],
    packageSet: types.packageSet["Resolved"],
    verificationBinaries: types.verificationBinaries["Resolved"]
}, ...rest: any[]) => Promise<T>) => async (...rest: any[]) => {
    let src = process.cwd();
    let config = await mkDefaultConfig();
    // TODO, remove [_with_overrides] below, and figure out something better
    let unresolved_ps = await getUnresolvedPackageSet_with_overrides(config);
    let pkg = await loadPackage();
    let packageSet = await ResolvePackageSet(config, rootLogger)({
        packageSet: unresolved_ps,
        packages: pkg.lib.dependencies
    });
    let rpkg = await ResolvePackage({ packageSet, pkg, src });
    let verificationBinaries = await resolveVerificationBinariesWithEnv(pkg.lib.verificationBinaries || {});
    return await f({
        src, config, packageSet, pkg: rpkg,
        verificationBinaries
    }, ...rest);
};

program.command('lock')
    .action(() => { throw Error("NOT IMPLEMENTED"); })

program.command('make')
    .action(withCurrent(async ({ pkg, config, verificationBinaries }) => {
        await call(config, rootLogger)({
            VerifyLibrary: {
                lib: pkg.lib,
                ocamlBinaries: await ocamlBinariesOfEnv(),
                verificationBinaries
            }
        });
        await call(config, rootLogger)({
            PluginOfLibrary: {
                lib: pkg.lib,
                ocamlBinaries: await ocamlBinariesOfEnv(),
                verificationBinaries
            }
        });
    }))

program.command('extract')
    .argument('<target>', 'target to extract')
    .action(withCurrent(async ({ pkg, src, config, verificationBinaries }, targetName: string) => {
        if (!pkg.extractions || !(targetName in pkg.extractions)) {
            console.error(`The extraction target "${chalk.bold(targetName)}" is not defined by the F* package file [${chalk.bold(src + '/' + PACKAGE_FILE_NAME)}].`);
            let targets = Object.keys(pkg.extractions || {});
            if (targets.length) {
                console.error(`The extraction targets available are:`);
                Object.entries(pkg.extractions || {}).map(([name, { opts }]) =>
                    ` - "${chalk.bold(name)}", that extracts in ${opts.lang}`
                ).join(';\n')
            }
            process.exit(1);
        }
        let target = (pkg.extractions || {})[targetName];
        call(config, rootLogger)({
            ExtractTarget: {
                target,
                ocamlBinaries: await ocamlBinariesOfEnv(),
                verificationBinaries
            }
        })
    }))

program.command('fstar')
    .argument('<args...>', "arguments to fstar.exe binary")
    .action(withCurrent(async ({ pkg, src, config, verificationBinaries }, ...args: string[]) => {
        let lib = pkg.lib;
        let ocamlBinaries = await ocamlBinariesOfEnv()
        let include: string[] = [...new Set([
            ...await CollectCheckedOfLibrary(config, rootLogger)({
                lib, verificationBinaries, ocamlBinaries, excludeSelf: true
            }),
            ...await CollectModulesOfLibrary(config, rootLogger)({
                lib
            }),
        ])];
        let cmxs_files = await CollectPluginsOfLibrary(config, rootLogger)({ lib, verificationBinaries, ocamlBinaries, excludeSelf: true });
        fstar("Running F*")(rootLogger)(
            {
                bin: verificationBinaries, include,
                load_cmxs: await Promise.all(cmxs_files.map(resolveCmxsFilename))
            },
            ...verificationOptions_to_flags(lib.verificationOptions),
            ...args
        );
    }));


(async () => {
    try {
        program.parse();
    } catch (e) {
        if (e instanceof ErrorFPM) {
            console.error(chalk.red("Error:"));
            console.error(e.message);
        } else {
            throw e;
        }
    }
})();

