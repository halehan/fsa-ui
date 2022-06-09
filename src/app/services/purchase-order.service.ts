import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable, BehaviorSubject  } from 'rxjs/Rx';
import { AuthenticationService } from './authentication.service';
import { PurchaseOrder, Payment, CityAgency } from '../model/index';
import { Dealer } from '../model/dealer';
import { PoStatusType } from '../model/poStatusType';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  server: string = environment.nodeServer;
  currentAgency: CityAgency;
  currentPoIssueDateItem: Date;
  selectedPo: PurchaseOrder;
  private messageSource = new BehaviorSubject('default message');
  currentMessage = this.messageSource.asObservable();

  newPoId: number;

  url = this.server + '/api/transaction/bid/';
  cityAgencyUrl = this.server + '/api/cityAgency/';
  poUrl = this.server + '/api/transaction/';
  bidTypeUrl = this.server + '/api/bidType/';
  paymentUrl = this.server + '/api/transaction/payment/';
  deletePaymentUrl = this.server + '/api/transaction/payment/delete/';
  bidNumberUrl = this.server + '/api/bidNumberType/';
  vehicleTypeUrl = this.server + '/api/vehicleType/';
  insertPurchaseOrderUrl = this.server + '/api/transaction/';
  bidsUrl = this.server + '/api/transaction/bids/';
  specTypeUrl = this.server + '/api/specification/';
  poStatusTypeUrl = this.server + '/api/poStatusType/';
  agencyTypeUrl = this.server + '/api/agencyType/';
  poByIdUrl = this.server + '/api/transaction/';
  verifyTransHasPayment = this.server + '/api/transaction/verifyPayment/';
  poByPoIdUrl = this.server + '/api/transaction/po/';
  adminFeeUrl = this.server + '/api/bidType/';
  dealerUrl = this.server + '/api/dealer/';
  dealerAssocUrl = this.server + '/api/dealer/assoc/';
  deletePoUrl = this.server + '/api/transaction/delete/';
  paymentSearchUrl = this.server + '/api/transaction/bid/';
  paymentSearchByPoUrl = this.server + '/api/transaction/bid/po/';
  paymentSearchByPoStatusUrl =  this.server + '/api/transaction/bid/po/status/';


  // coupling between PO Detail and Item List
  public enableItemSection: boolean;

  setEnableItemSection(val: boolean) {
    this.enableItemSection = val;
  }

  isEnableItemSection(): boolean {
    return this.enableItemSection;
  }

  constructor(
    private http: Http,
    private authenticationService: AuthenticationService) {
      this.enableItemSection = true;
  }

  isReadOnly(): boolean {
    let readOnly = (localStorage.getItem('readOnly') == 'True');
    console.log(`readOnly = ${readOnly}`);
    return readOnly
  }

  changeMessage(message: string) {
    this.messageSource.next(message)
  }

  deletePurchaseOrder(id: number) {
    return this.http.get(this.deletePoUrl + id, this.jwt()).map((response: Response) => response.json());
  }

  deletePayment(id: number) {
    return this.http.get(this.deletePaymentUrl + id, this.jwt()).map((response: Response) => response.json());
  }

  createPayment(payment: Payment) {
    return this.http.post(this.paymentUrl, payment, this.jwt()).map((response: Response) => response.json());
  }

  createPurchaseOrder(purchaseOrder: PurchaseOrder) {
    return this.http.post(this.insertPurchaseOrderUrl, purchaseOrder, this.jwt()).map((response: Response) => response.json());
  }

  updatePurchaseOrder(purchasOrder: PurchaseOrder) {
    return this.http.put(this.poUrl, purchasOrder, this.jwt()).map((response: Response) => response.json());
  }

  getPostatusType(): Observable<PoStatusType[]> {
    return this.http.get(this.poStatusTypeUrl, this.jwt()).map((response: Response) =>
      response.json()).catch(this.handleError);
  }

  getByLogin(loginId: string): Observable<any> {
    return this.http.get(this.url + loginId, this.jwt()).map((response: Response) => response.json());
  }

  getPoHasPayment(id: number) {
    return this.http.get(this.verifyTransHasPayment + id, this.jwt()).map((response: Response) => response.json());
  }

  getPoById(id: number): Observable<PurchaseOrder> {
    return this.http.get(this.poByIdUrl + id, this.jwt()).map((response: Response) => response.json());
  }

  getPoByPoId(id: string): Observable<PurchaseOrder[]> {
    return this.http.get(this.poByPoIdUrl + id, this.jwt()).map((response: Response) => response.json());
  }

  getAdminFee(id: string) {
    return this.http.get(this.adminFeeUrl + id, this.jwt()).map((response: Response) => response.json());
  }

  getById(id: number) {
    return this.http.get(this.url + id, this.jwt()).map((response: Response) => response.json());
  }

  getDealerObservable(): Observable<Dealer[]> {
    return this.http.get(this.dealerUrl, this.jwt()).map((response: Response) =>
      response.json()).catch(this.handleError);
  }

  getPaymentObservable(id: number): Observable<Payment[]> {
    return this.http.get(this.paymentUrl, this.jwt()).map((response: Response) =>
      response.json()).catch(this.handleError);
  }

  getPayment(id: number) {
    return this.http.get(this.paymentUrl + id, this.jwt()).map((response: Response) => response.json());
  }

  getBids() {
    return this.http.get(this.bidsUrl, this.jwt()).map((response: Response) => response.json());
  }

  getBidType() {
    return this.http.get(this.bidTypeUrl, this.jwt()).map((response: Response) => response.json());
  }

  getByBidNumber(bidNumber: string): Observable<PurchaseOrder[]> {
    return this.http.get(this.url + bidNumber, this.jwt()).map((response: Response) => response.json());
  }

  searchPayment(bidNumber: string, status: string) {

    if (status.toUpperCase() === 'ALL') {
      console.log('paid and unpaid checked.  Want to see all');
      // Default behavior want to see all of them
    } else if (status.toUpperCase() === 'PAID') {
      console.log('paid chosen.  Want to see Paid');
      // show only the paid PO's
    } else if (status.toUpperCase() === 'UNPAID') {
      console.log('unpaid chosen.  Want to see UnPaid');
      // just show the paid
    }

    return this.http.get(this.paymentSearchUrl + bidNumber + '/' + status.toUpperCase(),
      this.jwt()).map((response: Response) => response.json());
  }

  searchPaymentByPoStatus(poStatus: string, bidNumber: string) {
    return this.http.get(this.paymentSearchByPoStatusUrl + poStatus + '/' + bidNumber, 
           this.jwt()).map((response: Response) => response.json());
  }

  searchPaymentByPo(poNumber: string) {
    return this.http.get(this.paymentSearchByPoUrl + poNumber, this.jwt()).map((response: Response) => response.json());
  }

  getBidNumber() {
    return this.http.get(this.bidNumberUrl, this.jwt()).map((response: Response) => response.json());
  }

  getItembyId(itemId: number) {
    return this.http.get(this.specTypeUrl + itemId, this.jwt()).map((response: Response) => response.json());
  }

  getItem(bidNumber: string) {
    return this.http.get(this.specTypeUrl + bidNumber, this.jwt()).map((response: Response) => response.json());
  }

  getItemType(bidNumber: string, itemId: string) {
    return this.http.get(this.vehicleTypeUrl + bidNumber + '/' + itemId, this.jwt()).map((response: Response) => response.json());
  }

  getCityAgency() {
    return this.http.get(this.cityAgencyUrl, this.jwt()).map((response: Response) => response.json());
  }

  getCityAgencyByName(agencyName: string) {
    return this.http.get(this.cityAgencyUrl + agencyName, this.jwt()).map((response: Response) => response.json());
  }

  getPayCode(agencyName: string) {
    return this.http.get(this.agencyTypeUrl + agencyName, this.jwt()).map((response: Response) => response.json());
  }

  getDealer() {
    return this.http.get(this.dealerUrl, this.jwt()).map((response: Response) => response.json());
  }

  getDealerAssoc(bidNumber: string) {
    return this.http.get(this.dealerAssocUrl + bidNumber, this.jwt()).map((response: Response) => response.json());
  }

  /*
  insertPurchaseOrder(purchaseOrder: PurchaseOrder) {
    return this.http.post(insertPurchaseOrderUrl, purchaseOrder, this.jwt()).map((response: Response) => response.json());
  }
  */

  updatePayment(payment: Payment) {
    const fug = this.paymentUrl + payment.id;
    return this.http.put(fug, payment, this.jwt()).map((response: Response) => response.json());
  }

  private handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
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
