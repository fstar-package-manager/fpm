# This file has been generated by node2nix 1.9.0. Do not edit!

{nodeEnv, fetchurl, fetchgit, nix-gitignore, stdenv, lib, globalBuildInputs ? []}:

let
  sources = {
    "@kwsites/file-exists-1.1.1" = {
      name = "_at_kwsites_slash_file-exists";
      packageName = "@kwsites/file-exists";
      version = "1.1.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/@kwsites/file-exists/-/file-exists-1.1.1.tgz";
        sha512 = "m9/5YGR18lIwxSFDwfE3oA7bWuq9kdau6ugN4H2rJeyhFQZcG9AgSHkQtSD15a8WvTgfz9aikZMrKPHvbpqFiw==";
      };
    };
    "@kwsites/promise-deferred-1.1.1" = {
      name = "_at_kwsites_slash_promise-deferred";
      packageName = "@kwsites/promise-deferred";
      version = "1.1.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/@kwsites/promise-deferred/-/promise-deferred-1.1.1.tgz";
        sha512 = "GaHYm+c0O9MjZRu0ongGBRbinu8gVAMd2UZjji6jVmqKtZluZnptXGWhz1E8j8D2HJ3f/yMxKAUC0b+57wncIw==";
      };
    };
    "ajv-8.11.0" = {
      name = "ajv";
      packageName = "ajv";
      version = "8.11.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/ajv/-/ajv-8.11.0.tgz";
        sha512 = "wGgprdCvMalC0BztXvitD2hC04YffAvtsUn93JbGXYLAtCUO4xd17mCCZQxUOItiBwZvJScWo8NIvQMQ71rdpg==";
      };
    };
    "ansi-escapes-4.3.2" = {
      name = "ansi-escapes";
      packageName = "ansi-escapes";
      version = "4.3.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/ansi-escapes/-/ansi-escapes-4.3.2.tgz";
        sha512 = "gKXj5ALrKWQLsYG9jlTRmR/xKluxHV+Z9QEwNIgCfM1/uwPMCuzVVnh5mwTd+OuBZcwSIMbqssNWRm1lE51QaQ==";
      };
    };
    "ansi-regex-5.0.1" = {
      name = "ansi-regex";
      packageName = "ansi-regex";
      version = "5.0.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz";
        sha512 = "quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==";
      };
    };
    "ansi-styles-4.3.0" = {
      name = "ansi-styles";
      packageName = "ansi-styles";
      version = "4.3.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz";
        sha512 = "zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==";
      };
    };
    "balanced-match-1.0.2" = {
      name = "balanced-match";
      packageName = "balanced-match";
      version = "1.0.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz";
        sha512 = "3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==";
      };
    };
    "base64-js-1.5.1" = {
      name = "base64-js";
      packageName = "base64-js";
      version = "1.5.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/base64-js/-/base64-js-1.5.1.tgz";
        sha512 = "AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==";
      };
    };
    "bl-4.1.0" = {
      name = "bl";
      packageName = "bl";
      version = "4.1.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/bl/-/bl-4.1.0.tgz";
        sha512 = "1W07cM9gS6DcLperZfFSj+bWLtaPGSOHWhPiGzXmvVJbRLdG82sH/Kn8EtW1VqWVA54AKf2h5k5BbnIbwF3h6w==";
      };
    };
    "brace-expansion-1.1.11" = {
      name = "brace-expansion";
      packageName = "brace-expansion";
      version = "1.1.11";
      src = fetchurl {
        url = "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.11.tgz";
        sha512 = "iCuPHDFgrHX7H2vEI/5xpz07zSHB00TpugqhmYtVmMO6518mCuRMoOYFldEBl0g187ufozdaHgWKcYFb61qGiA==";
      };
    };
    "buffer-5.7.1" = {
      name = "buffer";
      packageName = "buffer";
      version = "5.7.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/buffer/-/buffer-5.7.1.tgz";
        sha512 = "EHcyIPBQ4BSGlvjB16k5KgAJ27CIsHY/2JBmCRReo48y9rQ3MaUzWX3KVlBa4U7MyX02HdVj0K7C3WaB3ju7FQ==";
      };
    };
    "chalk-4.1.2" = {
      name = "chalk";
      packageName = "chalk";
      version = "4.1.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/chalk/-/chalk-4.1.2.tgz";
        sha512 = "oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==";
      };
    };
    "chardet-0.7.0" = {
      name = "chardet";
      packageName = "chardet";
      version = "0.7.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/chardet/-/chardet-0.7.0.tgz";
        sha512 = "mT8iDcrh03qDGRRmoA2hmBJnxpllMR+0/0qlzjqZES6NdiWDcZkCNAk4rPFZ9Q85r27unkiNNg8ZOiwZXBHwcA==";
      };
    };
    "cli-cursor-3.1.0" = {
      name = "cli-cursor";
      packageName = "cli-cursor";
      version = "3.1.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/cli-cursor/-/cli-cursor-3.1.0.tgz";
        sha512 = "I/zHAwsKf9FqGoXM4WWRACob9+SNukZTd94DWF57E4toouRulbCxcUh6RKUEOQlYTHJnzkPMySvPNaaSLNfLZw==";
      };
    };
    "cli-spinners-2.6.1" = {
      name = "cli-spinners";
      packageName = "cli-spinners";
      version = "2.6.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/cli-spinners/-/cli-spinners-2.6.1.tgz";
        sha512 = "x/5fWmGMnbKQAaNwN+UZlV79qBLM9JFnJuJ03gIi5whrob0xV0ofNVHy9DhwGdsMJQc2OKv0oGmLzvaqvAVv+g==";
      };
    };
    "cli-width-3.0.0" = {
      name = "cli-width";
      packageName = "cli-width";
      version = "3.0.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/cli-width/-/cli-width-3.0.0.tgz";
        sha512 = "FxqpkPPwu1HjuN93Omfm4h8uIanXofW0RxVEW3k5RKx+mJJYSthzNhp32Kzxxy3YAEZ/Dc/EWN1vZRY0+kOhbw==";
      };
    };
    "clone-1.0.4" = {
      name = "clone";
      packageName = "clone";
      version = "1.0.4";
      src = fetchurl {
        url = "https://registry.npmjs.org/clone/-/clone-1.0.4.tgz";
        sha1 = "da309cc263df15994c688ca902179ca3c7cd7c7e";
      };
    };
    "color-convert-2.0.1" = {
      name = "color-convert";
      packageName = "color-convert";
      version = "2.0.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz";
        sha512 = "RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==";
      };
    };
    "color-name-1.1.4" = {
      name = "color-name";
      packageName = "color-name";
      version = "1.1.4";
      src = fetchurl {
        url = "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz";
        sha512 = "dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==";
      };
    };
    "commander-9.1.0" = {
      name = "commander";
      packageName = "commander";
      version = "9.1.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/commander/-/commander-9.1.0.tgz";
        sha512 = "i0/MaqBtdbnJ4XQs4Pmyb+oFQl+q0lsAmokVUH92SlSw4fkeAcG3bVon+Qt7hmtF+u3Het6o4VgrcY3qAoEB6w==";
      };
    };
    "concat-map-0.0.1" = {
      name = "concat-map";
      packageName = "concat-map";
      version = "0.0.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz";
        sha1 = "d8a96bd77fd68df7793a73036a3ba0d5405d477b";
      };
    };
    "debug-4.3.4" = {
      name = "debug";
      packageName = "debug";
      version = "4.3.4";
      src = fetchurl {
        url = "https://registry.npmjs.org/debug/-/debug-4.3.4.tgz";
        sha512 = "PRWFHuSU3eDtQJPvnNY7Jcket1j0t5OuOsFzPPzsekD52Zl8qUfFIPEiswXqIvHWGVHOgX+7G/vCNNhehwxfkQ==";
      };
    };
    "defaults-1.0.3" = {
      name = "defaults";
      packageName = "defaults";
      version = "1.0.3";
      src = fetchurl {
        url = "https://registry.npmjs.org/defaults/-/defaults-1.0.3.tgz";
        sha1 = "c656051e9817d9ff08ed881477f3fe4019f3ef7d";
      };
    };
    "emoji-regex-8.0.0" = {
      name = "emoji-regex";
      packageName = "emoji-regex";
      version = "8.0.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz";
        sha512 = "MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==";
      };
    };
    "escape-string-regexp-1.0.5" = {
      name = "escape-string-regexp";
      packageName = "escape-string-regexp";
      version = "1.0.5";
      src = fetchurl {
        url = "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-1.0.5.tgz";
        sha1 = "1b61c0562190a8dff6ae3bb2cf0200ca130b86d4";
      };
    };
    "external-editor-3.1.0" = {
      name = "external-editor";
      packageName = "external-editor";
      version = "3.1.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/external-editor/-/external-editor-3.1.0.tgz";
        sha512 = "hMQ4CX1p1izmuLYyZqLMO/qGNw10wSv9QDCPfzXfyFrOaCSSoRfqE1Kf1s5an66J5JZC62NewG+mK49jOCtQew==";
      };
    };
    "fast-deep-equal-3.1.3" = {
      name = "fast-deep-equal";
      packageName = "fast-deep-equal";
      version = "3.1.3";
      src = fetchurl {
        url = "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz";
        sha512 = "f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==";
      };
    };
    "figures-3.2.0" = {
      name = "figures";
      packageName = "figures";
      version = "3.2.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/figures/-/figures-3.2.0.tgz";
        sha512 = "yaduQFRKLXYOGgEn6AZau90j3ggSOyiqXU0F9JZfeXYhNa+Jk4X+s45A2zg5jns87GAFa34BBm2kXw4XpNcbdg==";
      };
    };
    "fs-extra-10.0.1" = {
      name = "fs-extra";
      packageName = "fs-extra";
      version = "10.0.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/fs-extra/-/fs-extra-10.0.1.tgz";
        sha512 = "NbdoVMZso2Lsrn/QwLXOy6rm0ufY2zEOKCDzJR/0kBsb0E6qed0P3iYK+Ath3BfvXEeu4JhEtXLgILx5psUfag==";
      };
    };
    "fs.realpath-1.0.0" = {
      name = "fs.realpath";
      packageName = "fs.realpath";
      version = "1.0.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/fs.realpath/-/fs.realpath-1.0.0.tgz";
        sha1 = "1504ad2523158caa40db4a2787cb01411994ea4f";
      };
    };
    "glob-7.2.0" = {
      name = "glob";
      packageName = "glob";
      version = "7.2.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/glob/-/glob-7.2.0.tgz";
        sha512 = "lmLf6gtyrPq8tTjSmrO94wBeQbFR3HbLHbuyD69wuyQkImp2hWqMGB47OX65FBkPffO641IP9jWa1z4ivqG26Q==";
      };
    };
    "graceful-fs-4.2.10" = {
      name = "graceful-fs";
      packageName = "graceful-fs";
      version = "4.2.10";
      src = fetchurl {
        url = "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.10.tgz";
        sha512 = "9ByhssR2fPVsNZj478qUUbKfmL0+t5BDVyjShtyZZLiK7ZDAArFFfopyOTj0M05wE2tJPisA4iTnnXl2YoPvOA==";
      };
    };
    "has-flag-4.0.0" = {
      name = "has-flag";
      packageName = "has-flag";
      version = "4.0.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz";
        sha512 = "EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==";
      };
    };
    "iconv-lite-0.4.24" = {
      name = "iconv-lite";
      packageName = "iconv-lite";
      version = "0.4.24";
      src = fetchurl {
        url = "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.4.24.tgz";
        sha512 = "v3MXnZAcvnywkTUEZomIActle7RXXeedOR31wwl7VlyoXO4Qi9arvSenNQWne1TcRwhCL1HwLI21bEqdpj8/rA==";
      };
    };
    "ieee754-1.2.1" = {
      name = "ieee754";
      packageName = "ieee754";
      version = "1.2.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/ieee754/-/ieee754-1.2.1.tgz";
        sha512 = "dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA==";
      };
    };
    "inflight-1.0.6" = {
      name = "inflight";
      packageName = "inflight";
      version = "1.0.6";
      src = fetchurl {
        url = "https://registry.npmjs.org/inflight/-/inflight-1.0.6.tgz";
        sha1 = "49bd6331d7d02d0c09bc910a1075ba8165b56df9";
      };
    };
    "inherits-2.0.4" = {
      name = "inherits";
      packageName = "inherits";
      version = "2.0.4";
      src = fetchurl {
        url = "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz";
        sha512 = "k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==";
      };
    };
    "inquirer-8.2.2" = {
      name = "inquirer";
      packageName = "inquirer";
      version = "8.2.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/inquirer/-/inquirer-8.2.2.tgz";
        sha512 = "pG7I/si6K/0X7p1qU+rfWnpTE1UIkTONN1wxtzh0d+dHXtT/JG6qBgLxoyHVsQa8cFABxAPh0pD6uUUHiAoaow==";
      };
    };
    "is-fullwidth-code-point-3.0.0" = {
      name = "is-fullwidth-code-point";
      packageName = "is-fullwidth-code-point";
      version = "3.0.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz";
        sha512 = "zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==";
      };
    };
    "is-interactive-1.0.0" = {
      name = "is-interactive";
      packageName = "is-interactive";
      version = "1.0.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/is-interactive/-/is-interactive-1.0.0.tgz";
        sha512 = "2HvIEKRoqS62guEC+qBjpvRubdX910WCMuJTZ+I9yvqKU2/12eSL549HMwtabb4oupdj2sMP50k+XJfB/8JE6w==";
      };
    };
    "is-unicode-supported-0.1.0" = {
      name = "is-unicode-supported";
      packageName = "is-unicode-supported";
      version = "0.1.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/is-unicode-supported/-/is-unicode-supported-0.1.0.tgz";
        sha512 = "knxG2q4UC3u8stRGyAVJCOdxFmv5DZiRcdlIaAQXAbSfJya+OhopNotLQrstBhququ4ZpuKbDc/8S6mgXgPFPw==";
      };
    };
    "isexe-2.0.0" = {
      name = "isexe";
      packageName = "isexe";
      version = "2.0.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz";
        sha1 = "e8fbf374dc556ff8947a10dcb0572d633f2cfa10";
      };
    };
    "json-schema-traverse-1.0.0" = {
      name = "json-schema-traverse";
      packageName = "json-schema-traverse";
      version = "1.0.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-1.0.0.tgz";
        sha512 = "NM8/P9n3XjXhIZn1lLhkFaACTOURQXjWhV4BA/RnOv8xvgqtqpAX9IO4mRQxSx1Rlo4tqzeqb0sOlruaOy3dug==";
      };
    };
    "jsonfile-6.1.0" = {
      name = "jsonfile";
      packageName = "jsonfile";
      version = "6.1.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/jsonfile/-/jsonfile-6.1.0.tgz";
        sha512 = "5dgndWOriYSm5cnYaJNhalLNDKOqFwyDB/rr1E9ZsGciGvKPs8R2xYGCacuf3z6K1YKDz182fd+fY3cn3pMqXQ==";
      };
    };
    "lodash-4.17.21" = {
      name = "lodash";
      packageName = "lodash";
      version = "4.17.21";
      src = fetchurl {
        url = "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz";
        sha512 = "v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==";
      };
    };
    "log-symbols-4.1.0" = {
      name = "log-symbols";
      packageName = "log-symbols";
      version = "4.1.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/log-symbols/-/log-symbols-4.1.0.tgz";
        sha512 = "8XPvpAA8uyhfteu8pIvQxpJZ7SYYdpUivZpGy6sFsBuKRY/7rQGavedeB8aK+Zkyq6upMFVL/9AW6vOYzfRyLg==";
      };
    };
    "mimic-fn-2.1.0" = {
      name = "mimic-fn";
      packageName = "mimic-fn";
      version = "2.1.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/mimic-fn/-/mimic-fn-2.1.0.tgz";
        sha512 = "OqbOk5oEQeAZ8WXWydlu9HJjz9WVdEIvamMCcXmuqUYjTknH/sqsWvhQ3vgwKFRR1HpjvNBKQ37nbJgYzGqGcg==";
      };
    };
    "minimatch-3.1.2" = {
      name = "minimatch";
      packageName = "minimatch";
      version = "3.1.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/minimatch/-/minimatch-3.1.2.tgz";
        sha512 = "J7p63hRiAjw1NDEww1W7i37+ByIrOWO5XQQAzZ3VOcL0PNybwpfmV/N05zFAzwQ9USyEcX6t3UO+K5aqBQOIHw==";
      };
    };
    "ms-2.1.2" = {
      name = "ms";
      packageName = "ms";
      version = "2.1.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/ms/-/ms-2.1.2.tgz";
        sha512 = "sGkPx+VjMtmA6MX27oA4FBFELFCZZ4S4XqeGOXCv68tT+jb3vk/RyaKWP0PTKyWtmLSM0b+adUTEvbs1PEaH2w==";
      };
    };
    "mute-stream-0.0.8" = {
      name = "mute-stream";
      packageName = "mute-stream";
      version = "0.0.8";
      src = fetchurl {
        url = "https://registry.npmjs.org/mute-stream/-/mute-stream-0.0.8.tgz";
        sha512 = "nnbWWOkoWyUsTjKrhgD0dcz22mdkSnpYqbEjIm2nhwhuxlSkpywJmBo8h0ZqJdkp73mb90SssHkN4rsRaBAfAA==";
      };
    };
    "once-1.4.0" = {
      name = "once";
      packageName = "once";
      version = "1.4.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/once/-/once-1.4.0.tgz";
        sha1 = "583b1aa775961d4b113ac17d9c50baef9dd76bd1";
      };
    };
    "onetime-5.1.2" = {
      name = "onetime";
      packageName = "onetime";
      version = "5.1.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/onetime/-/onetime-5.1.2.tgz";
        sha512 = "kbpaSSGJTWdAY5KPVeMOKXSrPtr8C8C7wodJbcsd51jRnmD+GZu8Y0VoU6Dm5Z4vWr0Ig/1NKuWRKf7j5aaYSg==";
      };
    };
    "ora-5.4.1" = {
      name = "ora";
      packageName = "ora";
      version = "5.4.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/ora/-/ora-5.4.1.tgz";
        sha512 = "5b6Y85tPxZZ7QytO+BQzysW31HJku27cRIlkbAXaNx+BdcVi+LlRFmVXzeF6a7JCwJpyw5c4b+YSVImQIrBpuQ==";
      };
    };
    "os-tmpdir-1.0.2" = {
      name = "os-tmpdir";
      packageName = "os-tmpdir";
      version = "1.0.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/os-tmpdir/-/os-tmpdir-1.0.2.tgz";
        sha1 = "bbe67406c79aa85c5cfec766fe5734555dfa1274";
      };
    };
    "path-is-absolute-1.0.1" = {
      name = "path-is-absolute";
      packageName = "path-is-absolute";
      version = "1.0.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/path-is-absolute/-/path-is-absolute-1.0.1.tgz";
        sha1 = "174b9268735534ffbc7ace6bf53a5a9e1b5c5f5f";
      };
    };
    "punycode-2.1.1" = {
      name = "punycode";
      packageName = "punycode";
      version = "2.1.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/punycode/-/punycode-2.1.1.tgz";
        sha512 = "XRsRjdf+j5ml+y/6GKHPZbrF/8p2Yga0JPtdqTIY2Xe5ohJPD9saDJJLPvp9+NSBprVvevdXZybnj2cv8OEd0A==";
      };
    };
    "readable-stream-3.6.0" = {
      name = "readable-stream";
      packageName = "readable-stream";
      version = "3.6.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/readable-stream/-/readable-stream-3.6.0.tgz";
        sha512 = "BViHy7LKeTz4oNnkcLJ+lVSL6vpiFeX6/d3oSH8zCW7UxP2onchk+vTGB143xuFjHS3deTgkKoXXymXqymiIdA==";
      };
    };
    "require-from-string-2.0.2" = {
      name = "require-from-string";
      packageName = "require-from-string";
      version = "2.0.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz";
        sha512 = "Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==";
      };
    };
    "restore-cursor-3.1.0" = {
      name = "restore-cursor";
      packageName = "restore-cursor";
      version = "3.1.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/restore-cursor/-/restore-cursor-3.1.0.tgz";
        sha512 = "l+sSefzHpj5qimhFSE5a8nufZYAM3sBSVMAPtYkmC+4EH2anSGaEMXSD0izRQbu9nfyQ9y5JrVmp7E8oZrUjvA==";
      };
    };
    "rimraf-3.0.2" = {
      name = "rimraf";
      packageName = "rimraf";
      version = "3.0.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/rimraf/-/rimraf-3.0.2.tgz";
        sha512 = "JZkJMZkAGFFPP2YqXZXPbMlMBgsxzE8ILs4lMIX/2o0L9UBw9O/Y3o6wFw/i9YLapcUJWwqbi3kdxIPdC62TIA==";
      };
    };
    "run-async-2.4.1" = {
      name = "run-async";
      packageName = "run-async";
      version = "2.4.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/run-async/-/run-async-2.4.1.tgz";
        sha512 = "tvVnVv01b8c1RrA6Ep7JkStj85Guv/YrMcwqYQnwjsAS2cTmmPGBBjAjpCW7RrSodNSoE2/qg9O4bceNvUuDgQ==";
      };
    };
    "rxjs-7.5.5" = {
      name = "rxjs";
      packageName = "rxjs";
      version = "7.5.5";
      src = fetchurl {
        url = "https://registry.npmjs.org/rxjs/-/rxjs-7.5.5.tgz";
        sha512 = "sy+H0pQofO95VDmFLzyaw9xNJU4KTRSwQIGM6+iG3SypAtCiLDzpeG8sJrNCWn2Up9km+KhkvTdbkrdy+yzZdw==";
      };
    };
    "safe-buffer-5.2.1" = {
      name = "safe-buffer";
      packageName = "safe-buffer";
      version = "5.2.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz";
        sha512 = "rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==";
      };
    };
    "safer-buffer-2.1.2" = {
      name = "safer-buffer";
      packageName = "safer-buffer";
      version = "2.1.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz";
        sha512 = "YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==";
      };
    };
    "signal-exit-3.0.7" = {
      name = "signal-exit";
      packageName = "signal-exit";
      version = "3.0.7";
      src = fetchurl {
        url = "https://registry.npmjs.org/signal-exit/-/signal-exit-3.0.7.tgz";
        sha512 = "wnD2ZE+l+SPC/uoS0vXeE9L1+0wuaMqKlfz9AMUo38JsyLSBWSFcHR1Rri62LZc12vLr1gb3jl7iwQhgwpAbGQ==";
      };
    };
    "simple-git-3.6.0" = {
      name = "simple-git";
      packageName = "simple-git";
      version = "3.6.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/simple-git/-/simple-git-3.6.0.tgz";
        sha512 = "2e+4QhOVO59GeLsHgwSMKNrSKCnuACeA/gMNrLCYR8ID9qwm4hViVt4WsODcUGjx//KDv6GMLC6Hs/MeosgXxg==";
      };
    };
    "string-similarity-4.0.4" = {
      name = "string-similarity";
      packageName = "string-similarity";
      version = "4.0.4";
      src = fetchurl {
        url = "https://registry.npmjs.org/string-similarity/-/string-similarity-4.0.4.tgz";
        sha512 = "/q/8Q4Bl4ZKAPjj8WerIBJWALKkaPRfrvhfF8k/B23i4nzrlRj2/go1m90In7nG/3XDSbOo0+pu6RvCTM9RGMQ==";
      };
    };
    "string-width-4.2.3" = {
      name = "string-width";
      packageName = "string-width";
      version = "4.2.3";
      src = fetchurl {
        url = "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz";
        sha512 = "wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==";
      };
    };
    "string_decoder-1.3.0" = {
      name = "string_decoder";
      packageName = "string_decoder";
      version = "1.3.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/string_decoder/-/string_decoder-1.3.0.tgz";
        sha512 = "hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==";
      };
    };
    "strip-ansi-6.0.1" = {
      name = "strip-ansi";
      packageName = "strip-ansi";
      version = "6.0.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz";
        sha512 = "Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==";
      };
    };
    "supports-color-7.2.0" = {
      name = "supports-color";
      packageName = "supports-color";
      version = "7.2.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/supports-color/-/supports-color-7.2.0.tgz";
        sha512 = "qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==";
      };
    };
    "through-2.3.8" = {
      name = "through";
      packageName = "through";
      version = "2.3.8";
      src = fetchurl {
        url = "https://registry.npmjs.org/through/-/through-2.3.8.tgz";
        sha1 = "0dd4c9ffaabc357960b1b724115d7e0e86a2e1f5";
      };
    };
    "tmp-0.0.33" = {
      name = "tmp";
      packageName = "tmp";
      version = "0.0.33";
      src = fetchurl {
        url = "https://registry.npmjs.org/tmp/-/tmp-0.0.33.tgz";
        sha512 = "jRCJlojKnZ3addtTOjdIqoRuPEKBvNXcGYqzO6zWZX8KfKEpnGY5jfggJQ3EjKuu8D4bJRr0y+cYJFmYbImXGw==";
      };
    };
    "tmp-0.2.1" = {
      name = "tmp";
      packageName = "tmp";
      version = "0.2.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/tmp/-/tmp-0.2.1.tgz";
        sha512 = "76SUhtfqR2Ijn+xllcI5P1oyannHNHByD80W1q447gU3mp9G9PSpGdWmjUOHRDPiHYacIk66W7ubDTuPF3BEtQ==";
      };
    };
    "tmp-promise-3.0.3" = {
      name = "tmp-promise";
      packageName = "tmp-promise";
      version = "3.0.3";
      src = fetchurl {
        url = "https://registry.npmjs.org/tmp-promise/-/tmp-promise-3.0.3.tgz";
        sha512 = "RwM7MoPojPxsOBYnyd2hy0bxtIlVrihNs9pj5SUvY8Zz1sQcQG2tG1hSr8PDxfgEB8RNKDhqbIlroIarSNDNsQ==";
      };
    };
    "tslib-2.3.1" = {
      name = "tslib";
      packageName = "tslib";
      version = "2.3.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/tslib/-/tslib-2.3.1.tgz";
        sha512 = "77EbyPPpMz+FRFRuAFlWMtmgUWGe9UOG2Z25NqCwiIjRhOf5iKGuzSe5P2w1laq+FkRy4p+PCuVkJSGkzTEKVw==";
      };
    };
    "type-fest-0.21.3" = {
      name = "type-fest";
      packageName = "type-fest";
      version = "0.21.3";
      src = fetchurl {
        url = "https://registry.npmjs.org/type-fest/-/type-fest-0.21.3.tgz";
        sha512 = "t0rzBq87m3fVcduHDUFhKmyyX+9eo6WQjZvf51Ea/M0Q7+T374Jp1aUiyUl0GKxp8M/OETVHSDvmkyPgvX+X2w==";
      };
    };
    "universalify-2.0.0" = {
      name = "universalify";
      packageName = "universalify";
      version = "2.0.0";
      src = fetchurl {
        url = "https://registry.npmjs.org/universalify/-/universalify-2.0.0.tgz";
        sha512 = "hAZsKq7Yy11Zu1DE0OzWjw7nnLZmJZYTDZZyEFHZdUhV8FkH5MCfoU1XMaxXovpyW5nq5scPqq0ZDP9Zyl04oQ==";
      };
    };
    "uri-js-4.4.1" = {
      name = "uri-js";
      packageName = "uri-js";
      version = "4.4.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz";
        sha512 = "7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==";
      };
    };
    "util-deprecate-1.0.2" = {
      name = "util-deprecate";
      packageName = "util-deprecate";
      version = "1.0.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz";
        sha1 = "450d4dc9fa70de732762fbd2d4a28981419a0ccf";
      };
    };
    "wcwidth-1.0.1" = {
      name = "wcwidth";
      packageName = "wcwidth";
      version = "1.0.1";
      src = fetchurl {
        url = "https://registry.npmjs.org/wcwidth/-/wcwidth-1.0.1.tgz";
        sha1 = "f0b0dcf915bc5ff1528afadb2c0e17b532da2fe8";
      };
    };
    "which-2.0.2" = {
      name = "which";
      packageName = "which";
      version = "2.0.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/which/-/which-2.0.2.tgz";
        sha512 = "BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==";
      };
    };
    "wrappy-1.0.2" = {
      name = "wrappy";
      packageName = "wrappy";
      version = "1.0.2";
      src = fetchurl {
        url = "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz";
        sha1 = "b5243d8f3ec1aa35f1364605bc0d1036e30ab69f";
      };
    };
  };
  args = {
    name = "ts-fpm";
    packageName = "ts-fpm";
    version = "1.0.0";
    src = ./.;
    dependencies = [
      sources."@kwsites/file-exists-1.1.1"
      sources."@kwsites/promise-deferred-1.1.1"
      sources."ajv-8.11.0"
      sources."ansi-escapes-4.3.2"
      sources."ansi-regex-5.0.1"
      sources."ansi-styles-4.3.0"
      sources."balanced-match-1.0.2"
      sources."base64-js-1.5.1"
      sources."bl-4.1.0"
      sources."brace-expansion-1.1.11"
      sources."buffer-5.7.1"
      sources."chalk-4.1.2"
      sources."chardet-0.7.0"
      sources."cli-cursor-3.1.0"
      sources."cli-spinners-2.6.1"
      sources."cli-width-3.0.0"
      sources."clone-1.0.4"
      sources."color-convert-2.0.1"
      sources."color-name-1.1.4"
      sources."commander-9.1.0"
      sources."concat-map-0.0.1"
      sources."debug-4.3.4"
      sources."defaults-1.0.3"
      sources."emoji-regex-8.0.0"
      sources."escape-string-regexp-1.0.5"
      (sources."external-editor-3.1.0" // {
        dependencies = [
          sources."tmp-0.0.33"
        ];
      })
      sources."fast-deep-equal-3.1.3"
      sources."figures-3.2.0"
      sources."fs-extra-10.0.1"
      sources."fs.realpath-1.0.0"
      sources."glob-7.2.0"
      sources."graceful-fs-4.2.10"
      sources."has-flag-4.0.0"
      sources."iconv-lite-0.4.24"
      sources."ieee754-1.2.1"
      sources."inflight-1.0.6"
      sources."inherits-2.0.4"
      (sources."inquirer-8.2.2" // {
        dependencies = [
          sources."chalk-4.1.2"
        ];
      })
      sources."is-fullwidth-code-point-3.0.0"
      sources."is-interactive-1.0.0"
      sources."is-unicode-supported-0.1.0"
      sources."isexe-2.0.0"
      sources."json-schema-traverse-1.0.0"
      sources."jsonfile-6.1.0"
      sources."lodash-4.17.21"
      (sources."log-symbols-4.1.0" // {
        dependencies = [
          sources."chalk-4.1.2"
        ];
      })
      sources."mimic-fn-2.1.0"
      sources."minimatch-3.1.2"
      sources."ms-2.1.2"
      sources."mute-stream-0.0.8"
      sources."once-1.4.0"
      sources."onetime-5.1.2"
      (sources."ora-5.4.1" // {
        dependencies = [
          sources."chalk-4.1.2"
        ];
      })
      sources."os-tmpdir-1.0.2"
      sources."path-is-absolute-1.0.1"
      sources."punycode-2.1.1"
      sources."readable-stream-3.6.0"
      sources."require-from-string-2.0.2"
      sources."restore-cursor-3.1.0"
      sources."rimraf-3.0.2"
      sources."run-async-2.4.1"
      sources."rxjs-7.5.5"
      sources."safe-buffer-5.2.1"
      sources."safer-buffer-2.1.2"
      sources."signal-exit-3.0.7"
      sources."simple-git-3.6.0"
      sources."string-similarity-4.0.4"
      sources."string-width-4.2.3"
      sources."string_decoder-1.3.0"
      sources."strip-ansi-6.0.1"
      sources."supports-color-7.2.0"
      sources."through-2.3.8"
      sources."tmp-0.2.1"
      sources."tmp-promise-3.0.3"
      sources."tslib-2.3.1"
      sources."type-fest-0.21.3"
      sources."universalify-2.0.0"
      sources."uri-js-4.4.1"
      sources."util-deprecate-1.0.2"
      sources."wcwidth-1.0.1"
      sources."which-2.0.2"
      sources."wrappy-1.0.2"
    ];
    buildInputs = globalBuildInputs;
    meta = {
      description = "";
      license = "ISC";
    };
    production = true;
    bypassCache = true;
    reconstructLock = false;
  };
in
{
  args = args;
  sources = sources;
  tarball = nodeEnv.buildNodeSourceDist args;
  package = nodeEnv.buildNodePackage args;
  shell = nodeEnv.buildNodeShell args;
  nodeDependencies = nodeEnv.buildNodeDependencies (lib.overrideExisting args {
    src = stdenv.mkDerivation {
      name = args.name + "-package-json";
      src = nix-gitignore.gitignoreSourcePure [
        "*"
        "!package.json"
        "!package-lock.json"
      ] args.src;
      dontBuild = true;
      installPhase = "mkdir -p $out; cp -r ./* $out;";
    };
  });
}
