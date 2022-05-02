"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootLogger = exports.rootLogger_react = exports.logCAFn = exports.Level = void 0;
const react_1 = __importStar(require("react"));
const ink_1 = require("ink");
/* import Spinner from 'ink-spinner'; */
let frames = ["⠋",
    "⠙",
    "⠹",
    "⠸",
    "⠼",
    "⠴",
    "⠦",
    "⠧",
    "⠇",
    "⠏"];
const Spinner = () => {
    const [frame, setFrame] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        const timer = setInterval(() => {
            setFrame(previousFrame => {
                const isLastFrame = previousFrame === frames.length - 1;
                return isLastFrame ? 0 : previousFrame + 1;
            });
        }, 400);
        return () => clearInterval(timer);
    });
    return react_1.default.createElement(ink_1.Text, null, frames[frame]);
};
let levelToKeep = (l) => l !== Level.NOTICE;
function clone(x) { return JSON.parse(JSON.stringify(x)); }
;
const ShowTask = (prop) => {
    let [self, setSelf] = (0, react_1.useState)(prop);
    let task = self.task;
    let parentDone = prop.parentDone || false;
    (0, react_1.useEffect)(() => {
        task.refresh = () => setSelf(Object.assign(Object.assign({}, prop), task));
    });
    if (parentDone && !levelToKeep(task.level))
        return react_1.default.createElement(ink_1.Box, null);
    return (react_1.default.createElement(ink_1.Box, { flexDirection: "column" },
        prop.root || (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ink_1.Box, { flexDirection: "row", justifyContent: "space-between" },
                react_1.default.createElement(ink_1.Box, { flexShrink: 0, paddingRight: 1 }, task.done ? react_1.default.createElement(ink_1.Text, { color: "green" }, "\u2713") : react_1.default.createElement(ink_1.Text, { color: "gray" },
                    react_1.default.createElement(Spinner, null))),
                react_1.default.createElement(ink_1.Box, { flexGrow: 1 },
                    react_1.default.createElement(ink_1.Text, { color: levelToKeep(task.level) ? '' : 'gray' }, task.name)),
                react_1.default.createElement(ink_1.Box, { flexShrink: 0, height: 1 }, task.subtasks.length ? (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(ink_1.Text, { color: "gray" }, " ["),
                    react_1.default.createElement(ink_1.Text, null, task.subtasks.filter(x => x.done).length),
                    react_1.default.createElement(ink_1.Text, { color: "gray" },
                        "/",
                        task.subtasks.length,
                        "]"))) : (react_1.default.createElement(react_1.default.Fragment, null)))))),
        react_1.default.createElement(ink_1.Box, { flexDirection: "column", paddingLeft: 1, width: "100%" }, task.subtasks.map((u, i) => (react_1.default.createElement(ink_1.Box, { key: i },
            react_1.default.createElement(ShowTask, { parentDone: task.done, task: u })))))));
};
var Level;
(function (Level) {
    Level[Level["INFO"] = 0] = "INFO";
    Level[Level["NOTICE"] = 1] = "NOTICE";
    Level[Level["WARNING"] = 2] = "WARNING";
    Level[Level["ERROR"] = 3] = "ERROR";
    Level[Level["FATAL"] = 4] = "FATAL";
})(Level = exports.Level || (exports.Level = {}));
let sleep = (ms) => new Promise(a => setTimeout(a, ms));
function logCAFn(level, message, f) {
    return log => async (...args) => {
        let sub = log(level, typeof message == 'string' ? message : message(...args));
        await sleep(1);
        let r = await (f(sub)(...args));
        sub.done();
        return r;
    };
}
exports.logCAFn = logCAFn;
let stdoutLogger = (depth) => Object.assign(((level, name) => {
    console.log(depth + " " + name);
    return stdoutLogger(depth + "-");
}), {
    done: () => { },
    append: (msg) => { console.log(msg); }
});
let refreshWhenPossible = (t) => {
    if (t.refresh)
        return t.refresh();
    let i = setInterval(() => {
        if (!t.refresh)
            return;
        t.refresh();
        clearInterval(i);
    }, 100);
};
let makeLoggerOfTask = (task) => {
    return Object.assign(((level, name) => {
        let self = {
            name,
            subtasks: [],
            done: false,
            /*                 isTask, */
            level,
            refresh: () => { }
        };
        task.subtasks.push(self);
        refreshWhenPossible(task);
        return makeLoggerOfTask(self);
    }), {
        done: () => { task.done = true; refreshWhenPossible(task); },
        append: (msg) => { task.name += msg; refreshWhenPossible(task); }
    });
};
let ensureRender_ = false;
let ensureRender = () => {
    if (ensureRender_)
        return;
    let ShowRootLogger = ({}) => {
        return react_1.default.createElement(ShowTask, { task: _rootLogger, root: true });
    };
    let renderer = (0, ink_1.render)(react_1.default.createElement(ShowRootLogger, null));
    ensureRender_ = true;
};
let _rootLogger = {
    name: '#root',
    subtasks: [],
    refresh: null,
    level: Level.INFO,
    done: false
};
exports.rootLogger_react = Object.assign((l, n) => {
    let r = makeLoggerOfTask(_rootLogger)(l, n);
    ensureRender();
    return r;
}, {
    done: () => {
        _rootLogger.done = true;
        refreshWhenPossible(_rootLogger);
    },
    append: (message) => {
        _rootLogger.name += message;
        refreshWhenPossible(_rootLogger);
    }
});
exports.rootLogger = false ? exports.rootLogger_react : stdoutLogger("");
//# sourceMappingURL=Log.js.map