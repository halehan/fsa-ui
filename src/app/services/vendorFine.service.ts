import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { AuthenticationService } from './authentication.service';
import { Constants } from '../constants';
import { PurchaseOrder, VendorFine, VendorFinePayment } from '../model/index';
import { Dealer } from '../model/dealer';
import { BidNumber } from '../model/bidNumber';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class VendorFineService {

    server: string = environment.nodeServer;
    vendorFineUrl = this.server + '/api/vendor/fine/';
    dealerUrl = this.server + '/api/dealer/';
    bidUrl  =  this.server + '/api/transaction/bids';
    vendorPayments = this.server + '/api/vendor/fine/payment/'
    

    constructor(
        private http: Http,
        private authenticationService: AuthenticationService) {
    }

    getAllBids(): Observable<BidNumber[]> {
        return this.http.get(this.bidUrl, this.jwt()).map((response: Response) => response.json());
    }

    getAllDealers(): Observable<Dealer[]> {
        return this.http.get(this.dealerUrl, this.jwt()).map((response: Response) => response.json());
    }

    getVendorFines(): Observable<VendorFine[]> {
        return this.http.get(this.vendorFineUrl, this.jwt()).map((response: Response) => response.json());
    }

    getVendorFineByVendor(id: number): Observable<VendorFine[]> {
        const localUrl = this.vendorFineUrl + id;
        return this.http.get(localUrl, this.jwt()).map((response: Response) => response.json());
    }

    getVendorFinePaymentsByVendor(id: number): Observable<VendorFine[]> {
        const localUrl = this.vendorPayments + id;
        return this.http.get(localUrl, this.jwt()).map((response: Response) => response.json());
    }

    delete(id: number) {
       // api/vendor/fine/delete/
        const delUrl: string = this.vendorFineUrl + 'delete/' + id;
        console.log(delUrl);
        const rt: Observable<VendorFine[]> = this.http.delete(delUrl, this.jwt()).map((response: Response) => response.json());
        return rt;
    }

    deleteFinePayment(id: number) {
        // /api/vendor/fine/payment/delete/:id
         const delUrl: string = this.vendorPayments + 'delete/' + id;
         console.log(delUrl);
         const rt: Observable<VendorFine[]> = this.http.get(delUrl, this.jwt()).map((response: Response) => response.json());
         return rt;
     }

    update(vendorFine: VendorFine) {
        const fug = this.vendorFineUrl + vendorFine.id;
        return this.http.put(fug, vendorFine, this.jwt()).map((response: Response) => response.json());
    }

    async insert(vendorFine: VendorFine) {
        const fug = this.vendorFineUrl;
        return this.http.post(fug, vendorFine, this.jwt()).map((response: Response) => response.json());
    }

    updatePayment(vendorFinePayment: VendorFinePayment) {
        const fug = this.vendorPayments + vendorFinePayment.id;
        return this.http.put(fug, vendorFinePayment, this.jwt()).map((response: Response) => response.json());
    }

    insertPayment(vendorFinePayment: VendorFinePayment) {
        const fug = this.vendorPayments;
        return this.http.post(fug, vendorFinePayment, this.jwt()).map((response: Response) => response.json());
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
