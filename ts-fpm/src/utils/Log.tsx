import React, { useEffect, useState } from 'react';
import { render, Text, Box, useInput, useFocus, useFocusManager } from 'ink';
import { Config } from './Config';
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
    "⠏"]
const Spinner = () => {
    const [frame, setFrame] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setFrame(previousFrame => {
                const isLastFrame = previousFrame === frames.length - 1;
                return isLastFrame ? 0 : previousFrame + 1;
            })
        }, 400);
        return () => clearInterval(timer);
    });
    return <Text>{frames[frame]}</Text>;
};

type Task = {
    name: string,
    refresh: null | (() => void),
    level: Level,
    subtasks: Task[],
    done: boolean
}

let levelToKeep = (l: Level) => l !== Level.NOTICE

function clone<T>(x: T): T { return JSON.parse(JSON.stringify(x)); };

const ShowTask = (prop: { root?: boolean, task: Task, parentDone?: boolean }) => {
    let [self, setSelf] = useState(prop);
    let task = self.task;
    let parentDone = prop.parentDone || false;
    useEffect(() => {
        task.refresh = () => setSelf({ ...prop, ...task });
    });
    if (parentDone && !levelToKeep(task.level))
        return <Box></Box>;
    return (<Box flexDirection="column" >
        {prop.root || (<>
            <Box flexDirection="row" justifyContent="space-between">
                <Box flexShrink={0} paddingRight={1}>
                    {task.done ? <Text color="green">✓</Text> : <Text color="gray"><Spinner /></Text>}
                </Box>
                <Box flexGrow={1}>
                    <Text color={levelToKeep(task.level) ? '' : 'gray'}>{task.name}</Text>
                </Box>
                <Box flexShrink={0} height={1}>
                    {task.subtasks.length ? (
                        <>
                            <Text color="gray"> [</Text>
                            <Text>{task.subtasks.filter(x => x.done).length}</Text>
                            <Text color="gray">/{task.subtasks.length}]</Text>
                        </>
                    ) : (<></>)}
                </Box>
            </Box>
        </>)}
        <Box flexDirection="column" paddingLeft={1} width="100%">
            {task.subtasks.map((u, i) =>
            (
                <Box key={i} >
                    <ShowTask parentDone={task.done} task={u} />
                </Box>
            )
            )}
        </Box>
    </Box >);
};


export enum Level {
    INFO,
    NOTICE,
    WARNING,
    ERROR,
    FATAL
}

export interface Logger {
    (level: Level, message: string): Logger;
    /*     (level: Level, message: string, isTask: true): Logger; */
    done: () => void,
    append: (message: string) => void
}

let sleep = (ms: number) => new Promise(a => setTimeout(a, ms));

export function logCAFn<FN extends (...args: any[]) => Promise<any>>(
    level: Level, message: (string | ((...args: Parameters<FN>) => string)),
    f: (sublog: Logger) => FN
): (sublog: Logger) => (...args: Parameters<FN>) => Promise<Awaited<ReturnType<FN>>> {
    return log => async (...args: Parameters<FN>): Promise<Awaited<ReturnType<FN>>> => {
        let sub: Logger = log(level, typeof message == 'string' ? message : message(...args));
        await sleep(1);
        let r = await (f(sub)(...args));
        sub.done();
        return r;
    };
}

let stdoutLogger = (depth: string): Logger =>
    Object.assign(
        ((level: Level, name: string) => {
            console.log(depth + " " + name);
            return stdoutLogger(depth + "-");
        })
        , {
            done: () => { },
            append: (msg: string) => { console.log(msg) }
        }
    );

let refreshWhenPossible = (t: Task) => {
    if (t.refresh)
        return t.refresh();
    let i = setInterval(() => {
        if (!t.refresh)
            return;
        t.refresh();
        clearInterval(i);
    }, 100);
};

let makeLoggerOfTask = (task: Task): Logger => {
    return Object.assign(
        ((level: Level, name: string) => {
            let self: Task = {
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
        })
        , {
            done: () => { task.done = true; refreshWhenPossible(task); },
            append: (msg: string) => { task.name += msg; refreshWhenPossible(task); }
        }
    );
};

let ensureRender_ = false;
let ensureRender = () => {
    if (ensureRender_)
        return;
    let ShowRootLogger = ({ }) => {
        return <ShowTask task={_rootLogger} root={true} />;
    }
    let renderer = render(<ShowRootLogger />);
    ensureRender_ = true;
};


let _rootLogger: Task = {
    name: '#root',
    subtasks: [],
    refresh: null,
    level: Level.INFO,
    done: false
};
export let rootLogger_react: Logger = Object.assign((l: Level, n: string) => {
    let r = makeLoggerOfTask(_rootLogger)(l, n);
    ensureRender();
    return r;
}, {
    done: () => {
        _rootLogger.done = true;
        refreshWhenPossible(_rootLogger);
    },
    append: (message: string) => {
        _rootLogger.name += message;
        refreshWhenPossible(_rootLogger);
    }
});
export let rootLogger = false ? rootLogger_react : stdoutLogger("");
