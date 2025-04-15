export const checkLoginStatus = (req, res, next) => {
    console.log("login call");
    const isMiddleware = next && typeof next === 'function';
    if (isMiddleware) {
        if (!req.session?.userId) {
            return res.status(401).json({ error: 'Please login first' });
        }
        return next();
    }
    return !!req?.session?.userId;
}


/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export const checkLoginOrInternalRequest = (req, res, next) => {
    const isMiddleware = next && typeof next === 'function';
    const internalRequestToken = process.env.INTERNAL_REQUEST_TOKEN;
    
    const isInternalRequest = !!req.headers['x-internal-req'];
    if (isInternalRequest) {
        if ( req.headers['x-internal-req'] === internalRequestToken ) {
            req.isInternalRequest = true;
            return next();
        }
        console.error({
            error: `${req.ip} tries to access the internal request with invalid token`,
        });
        return res.status(403).json({ error: 'Your ip is recorded for security reasons' });
    }
    checkLoginStatus(req, res, next);
}