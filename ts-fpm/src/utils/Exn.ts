import chalk from 'chalk';
import { absolutePath } from '../../types/types';
import * as types from './../../types/types'
import { AjvError } from './Validation';
import { findBestMatch } from 'string-similarity'
import { file } from 'tmp-promise';
import { writeFile } from 'fs-extra';
import { PACKAGE_FILE_NAME } from './Config';


export class ErrorFPM extends Error {
    constructor() {
        super();
    }
}


export class BinaryResolutionError extends ErrorFPM {
    constructor(public cause: (
        { kind: 'envVarNotFound', varName: string, env: NodeJS.ProcessEnv, caller: string } |
        { kind: 'missingBinary', binName: string, path: string, caller: string, details: unknown }
    )) {
        super();
    }
    get message() {
        return (this.cause.kind == 'missingBinary'
            ? `The binary [${chalk.bold(this.cause.binName)}] was not found`
            : `The environement variable [${this.cause.varName}] was not found`
        ) + ` during the phase ${chalk.bold(this.cause.caller)}.`;
    }
}

export class PackageSetResolutionError extends ErrorFPM {
    constructor(public cause: (
        {
            packageSet: types.packageSet["Unresolved"],
            packages: string[]
        } & (
            { kind: 'packageNotFound', pkgName: string } |
            { kind: 'jsonValidationFailure', validationError: AjvError, gitRef: types.gitReference, pkgName: string }
        )
    )) {
        super();
    }
    get message() {
        let { packageSet, packages } = this.cause;
        if (this.cause.kind == 'packageNotFound') {
            let names = Object.keys(packageSet).sort();
            let pkgs_ellipsis = chalk.gray(`{`) +
                (names.length
                    ? (names.length >= 10
                        ? names.slice(0, 3).join(chalk.gray(',')) + chalk.gray('…')
                        + names.slice(-3).join(chalk.gray(','))
                        : names.join(chalk.gray(','))
                    )
                    : chalk.red(' empty! ')
                ) + chalk.gray(`}`);
            let msg = `The package ${chalk.bold(this.cause.pkgName)} was not found in the package set ${pkgs_ellipsis} while resolving packages ${chalk.gray(packages.join(' '))}.`;
            if (names.length) {
                let close = findBestMatch(this.cause.pkgName, names);
                if (close.bestMatch)
                    msg += `
(Did you mean ${chalk.bold(close.bestMatch.target)}?)`
            }
            return msg;
        } else {
            return `The ${chalk.bold(PACKAGE_FILE_NAME)} file of package ${chalk.bold(this.cause.pkgName)} (found at ${chalk.gray(JSON.stringify(this.cause.gitRef))}) is not correct.
Validation error details:
${this.cause.validationError}`;
        }
    }
}

export class VerifyModulesError extends ErrorFPM {
    constructor(public cause: (
        { kind: 'duplicatedModules', duplicated: Map<string, Set<absolutePath>> } |
        { kind: 'includePathNotFound', path: absolutePath }
    )) {
        super();
    }
    get message() {
        if (this.cause.kind == 'duplicatedModules') {
            // let duplicated = this.cause.duplicated;
            let duplicated = [...this.cause.duplicated.entries()];
            if (this.cause.duplicated.size == 1) {
                let [[mod, paths]] = duplicated;
                let lpaths = [...paths];
                return `While verifying, the module ${chalk.bold(mod)} was found to be duplicated ${chalk.bold(lpaths.length)} times in the include paths, at the following locations:
${lpaths.map(path => " - " + chalk.bold(path)).join(";\n")}.`;
            } else {
                return `While verifying, the following modules were found to be duplicated in the include paths:
`+ duplicated.map(([mod, paths]) => ` - module ${chalk.bold(mod)}:
${[...paths].map(path => "   + " + chalk.bold(path)).join(",\n")}`).join(';\n');
            }
        } else {
            return `While verifying, the include path ${chalk.bold(this.cause.path)} was not found.`;
        }
    }
}
