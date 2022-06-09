import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Constants } from '../constants';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthenticationService {
    public token: string;
    public user: string;

    server: string = environment.nodeServer;

    constructor(private http: Http) {
        // set token if saved in local storage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    public isAuthenticated(): boolean {
       // const token = localStorage.getItem('token');
        const helper = new JwtHelperService();
        // Check whether the token is expired and return
        // true or false
       //  return true;

        return !helper.isTokenExpired(this.token);
      }


     login(username: string, password: string): Observable<boolean> {
        const headers = new Headers();

        headers.append('Content-Type', 'application/json; charset=UTF-8');
        headers.append('Cache-Control', 'no-cache');
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        const body = JSON.stringify({ loginId: username, password: password })
        return this.http.post( this.server  + '/authenticate', body, { headers: headers })
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                const token = response.json() && response.json().token;
                const loginId = response.json() && response.json().loginId;
                if (token) {
                    // set token property
                    this.token = token;

                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify({ username: username, token: token }));
                    this.logActivity(loginId);

                    // return true to indicate successful login
                    return true;
                } else {
                    // return false to indicate failed login
                    return false;
                }
            });
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        localStorage.clear();
    }

    logActivity(loginId): void {
      // clear token remove user from local storage to log user out
      this.user = JSON.parse(localStorage.getItem('currentUser'));
      console.log(this.user);
  }

  
}
