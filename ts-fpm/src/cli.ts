#!/usr/bin/env node

import * as types from "./../types/types"
import * as api from "./../types/api"

import { call, jsonCli } from "./endpoints"
import { program } from "commander"
import inquirer, { Question, QuestionCollection } from "inquirer"
import path from "path"
import { pathExists, readdir, readFile, stat, writeFile } from "fs-extra"
import { computeLibMetadata, Config, getUnresolvedPackageSet, mkDefaultConfig, PACKAGE_FILE_NAME } from "./utils/Config"
import { mapResult, validators } from "./utils/Validation"
import { ResolvePackage, ResolvePackageSet } from "./package-level/ResolvePackageSet"
import { ocamlBinariesOfEnv, resolveVerificationBinariesWithEnv, verificationOptions_to_flags } from "./utils/Utils"
import { CmxsOfLibrary, ExtractTarget, IncludePathsOfLibrary_excludingSelf } from "./library-level/All"

import chalk from 'chalk'
import { fstar } from "./utils/FStarCli"

let getFiles = async (dir: string): Promise<string[]> =>
    (await Promise.all((await readdir(dir)).map(async (subdir: string): Promise<string[]> => {
        const res = path.resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : [res];
    }))).flat();

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
        let root = process.cwd();
        if (await pathExists(root + '/' + PACKAGE_FILE_NAME)) {
            console.error(`The file [${root + '/' + PACKAGE_FILE_NAME}] exists already, aborting.`)
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

        console.log(`The package definition to be written to ${PACKAGE_FILE_NAME} is:`);
        console.log(pkg);
        if ((await inquirer.prompt({ name: 'v', message: 'Save this?', type: 'confirm', default: true })).v) {
            await writeFile(root + '/' + PACKAGE_FILE_NAME, JSON.stringify(pkg, null, 4));
            console.log(`Wrote file [${root + '/' + PACKAGE_FILE_NAME}]!`);
        } else {
            console.log('Abort.')
            process.exit(1);
        }
    })

let loadPackage = async (): Promise<types.packageT["Unresolved"]> =>
    mapResult(
        validators.packageT.Unresolved(JSON.parse(await readFile(PACKAGE_FILE_NAME, 'utf8'))),
        p => p,
        err => { throw "TODO ERROR: BAD FSTAR.JSON" }
    )

let withCurrent = <T>(f: (args: {
    src: string,
    config: Config,
    pkg: types.packageT["Resolved"],
    packageSet: types.packageSet["Resolved"],
    verificationBinaries: types.verificationBinaries["Resolved"]
}, ...rest: any[]) => Promise<T>) => async (...rest: any[]) => {
    let src = process.cwd();
    let config = mkDefaultConfig();
    let unresolved_ps = await getUnresolvedPackageSet(config);
    let pkg = await loadPackage();
    let packageSet = await ResolvePackageSet(config)({
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
        console.log("XXXXXXXXXXXXXXXXXXX", config);
        call(config)({
            VerifyLibrary: {
                lib: pkg.lib,
                ocamlBinaries: await ocamlBinariesOfEnv(),
                verificationBinaries
            }
        })
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
        call(config)({
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
            ...await IncludePathsOfLibrary_excludingSelf(config)({
                lib, verificationBinaries, ocamlBinaries
            }),
            ...pkg.lib.modules.map(path.dirname)
        ])];
        let cmxs_files = await Promise.all(lib.dependencies.map(lib =>
            CmxsOfLibrary(config)({ lib, ocamlBinaries, verificationBinaries })
        ));
        fstar(
            {
                bin: verificationBinaries,
                include, load_cmxs: cmxs_files.map(p => path.basename(p))
            },
            ...verificationOptions_to_flags(lib.verificationOptions),
            ...args
        );
    }));


(async () => {
    // TODO catch and pretty print expections here
    // try {
    program.parse();
    // } catch (e) {
    //     if (e instanceof BinaryResolutionError)
    //         console.log(e);
    //     console.log('ERROR WAS CATCHED!');
    // }
})();

