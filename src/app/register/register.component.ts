import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { AlertService } from '../services/alert.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  model: any = {};
  loading = false;
  complexForm: FormGroup;
  hide = true;
  firstName: string;
  lastName: string;
  loginId: string;
  password: string;


  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private router: Router,
    private userService: UserService,
    private alertService: AlertService,
    private fb: FormBuilder) {
    this.complexForm = fb.group({
      'firstName': [null, Validators.compose([Validators.required, Validators.minLength(2)])],
      'lastName': [null, Validators.required],
      'loginId': [null, Validators.compose([Validators.required, Validators.email])],
      'password': [null, Validators.compose([Validators.required, Validators.minLength(2)])]
    })


  }

  submitForm(value: any) {
    console.log(value);
  }

  ngOnInit() {

  }

  register(value: any) {
    this.loading = true;
    this.userService.create(value)
      .subscribe(
        data => {
          if (data.error) {
            console.log(data.error.name)
            this.alertService.error(value.loginId + ' already exists. Please use another email address', false);
            this.loading = false;
          } else {
            this.alertService.success('Registration successful', false);
            this.alertService.clear();
            this.router.navigate(['/login']);
          }
          console.log(data)
        }); 
  }

}
