import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Constants } from '../constants';
import { environment } from '../../environments/environment';

import { AuthenticationService } from './authentication.service';
import { User } from '../model/index';



@Injectable()
export class UserService {

    server: string = environment.nodeServer;
    url: string =  this.server + '/api/user/';

    constructor(
        private http: Http,
        private authenticationService: AuthenticationService) {
    }

    create(user: User) {
        return this.http.post(this.url, user, this.jwt()).map((response: Response) => response.json());
    }

    deleteUser(id: number){
        return this.http.get(this.url + 'delete/' + id, this.jwt()).map((response: Response) => response.json());
    }

    getUserRoles(loginId: string): Observable<any> {
        return this.http.get(this.url + 'roles/' + loginId, this.jwt()).map((response: Response) => response.json());
    }

    getByLogin(loginId: string): Observable<any> {
        return this.http.get(this.url + loginId, this.jwt()).map((response: Response) => response.json());
    }

    getById(id: number) {
        return this.http.get(this.url + id, this.jwt()).map((response: Response) => response.json());
    }

    update(user: User) {
        const fug = this.url + user.loginId;
     //   const once = this.http.put(fug, JSON.stringify(user), this.jwt())
     //   .map(() => user);

   //   const dog =  this.http.put(fug, user, this.jwt()).map((response: Response) => response.json());
    //   return dog;
       return this.http.put(fug, user, this.jwt()).map((response: Response) => response.json());
    }

    private handleError (error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        const errMsg = (error.message) ? error.message :
          error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
      }

    delete(id: number) {
        return this.http.delete(this.url + id, this.jwt()).map((response: Response) => response.json());
    }

    getAll(): Observable<User[]> {
        return this.http.get(this.url, this.jwt()).map((response: Response) => response.json());
    }

    private jwt() {
        // create authorization header with jwt token
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
        //    const headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            const headers = new Headers({ 'Authorization': currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }

}
