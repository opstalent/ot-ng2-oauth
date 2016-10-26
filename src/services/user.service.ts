import { Injectable }     from '@angular/core';


@Injectable()
export class OAuthUser {
    storageKey: string = 'oauth_user';

    /**
     * Retrieve user from local storage
     */
    getUser(): any {
        if (typeof(Storage) !== 'undefined') {
            let data = localStorage.getItem(this.storageKey);
            return (data) ? JSON.parse(data) : false;
        }
        return false;
    }

    /**
     * Save user to local storage
     */
     setUser(data: any): boolean {
        if (typeof(Storage) !== 'undefined') {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        }
        return false;
    }

    /**
     * Remove user to local storage
     */
    removeUser(): any {
        if (typeof(Storage) !== 'undefined') {
            localStorage.removeItem(this.storageKey);
            return true;
        }
        return false;
    }
}
