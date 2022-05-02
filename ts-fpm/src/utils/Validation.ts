import * as types from "../../types/types"
import * as api from "../../types/api"
import schemaDefinition from '../../types/types-schema.json';
import { UnionToIntersection } from './Utils';
import Ajv, { ErrorObject } from "ajv"

export type AjvError = ErrorObject[]

const ajv = new Ajv();
ajv.addSchema(schemaDefinition);

type Result<T, E> = { result: T } | { errors: E }

export function isResult<T, E>(v: Result<T, E>): v is ({ result: T }) {
    return 'result' in v;
}

export function mapResult<T, E, R>(v: Result<T, E>, f: (v: T) => R, g: (e: E) => R): R {
    return isResult(v) ? f(v.result) : g(v.errors);
}

// packageT/properties/Unresolved
function validate<T>(path: string) {
    return (json: object): Result<T, AjvError> => {
        let validate = ajv.getSchema('#/definitions/' + path);
        if (!validate) {
            console.error(`[validate] Could not find schema [${path}], root of the schema being:`);
            console.error(ajv.getSchema('#'));
            process.exit(1); // hard failure
        }
        if (!validate(json))
            return { errors: validate.errors || [] };
        return { result: json as unknown as T };
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

export let validators = {
    packageT: {
        Unresolved: validate<types.packageT["Unresolved"]>("packageT/properties/Unresolved"),
        Resolved: validate<types.packageT["Resolved"]>("packageT/properties/Resolved")
    },
    library: {
        Unresolved: validate<types.library["Unresolved"]>("library/properties/Unresolved"),
        Resolved: validate<types.library["Resolved"]>("library/properties/Resolved")
    },
    // TODO: type system of TypeScript can probably compute [api.api_inputs] out of [api.api]
    api: validate<api.api_inputs>("api_inputs")
}

// let pathOfApiInputT = (name: string) =>
//     `${schemaDefinition.definitions.api.anyOf.findIndex(o => name in o.properties)}`

