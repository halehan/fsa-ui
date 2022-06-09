import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Constants } from '../constants';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SearchService {

  server: string = environment.nodeServer;

  viewByCheckUrl = this.server + '/api/transaction/bid/view/';
  viewByVendorUrl = this.server + '/api/transaction/bid/view/vendor/:vendor';
  viewByCheckVendorUrl = this.server + '/api/transaction/bid/view/check/:check/vendor/:vendor';
  viewByCheckListUrl = this.server + '/api/transaction/bid/view/list/';
  deleteByCheck = this.server + '/api/transaction/check/delete/';
  lockByCheck = this.server + '/api/transaction/check/lock/';
  unLockByCheck = this.server + '/api/transaction/check/unlock/';
  lockByRange = this.server + '/api/transaction/check/lock/dt/';
  unLockByRange = this.server + '/api/transaction/check/unlock/dt/';
  UnlockedRecordsByDate = this.server + '/api/transaction/check/unlock/all/';
  verifyByCheckVendor = this.server + '/api/transaction/check/verify/';
  resetVerifyByCheckVendor = this.server + '/api/transaction/check/resetverify/';

  verifyByRange = this.server + '/api/transaction/check/verify/dt/';
  unVerifyByRange = this.server + '/api/transaction/check/unverify/dt/';
  verifyRecordsByDate = this.server + '/api/transaction/check/verify/all/';

  dealerUrl = this.server + '/api/transaction/bid/view/detail/';
  lockedDatesUrl = `${this.server}/api/transaction/payment/lockdates/`
  lockedDateslistUrl = `${this.server}/api/transaction/payment/lockedpaymentlist/`


  constructor(private http: Http) {
  }

  isEmpty(val: string): boolean {

    if ((val === undefined || val === null || val.length === 0)) {
      return true;
    } else {
      return false;
    }

  }

   getByCheckNumber(checkNumber: string, vendor: string, paymentDate: string) {
    let url: string = null;
    let checkNumberArg =  this.isEmpty(checkNumber) ? 'ignore' : checkNumber
    let vendorArg =  this.isEmpty(vendor) ? 'ignore' : vendor
    let paymentDateArg = this.isEmpty(paymentDate) ? 'ignore' : paymentDate

    console.log('checkNumber  ' + checkNumberArg)
    console.log('vendor  ' + vendorArg)
    console.log('paymentDate  ' + paymentDateArg)

    url = this.server + '/api/transaction/bid/view/check/' + checkNumberArg + '/vendor/' + vendorArg + '/paydate/' + paymentDateArg

    console.log(url)

    return this.http.get(url, this.jwt()).map((response: Response) => response.json());
  }

  getPaymentLockedList() {
    return this.http.get(this.lockedDateslistUrl, this.jwt()).map((response: Response) => response.json());
  }

  getPaymentLockedDates() {
    return this.http.get(this.lockedDatesUrl, this.jwt()).map((response: Response) => response.json());
  }

  getByCheckNumberDealer(checkNumber: string, dealerName: string) {
    return this.http.get(this.viewByCheckListUrl + checkNumber + '/' + dealerName, this.jwt()).map((response: Response) => response.json());
  }

  deleteByCheckNumber(checkNumber: string, dealerName: string) {
    return this.http.get(this.deleteByCheck + checkNumber + '/' + dealerName, this.jwt()).map((response: Response) => response.json());
  }

  getLockedByDateRange(startDate: string, endDate: string) {
    return this.http.get(this.UnlockedRecordsByDate + startDate + '/' + endDate, this.jwt()).map((response: Response) => response.json());
  }

  lockByDateRange(startDate: string, endDate: string, createdBy: string) {
    return this.http.get(this.lockByRange + startDate + '/' + endDate + '/' + createdBy, this.jwt()).map((response: Response) => response.json());
  }

  unLockByDateRange(startDate: string, endDate: string) {
    return this.http.get(this.unLockByRange + startDate + '/' + endDate, this.jwt()).map((response: Response) => response.json());
  }

  getVerifyByDateRange(startDate: string, endDate: string) {
    return this.http.get(this.verifyRecordsByDate + startDate + '/' + endDate, this.jwt()).map((response: Response) => response.json());
  }

  verifyByDateRange(startDate: string, endDate: string) {
    return this.http.get(this.verifyByRange + startDate + '/' + endDate, this.jwt()).map((response: Response) => response.json());
  }

  unVerifyByDateRange(startDate: string, endDate: string) {
    return this.http.get(this.unVerifyByRange + startDate + '/' + endDate, this.jwt()).map((response: Response) => response.json());
  }



  lockByCheckNumber(checkNumber: string, dealerName: string) {
    return this.http.get(this.lockByCheck + checkNumber + '/' + dealerName, this.jwt()).map((response: Response) => response.json());
  }

  unLockByCheckNumber(checkNumber: string, dealerName: string) {
    return this.http.get(this.unLockByCheck + checkNumber + '/' + dealerName, this.jwt()).map((response: Response) => response.json());
  }

  verifyByCheckNumber(checkNumber: string, dealerName: string) {
    return this.http.get(this.verifyByCheckVendor + checkNumber + '/' + dealerName,
      this.jwt()).map((response: Response) => response.json());
  }

  resetVerifyByCheckNumber(checkNumber: string, dealerName: string) {
    return this.http.get(this.resetVerifyByCheckVendor + checkNumber + '/' + dealerName,
      this.jwt()).map((response: Response) => response.json());
  }

  getById(id: string) {
    return this.http.get(this.dealerUrl + id, this.jwt()).map((response: Response) => response.json());
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
