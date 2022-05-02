
let makeQueue = ((max = 4, disable = false) => {
    if (disable)
        return { add: <T>(job: () => Promise<T>) => job() };
    type jobT = () => Promise<void>;
    let queue: jobT[] = [];
    let active = 0;
    let manage = () => {
        let jobs = queue.splice(0, Math.max(max - active, 0));
        for (let job of jobs) {
            active++;
            job();
        }
        // console.log('[QUEUE] Running ' + active + ' jobs now')
    };
    function add<T>(job: () => Promise<T>): Promise<T> {
        // console.log('[QUEUE] queued job=', job);
        return new Promise((accept, reject) => {
            queue.unshift(() =>
                job().then(accept).catch(reject)
                    .finally(() => {
                        active--;
                        // console.log('[QUEUE] done', active);
                        manage();
                    })
            );
            manage();
        });
    };
    return {
        add,
        get activeJobs() { return active },
        set max(n: number) { max = n },
        get length() { return active + queue.length },
    };
})

export const queue = makeQueue();
