import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Constants } from '../constants';

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.scss']
})
export class TestingComponent implements OnInit {

  appTitle = Constants.APP_TITLE;
  appVersion = Constants.APP_VERSION;
  buildDate =  Constants.APP_BUILD_DATE;

  constructor() { }

  ngOnInit() {
  }

  isProd () {return (environment.production);}

}
