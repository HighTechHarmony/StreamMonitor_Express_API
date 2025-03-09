import { Request, Response, NextFunction } from 'express';

// export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }
//   next();
// };


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const authenticated = req.session && req.session.userId;
    if (!authenticated) {
      res.status(401).json({ message: "Unauthorized" });
    } else {
      next();
    }
  };
  
