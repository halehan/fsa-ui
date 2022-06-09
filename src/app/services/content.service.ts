
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Constants } from '../constants';
import { environment } from '../../environments/environment';

@Injectable()
export class ContentService {

  server: string = environment.nodeServer;

//  app.get('/api/report/caReport/', fsaRepoorting.getCAReportStep1);
// app.get('/api/report/caReport/2/:cityAgency/:year', fsaRepoorting.getCAReportStep2Payments);
// app.get('/api/report/caReport/3/:dealerName/:year', fsaRepoorting.getCAReportStep2NoPayments);

  constructor( private http: Http) { }

  // pp.get('/api/report/topvendor/', fsaRepoorting.getTopVendors);
// app.get('/api/report/topagency/', fsaRepoorting.getTopAgency);

getReportItemActivity(): Observable<any> {
  return this.http.get(this.server +  '/api/report/PoItemActivity/', this.jwt()).map((response: Response) => response.json());
}

getReportPaymentActivity(): Observable<any> {
  return this.http.get(this.server +  '/api/report/paymentActivity/', this.jwt()).map((response: Response) => response.json());
}

getReportBids(type: string): Observable<any> {
  return this.http.get(this.server +  '/api/report/activeBid/' + type, this.jwt()).map((response: Response) => response.json());
}

getReportTopVendor(): Observable<any> {
  return this.http.get(this.server +  '/api/report/topvendor/' , this.jwt()).map((response: Response) => response.json());
}

getReportTopAgency(): Observable<any> {
  return this.http.get(this.server +  '/api/report/topagency/' , this.jwt()).map((response: Response) => response.json());
}

  getReportPayeeAllocations(): Observable<any> {
    return this.http.get(this.server +  '/api/report/partnerAllocations/' , this.jwt()).map((response: Response) => response.json());
  }
  getReportCityAgency(): Observable<any> {
    return this.http.get(this.server +  '/api/report/caReport/' , this.jwt()).map((response: Response) => response.json());
  }

  getReportCityAgency2(cityAgency: string, year: string): Observable<any> {
    return this.http.get(this.server +  '/api/report/caReport/2/' + cityAgency + '/' + year,
    this.jwt()).map((response: Response) => response.json());
  }

  getReportCityAgency3(cityAgency: string, year: string): Observable<any> {
    return this.http.get(this.server +  '/api/report/caReport/3/' + cityAgency + '/' + year,
    this.jwt()).map((response: Response) => response.json());
  }

  test(): Observable<any> {
    return this.http.get(this.server +  '/api/report/partnerFees/' , this.jwt()).map((response: Response) => response.json());
  }

  getPartnerFees(): Observable<any> {
    return this.http.get(this.server +  '/api/report/partnerFees/' , this.jwt()).map((response: Response) => response.json());
  }

  getPoPaymentUnbalanced(final: string): Observable<any> {
    return this.http.get(this.server +  '/api/report/po-payment-unbalalnced/' + final,
    this.jwt()).map((response: Response) => response.json());
  }
  getTopVendorReport(year: string): Observable<any> {
    return this.http.get(this.server +  '/api/report/topvendor/' + year, this.jwt()).map((response: Response) => response.json());
  }

  getByName(name: string): Observable<any> {
    return this.http.get(this.server +  '/api/content/' + name, this.jwt()).map((response: Response) => response.json());
  }

  getByNameOld(name: string) {
    return this.http.get(this.server + '/api/content/' + name, this.jwt()).map((response: Response) =>
      response.json()).catch(this.handleError);
  }

  private handleError (error: Response | any) {
    console.error('contentService::handleError' + error);
    return observableThrowError(error);
  }

  private jwt() {
    // create authorization header with jwt token
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
    //    const headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
        const headers = new Headers({ 'Authorization': currentUser.token,  'x-access-token': currentUser.token } );
        return new RequestOptions({ headers: headers });
    }
}

}
