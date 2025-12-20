import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: any;
}
export declare function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function generateToken(userId: string): string;
export declare function generateRefreshToken(userId: string): string;
//# sourceMappingURL=auth.d.ts.map