import { roles } from "../constants/index.js";

export const checkAdmin = (req, res, next) => {
    const isMiddleware = next && typeof next === 'function';
    const isAllowed = req?.session?.role === roles.admin;
    if (isMiddleware) {
        if (!req.session?.userId) {
            return res.status(400).redirect('/login');
        }
        if (!isAllowed) {
            return res.status(403).json({
                error: 'Not authorized',
            })
        }
        return next();
    }
    return isAllowed;
}