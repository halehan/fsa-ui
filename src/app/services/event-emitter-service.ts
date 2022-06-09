import { Injectable, EventEmitter } from '@angular/core';    
import { Subscription } from 'rxjs/internal/Subscription';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  invokeRefreshPoDetailFunction = new EventEmitter();   
  subscription: Subscription;    
    
  constructor() { }    
    
  onRefreshPoDetail(poId: number) {    
    this.invokeRefreshPoDetailFunction.emit(poId);    
  } 

}
