"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
// export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }
//   next();
// };
const authMiddleware = (req, res, next) => {
    const authenticated = req.session && req.session.userId;
    if (!authenticated) {
        res.status(401).json({ message: "Unauthorized" });
    }
    else {
        next();
    }
};
exports.authMiddleware = authMiddleware;
