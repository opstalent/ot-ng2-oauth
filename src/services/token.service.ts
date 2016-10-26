import { capitalize } from 'lodash';

export class OAuthToken {
    static storageKey: string = 'oauth';

    /**
     * Retrieve token from local storage
     */
    static getToken(): any {
        if (typeof(Storage) === 'undefined') {
            return false;
        }
        let data = localStorage.getItem(this.storageKey);
        return (data) ? JSON.parse(data) : false;
    }

    /**
     * Save token to local storage
     */
    static setToken(data: any): boolean {
        if (typeof(Storage) !== 'undefined' && data !== undefined) {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        }
        return false;
    }

    /**
     * Remove token to local storage
     */
    static removeToken(): any {
        if (typeof(Storage) !== 'undefined') {
            localStorage.removeItem(this.storageKey);
            return true;
        }
        return false;
    }

    /**
     * Retrieve access token from local storage
     */
    static getAccessToken(): string {
        return this.getToken() ? this.getToken().access_token : undefined;
    }

    /**
     * Retrieve refresh token from local storage
     */
    static getRefreshToken(): string {
        return this.getToken() ? this.getToken().refresh_token : undefined;
    }

    /**
     * Retrieve token type from local storage
     */
    static getTokenType(): string {
        return this.getToken() ? this.getToken().token_type : undefined;
    }

    /**
     * Returns authorization header based on token from local storage
     */
    static getAuthorizationHeader(): string {
        if (!(this.getTokenType() && this.getAccessToken())) {
            return;
        }

        return `${capitalize(this.getTokenType())} ${this.getAccessToken()}`;
    }
}
