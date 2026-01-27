import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    register(body: any): Promise<{
        id: string;
        email: any;
    }>;
    getProfile(): Promise<{
        id: string;
        email: string;
    }>;
}
export {};
