"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validators = exports.mapResult = exports.isResult = void 0;
const types_schema_json_1 = __importDefault(require("../../types/types-schema.json"));
const ajv_1 = __importDefault(require("ajv"));
const ajv = new ajv_1.default();
ajv.addSchema(types_schema_json_1.default);
function isResult(v) {
    return 'result' in v;
}
exports.isResult = isResult;
function mapResult(v, f, g) {
    return isResult(v) ? f(v.result) : g(v.errors);
}
exports.mapResult = mapResult;
// packageT/properties/Unresolved
function validate(path) {
    return (json) => {
        let validate = ajv.getSchema('#/definitions/' + path);
        if (!validate) {
            console.error(`[validate] Could not find schema [${path}], root of the schema being:`);
            console.error(ajv.getSchema('#'));
            process.exit(1); // hard failure
        }
        if (!validate(json))
            return { errors: validate.errors || [] };
        return { result: json };
    };
}
// type apiAll = UnionToIntersection<api.api>
// type apiValidators = { [key in keyof apiAll]: (json: object) => Result<apiAll[key]["inputT"], AjvError> }
// let av: apiValidators = {
//     CmxsFilesOfLibrary: validate("TODO"),
//     CmxsOfLibrary: validate("TODO"),
//     ExtractModules: validate("TODO"),
//     ExtractTarget: validate("TODO"),
//     IncludePathsOfLibrary: validate("TODO"),
//     OCamlCmxsBuilder: validate("TODO"),
//     ResolveBinaries: validate("TODO"),
//     ResolvePackageSet: validate("TODO"),
//     VerifyLibrary: validate("TODO"),
//     VerifyModules: validate("TODO")
// }
exports.validators = {
    packageT: {
        Unresolved: validate("packageT/properties/Unresolved"),
        Resolved: validate("packageT/properties/Resolved")
    },
    library: {
        Unresolved: validate("library/properties/Unresolved"),
        Resolved: validate("library/properties/Resolved")
    },
    // TODO: type system of TypeScript can probably compute [api.api_inputs] out of [api.api]
    api: validate("api_inputs")
};
// let pathOfApiInputT = (name: string) =>
//     `${schemaDefinition.definitions.api.anyOf.findIndex(o => name in o.properties)}`
//# sourceMappingURL=Validation.js.map