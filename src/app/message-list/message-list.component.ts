import { Component, NgZone, ViewChild, OnInit,  OnDestroy, AfterViewInit, Input, ViewEncapsulation } from '@angular/core';
import {MatPaginator, MatTableDataSource , MatSort, MatMenu, MatCard} from '@angular/material';
import { Message } from '../model/index';
import { UserService } from '../services/user.service';
import { MessageService } from '../services/message.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription , Observable} from 'rxjs';
import { SimpleTimer } from 'ng2-simple-timer';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./message-list.component.scss']
})

export class MessageListComponent implements OnInit,  AfterViewInit,  OnDestroy {
  public editRow: boolean;
  public showAttachment: boolean;
  displayedColumns = ['from', 'message',  'created', 'address', 'reply', 'close', 'attachment'];
  messageDataSource = new MatTableDataSource();
  subscription: Subscription;
  selectedMessage: Message;
  newMessage: Message;
  messages: Message[] = [];
  observableMessages: Observable<Message[]>;
  timerId: string;
  @Input() name;

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;


  constructor(private messageService: MessageService, private toastr: ToastrService, private st: SimpleTimer,
    private modalService: NgbModal, private ngZone: NgZone) {
   }

   ngOnDestroy() {
    this.st.unsubscribe(this.timerId);
    console.log('calling ngOnDestroy');
  }

   open(content, message: Message) {
     this.selectedMessage = message;
    this.modalService.open(content, { windowClass: 'dark-modal' });
  }

   ngAfterViewInit() {
    this.messageDataSource.sort = this.sort;
    this.messageDataSource.paginator = this.paginator;
  }

  showAttachmentComponent(message: Message): void {
    this.selectedMessage = message;
    this.showAttachment = true;

  }

  onSelect(message: Message): void {
    this.selectedMessage = message;
    this.newMessage = new Message();
    this.newMessage.threadId = this.selectedMessage.threadId;
    this.newMessage.messageId = this.selectedMessage.messageId;
    this.newMessage.threadStatus = 'open';
    this.newMessage.message = '';
    this.editRow = true;
    this.showAttachment = false;

    console.log(this.selectedMessage.message);


  }

  findAll() {

    this.messageService.getAll()
    .subscribe(messages => {
        this.messages = messages;
        this.messageDataSource.data = messages;
    });

  }

  ngOnInit() {
     // get messages from secure api end point
  // this.subscription = this.messageService.getAll().subscribe(message => { this.messages = message; });
  this.findAll();
  this.st.newTimer('timeout', 5);
  this.timerId = this.st.subscribe('timeout', () => this.findAll());

  }

  applyMessageFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.messageDataSource.filter = filterValue;
  }

  closeThread(message: Message) {

    this.messageService.closeThread(message).subscribe(
      data => {
        this.toastr.success('Thread Closed Successfully', '', {
          timeOut: 2000,
        });
      },
      error => {
        this.toastr.success('Thread Close Error' + error, 'Thread Error', {
          timeOut: 2000,
        });
      });

      this.editRow = false;
      this.showAttachment = false;
      this.findAll();

  }

  showFbIcon(): boolean {
    return this.selectedMessage.from === 'FaceBook';
  }

  showFbIconRow(message: Message): boolean {
    console.log(message.from);
    return message.from === 'FaceBook';
  }

  showTwitterIconRow(message: Message): boolean {
    console.log(message.from);
    return message.from === 'Twitter';
  }
 // return (isMember ? "$2.00" : "$10.00");

  getClass(message: Message): string {
    return message.from === 'FaceBook' ? 'facebook' : 'wcso';
  }

  showFbIconRowEnabled(message: Message): boolean {
    // console.log(message.from);
    return true;
  }


  sendMessage() {

    this.toastr.info('Sending Message', '', {
      timeOut: 2000,
    });

    this.messageService.sendMessage(this.newMessage).subscribe(
      data => {
        this.toastr.success('Message Sent Successfully', '', {
          timeOut: 2000,
        });
    //    this.findAll();
      },
      error => {
        this.toastr.success('Message Error' + error, 'Message Error', {
          timeOut: 3000,
        });
      });

      this.editRow = false;

  }

}
