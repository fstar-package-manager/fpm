"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyModulesError = exports.PackageSetResolutionError = exports.BinaryResolutionError = exports.ErrorFPM = void 0;
const chalk_1 = __importDefault(require("chalk"));
const string_similarity_1 = require("string-similarity");
const Config_1 = require("./Config");
class ErrorFPM extends Error {
    constructor() {
        super();
    }
}
exports.ErrorFPM = ErrorFPM;
class BinaryResolutionError extends ErrorFPM {
    constructor(cause) {
        super();
        this.cause = cause;
    }
    get message() {
        return (this.cause.kind == 'missingBinary'
            ? `The binary [${chalk_1.default.bold(this.cause.binName)}] was not found`
            : `The environement variable [${this.cause.varName}] was not found`) + ` during the phase ${chalk_1.default.bold(this.cause.caller)}.`;
    }
}
exports.BinaryResolutionError = BinaryResolutionError;
class PackageSetResolutionError extends ErrorFPM {
    constructor(cause) {
        super();
        this.cause = cause;
    }
    get message() {
        let { packageSet, packages } = this.cause;
        if (this.cause.kind == 'packageNotFound') {
            let names = Object.keys(packageSet).sort();
            let pkgs_ellipsis = chalk_1.default.gray(`{`) +
                (names.length
                    ? (names.length >= 10
                        ? names.slice(0, 3).join(chalk_1.default.gray(',')) + chalk_1.default.gray('…')
                            + names.slice(-3).join(chalk_1.default.gray(','))
                        : names.join(chalk_1.default.gray(',')))
                    : chalk_1.default.red(' empty! ')) + chalk_1.default.gray(`}`);
            let msg = `The package ${chalk_1.default.bold(this.cause.pkgName)} was not found in the package set ${pkgs_ellipsis} while resolving packages ${chalk_1.default.gray(packages.join(' '))}.`;
            if (names.length) {
                let close = (0, string_similarity_1.findBestMatch)(this.cause.pkgName, names);
                if (close.bestMatch)
                    msg += `
(Did you mean ${chalk_1.default.bold(close.bestMatch.target)}?)`;
            }
            return msg;
        }
        else {
            return `The ${chalk_1.default.bold(Config_1.PACKAGE_FILE_NAME)} file of package ${chalk_1.default.bold(this.cause.pkgName)} (found at ${chalk_1.default.gray(JSON.stringify(this.cause.gitRef))}) is not correct.
Validation error details:
${this.cause.validationError}`;
        }
    }
}
exports.PackageSetResolutionError = PackageSetResolutionError;
class VerifyModulesError extends ErrorFPM {
    constructor(cause) {
        super();
        this.cause = cause;
    }
    get message() {
        if (this.cause.kind == 'duplicatedModules') {
            // let duplicated = this.cause.duplicated;
            let duplicated = [...this.cause.duplicated.entries()];
            if (this.cause.duplicated.size == 1) {
                let [[mod, paths]] = duplicated;
                let lpaths = [...paths];
                return `While verifying, the module ${chalk_1.default.bold(mod)} was found to be duplicated ${chalk_1.default.bold(lpaths.length)} times in the include paths, at the following locations:
${lpaths.map(path => " - " + chalk_1.default.bold(path)).join(";\n")}.`;
            }
            else {
                return `While verifying, the following modules were found to be duplicated in the include paths:
` + duplicated.map(([mod, paths]) => ` - module ${chalk_1.default.bold(mod)}:
${[...paths].map(path => "   + " + chalk_1.default.bold(path)).join(",\n")}`).join(';\n');
            }
        }
        else {
            return `While verifying, the include path ${chalk_1.default.bold(this.cause.path)} was not found.`;
        }
    }
}
exports.VerifyModulesError = VerifyModulesError;
//# sourceMappingURL=Exn.js.map