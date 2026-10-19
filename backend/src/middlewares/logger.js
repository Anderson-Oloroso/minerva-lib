export function logger(req, res, next) {
    const startedAt = Date.now();
    const url = req.originalUrl || req.url;
    let logged = false;

    const logRequest = (status) => {
        if (logged) return;
        logged = true;

        const timestamp = new Date().toISOString();
        const duration = Date.now() - startedAt;
        console.log(
            `${timestamp} - Method: ${req.method} Url: ${url} Status: ${status} Duration: ${duration} ms`
        );
    };

    res.once('finish', () => logRequest(res.statusCode));
    res.once('close', () => {
        if (!res.writableFinished) logRequest('aborted');
    });

    next();
}