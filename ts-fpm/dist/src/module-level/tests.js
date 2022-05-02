"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// void (async function() {
//     let modules = ["A.fst", "B.fst", "C.fst", "II.fst", "II.fsti", "OO.fst", "OO.fsti"];
//     let checked_files = await VerifyModules({
//         includePaths: ["/tmp/TestCMXS"],
//         modules,
//         plugins: [],
//         verificationBinaries: ({ fstar_binary: "fstar.exe", z3_binary: "z3.exe" } as any),
//         verificationOptions: {
//             unsafe_tactic_exec: true
//         }
//     });
// 
//     let extracted = await ExtractModules({
//         verificationBinaries: ({ fstar_binary: "fstar.exe", z3_binary: "z3.exe" } as any),
//         includePaths: ["/tmp/TestCMXS", checked_files],
//         modules,
//         extractionOptions: {
//             lang: "Plugin"
//         }
//     });
// 
//     let ocaml_package = await OCamlCmxsBuilder(
//         {
//             ocamlBinaries: {
//                 OCAMLPATH: "/nix/store/jp8a45cjnlcq819smqn0c3lxwv5ldf06-ocaml4.12.0-cppo-1.6.7/lib/ocaml/4.12.0/site-lib/:/nix/store/d77wz8chmpv1qcz36ryyq3k7mz59bbwr-fstar-3991ca2f533fc626431d2eddcd25384db4d0bb68/lib/ocaml/4.12.0/site-lib/:/nix/store/dnjlznd7gpacqfi6mgihr9af9g1jwlp8-ocamlbuild-0.14.0/lib/ocaml/4.12.0/site-lib/:/nix/store/vj9mvmz703ngm2gwh74mgnp8f63lp3is-ocaml-findlib-1.9.1/lib/ocaml/4.12.0/site-lib/:/nix/store/aha58pxglcgwkw9j8cib8n0ibl9a1in1-ocaml4.12.0-batteries-3.3.0/lib/ocaml/4.12.0/site-lib/:/nix/store/jqqg0is91pag9ya0vy5xh1ks55hy7139-ocaml4.12.0-num-1.1/lib/ocaml/4.12.0/site-lib/:/nix/store/dcf56hhjgqi15rq733dq5c0r17w4yb9f-ocaml4.12.0-stdint-0.7.0/lib/ocaml/4.12.0/site-lib/:/nix/store/43z3yx51b6h3ziv9q0mbk44hk2ixjrr3-ocaml4.12.0-zarith-1.12/lib/ocaml/4.12.0/site-lib/:/nix/store/0av5fk2kz83v1m6yyrlv4r14z4y4wzv4-ocaml4.12.0-yojson-1.7.0/lib/ocaml/4.12.0/site-lib/:/nix/store/rx26zj28nw1qxk02g1h354plbfr5q89c-easy-format-1.2.0/lib/ocaml/4.12.0/site-lib/:/nix/store/f2cyl3p2dafgvh82z3w48dv86rzfsnbf-ocaml4.12.0-biniou-1.2.1/lib/ocaml/4.12.0/site-lib/:/nix/store/5knw6rnn1w2m8kd4nniffhaz4ak84y49-ocaml4.12.0-fileutils-0.5.3/lib/ocaml/4.12.0/site-lib/:/nix/store/l7c1hgzfci6nanydsrbvi207r4i72qzj-ocaml4.12.0-pprint-20171003/lib/ocaml/4.12.0/site-lib/:/nix/store/bcqnhx6jp8034x00msx683y3h3s6ri24-menhir-20190626/lib/ocaml/4.12.0/site-lib/:/nix/store/3s7ckwzawbj85ls7v50bbkm2j9vwvjbh-ocaml4.12.0-ppx_deriving-5.2.1/lib/ocaml/4.12.0/site-lib/:/nix/store/42f4hjbq1qjhff12z698lgni4yykzh2g-ocaml4.12.0-ocaml-migrate-parsetree-2.1.0/lib/ocaml/4.12.0/site-lib/:/nix/store/8p3lfndhnf0xm7c7ylinq61pgdkg8kvd-ocaml4.12.0-ppx_derivers-1.2.1/lib/ocaml/4.12.0/site-lib/:/nix/store/1mxzak9cbni1pncy5ps49fdqdss83bja-ocaml4.12.0-result-1.5/lib/ocaml/4.12.0/site-lib/:/nix/store/n582x8x8sgm87gw2bqb3hcfczvglhk32-ocaml4.12.0-ppx_deriving_yojson-3.6.1/lib/ocaml/4.12.0/site-lib/:/nix/store/l6rnzd2kb7lmsnp7mwqh0hip5md78lbs-ocaml4.12.0-ppxlib-0.22.0/lib/ocaml/4.12.0/site-lib/:/nix/store/a45qd1nbj8srg0jnn4ls6qvsc3klw76v-ocaml4.12.0-ocaml-compiler-libs-0.12.3/lib/ocaml/4.12.0/site-lib/:/nix/store/jhx0fbfcjm3xhl1m9bb9ahwxwqj62ckp-ocaml4.12.0-stdio-0.14.0/lib/ocaml/4.12.0/site-lib/:/nix/store/wpq85wg0x5k21r3yp6ph55pagas3zmpd-ocaml4.12.0-base-0.14.1/lib/ocaml/4.12.0/site-lib/:/nix/store/qrxlm48c85bwrngxqhms6rqj9pdw1yq1-ocaml4.12.0-sexplib0-0.14.0/lib/ocaml/4.12.0/site-lib/:/nix/store/pbpgpqy291vlz1h2k9g2c1hr10kkgc1f-ocaml4.12.0-stdlib-shims-0.3.0/lib/ocaml/4.12.0/site-lib/:/nix/store/pp0z20wli55jkx85mdfqabm289fvjfi0-ocaml4.12.0-process-0.2.1/lib/ocaml/4.12.0/site-lib/:/nix/store/vi9pymc4fbv8jvcnqnmkfw086g9lmihw-ocaml4.12.0-ocaml-migrate-parsetree-1.8.0/lib/ocaml/4.12.0/site-lib/:/nix/store/sf51ykf7m16bzw9j70yb01zi2d4sw1lz-ocaml4.12.0-sedlex-2.3/lib/ocaml/4.12.0/site-lib/:/nix/store/0sfmlwpk7gpcyywq19w9dpkyz7dvm317-ocaml4.12.0-gen-0.5/lib/ocaml/4.12.0/site-lib/:/nix/store/d6mc6sb3r8ksknvkpzzm7y1kb7da2hwg-ocaml4.12.0-uchar-0.0.2/lib/ocaml/4.12.0/site-lib/",
//                 ocamlbin: "/nix/store/ivcr92afi8am4fcpdk88djc1lqkll0ch-ocaml-4.12.0/bin/",
//                 gcc: "/nix/store/jz10kjr0lnhynwxnrzv4kcwbjs5s0ri8-gcc-wrapper-10.3.0/bin/gcc",
//                 ocamlbuild: "/nix/store/dnjlznd7gpacqfi6mgihr9af9g1jwlp8-ocamlbuild-0.14.0/bin/ocamlbuild",
//                 ocamlfind: "/nix/store/vj9mvmz703ngm2gwh74mgnp8f63lp3is-ocaml-findlib-1.9.1/bin/ocamlfind",
//             },
//             ocamlPackages: [],
//             extractionProduct: extracted,
//             cmxsName: "plugin-name"
//         }
//     );
//     console.log({
//         checked_files,
//         extracted,
//         ocaml_package
//     });
// })();
//# sourceMappingURL=tests.js.map