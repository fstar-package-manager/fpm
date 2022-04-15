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
exports.fstar = void 0;
const Utils_1 = require("./Utils");
let fstar = ({ bin, include, load_cmxs, quiet }, ...rest) => __awaiter(void 0, void 0, void 0, function* () {
    let mkFlag = (flag, value) => [`--${flag}`, value];
    let mkFlags = (flag, values = []) => values.map(value => mkFlag(flag, value)).flat();
    let flags = [
        ...mkFlags("include", include),
        ...mkFlags("load_cmxs", load_cmxs),
        // TODO respect !bin.z3
        ...(rest || [])
    ];
    console.log([bin.fstar_binary, ...flags].join(' '));
    return yield (0, Utils_1.execFile)(bin.fstar_binary, flags, {}, quiet);
});
exports.fstar = fstar;
//# sourceMappingURL=FStarCli.js.map