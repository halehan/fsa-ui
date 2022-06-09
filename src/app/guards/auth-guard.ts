import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router,  private authenticationService: AuthenticationService) { }

    canActivate() {

        if (localStorage.getItem('currentUser') && this.authenticationService.isAuthenticated()) {
            // logged in so return true
            return true;
        }

        localStorage.clear();
        // not logged in so redirect to login page
        this.router.navigate(['/login']);
        return false;
    }

}
