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
exports.CmxsOfModules = void 0;
const ExtractModules_1 = require("./ExtractModules");
const OCamlCmxsBuilder_1 = require("./OCamlCmxsBuilder");
let CmxsOfModules = ({ verificationBinaries, includePaths, modules, ocamlBinaries, cmxsName }) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, OCamlCmxsBuilder_1.OCamlCmxsBuilder)({
        ocamlBinaries, ocamlPackages: [],
        extractionProduct: yield (0, ExtractModules_1.ExtractModules)({
            verificationBinaries,
            includePaths,
            modules,
            extractionOptions: { lang: "Plugin" }
        }),
        cmxsName
    });
});
exports.CmxsOfModules = CmxsOfModules;
//# sourceMappingURL=CmxsOfModules.js.map