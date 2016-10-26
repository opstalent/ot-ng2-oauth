export interface IAuthConfig {
    clientId: string;
    clientSecret: string;
    baseUrl: string;
    grantPath: string;
    revokePath: string;
}

export const AUTH_CONFIG = 'authConfig';
