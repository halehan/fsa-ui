import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { AuthenticationService } from './authentication.service';
import { Constants } from '../constants';
import { PurchaseOrder, Payment, AgencyType, Item } from '../model/index';
import { Dealer } from '../model/dealer';
import { environment } from '../../environments/environment';




// app.get("/api/item/bid/:bidId", fsaCodeServices.getItemTypeByBid);
// app.get("/api/item/:bidId/:itemId", fsaCodeServices.getItemType);

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  server: string = environment.nodeServer;

  url = this.server + '/api/transaction/bid/';
  dealerUrl = this.server + '/api/dealer/';
  paymentUrl =  this.server +  '/api/transaction/payment/';
  vehicleTypeUrl = this.server + '/api/vehicleType/';
  itemPoUrl = this.server + '/api/item/purchaseOrder/';
  agencyTypeUrl = this.server + '/api/agencyType/';
  itemByIdUrl =  this.server + '/api/item/bid/';
  itemUrl = this.server + '/api/item/';
  derivedItemUrl = this.server + '/api/item/derived/';
  feeUrl = this.server +  '/api/fee/';

  itemBidCodeByIdUrl = this.server +  '/api/item/id/';
  paymentByItemIdUrl = this.server +  '/api/transaction/payment/';
  itemDeleteUrl =   this.server +  '/api/item/delete/';
  itemDeleteByPoUrl =   this.server +  '/api/item/delete/po';
  itemAmtByPoId =   this.server +  '/api/item/sum/';

  constructor(
    private http: Http,
    private authenticationService: AuthenticationService) {
}

getItemHasPayment(id: number) {
  return this.http.get(this.itemUrl + 'verifyPayment/' + id, this.jwt()).map((response: Response) => response.json());
}

getPayCodes() {
  return this.http.get(this.itemUrl, this.jwt()).map((response: Response) => response.json());
}

getItemAmountByPoId(id: number) {
  const localUrl: string = this.itemAmtByPoId + id;
  return this.http.get(localUrl, this.jwt()).map((response: Response) => response.json());
}


getPaymentByItemId(id: number) {
  const localUrl: string = this.paymentByItemIdUrl + id;
  return this.http.get(localUrl, this.jwt()).map((response: Response) => response.json());
}


getFee(payee: string, bidType: string, payCd: string) {
  console.log(payee + '  '  + bidType + '  ' + payCd);
  const fee: string = this.feeUrl + payee + '/' + bidType + '/' + payCd;
  return this.http.get(fee, this.jwt()).map((response: Response) => response.json());
}

getDealerObservable(): Observable<Dealer[]> {
  return this.http.get(this.dealerUrl, this.jwt()).map((response: Response) =>
    response.json()).catch(this.handleError);
}

getPayment(id: number) {
  return this.http.get(this.paymentUrl + id, this.jwt()).map((response: Response) => response.json());
}

// Get List of Items for selected PO
getItemByPo(poId: number) {
  return this.http.get(this.itemPoUrl + poId, this.jwt()).map((response: Response) => response.json());
}

// Get Item details per ItemNumber
deleteItem(itemId: number, updatedBy: string) {
  return this.http.get(this.itemDeleteUrl + itemId + '/' + updatedBy , this.jwt()).map((response: Response) => response.json());
}

deleteItemsByPo(poId: number) {
  return this.http.get(this.itemDeleteByPoUrl + poId, this.jwt()).map((response: Response) => response.json());
}

// Get Item details per ItemNumber
getItemById(itemId: number) {
  return this.http.get(this.itemUrl + itemId, this.jwt()).map((response: Response) => response.json());
}

// For select value for an Item.  First select the Item Type this will bring back large number of
// rows as defined for the bid FsaCppBidItemCodes 
getItemByBidId(bidId: string) {
  return this.http.get(this.itemByIdUrl + bidId, this.jwt()).map((response: Response) => response.json());
}

// Small subset of items that are filtered based on the bidNumber and the ItemNumber from the code table FsaCppBidItemCodes 
getItemType(bidNumber: string, itemId: number) {
  return this.http.get(this.itemUrl + bidNumber + '/' + itemId, this.jwt()).map((response: Response) => response.json());
}

getItemByBidCodeId(id: string) {
  return this.http.get(this.itemBidCodeByIdUrl + id, this.jwt()).map((response: Response) => response.json());
}

getDerivedItem(bidNumber: string, itemNumber: number, itemType: string) {
  const encoded = encodeURI(this.derivedItemUrl + bidNumber + '/' +  itemNumber + '/' + itemType);
  return this.http.get(encoded,
   this.jwt()).map((response: Response) => response.json());
}

getPayCode(agencyName: string) {
  return this.http.get(this.agencyTypeUrl + agencyName, this.jwt()).map((response: Response) => response.json());
}

updatePayment(payment: Payment) {
  const fug = this.paymentUrl + payment.id;

 return this.http.put(fug, payment, this.jwt()).map((response: Response) => response.json());
}

updateItem(item: Item) {
 const fug = encodeURI(this.itemUrl);
 return this.http.put(fug, item, this.jwt()).map((response: Response) => response.json());
}

  insertItem(item: Item) {
  const fug = this.itemUrl;
 return this.http.post(fug, item, this.jwt()).map((response: Response) => response.json());
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

getByBidNumber(bidNumber: string): Observable<PurchaseOrder[]> {
  return this.http.get(this.url + bidNumber, this.jwt()).map((response: Response) => response.json());
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
