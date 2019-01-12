import { Component, Input, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Idle } from 'idlejs/dist';
import { DatePipe } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { GiphiesService } from '../../services/giphies.service'

import { LoggedUser } from '../../services/logged-user.service'
import { User } from '../../interfaces/user'
import { Giphy } from '../../interfaces/giphy'
import { ChatMessage, ChatMessageType } from '../../interfaces/chat-message'

import { Action } from '../../services/chat.service';
import { Event } from '../../services/chat.service';
import { from } from 'rxjs';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ChatComponent implements OnInit {
  @ViewChild('contentScroll') private contentScroll: ElementRef;
  @ViewChild('sendMessageInput') private sendMessageInput: ElementRef;

  // action = Action;
  idle: Idle;
  ioConnection: any;

  user: User;
  chatMessageType = ChatMessageType;
  messages: ChatMessage[] = [];
  usersConnected: User[] = [];
  usersTyping: User[] = [];
  giphies: Giphy[] = [];

  showActionMenu: boolean = false;
  newMsg: string;
  content: string;

  constructor(
    private chatService: ChatService,
    private giphiesService: GiphiesService,
    private loggedUser: LoggedUser
  ) 
  { 
    this.user = this.loggedUser.data;
  }


  ngOnInit(): void {
    this.initIoConnection();
    this.initAutoLogout();
    this.sendMessageInput.nativeElement.focus();
    this.initGiphies();
  }

  // initialization
  private initIoConnection(): void {
    this.chatService.initSocket();

    // user reveived //
    this.ioConnection = this.chatService.onUserConnected().subscribe((usersData: string) => {
        var users = JSON.parse(usersData);
        this.usersConnected = users;
    });
    
    // message received //
    this.ioConnection = this.chatService.onMessage().subscribe((message: ChatMessage) => {
        this.messages.push(message);
        this.scrollToBottom();
    });

    // type received //
    this.ioConnection = this.chatService.onType().subscribe((usersData: string) => {
        var users = JSON.parse(usersData);
        this.usersTyping = users;
    });

    // file received
    this.ioConnection = this.chatService.onFile().subscribe((message: ChatMessage) => {
        this.messages.push(message);
    });


    // close all tabs meesage
    this.ioConnection = this.chatService.onCloseAllTabs().subscribe((data: string) => {
        console.log('CLOSING ALL TABS!!!');
        // window.location.href = '/';
        window.location.href = 'https://www.the-art-company.com/es/';
    })
    
    // events //
    this.chatService.onEvent(Event.CONNECT).subscribe(() => {
        console.log('Connected to Chat of Masters');
        this.chatService.sendUser(this.user);
    });
      
    this.chatService.onEvent(Event.DISCONNECT).subscribe(() => {
        console.log('Disconnected of chat');
    });
  }

  private initAutoLogout(): void {
    this.idle = new Idle()
      .whenNotInteractive()
      .within(10)
      .do(() => {
        console.log('Closing tab after security time');
        window.location.href = '/';
      })
      .start();
  }

  private initGiphies(): void {
    console.log('Initializing giphies');
    this.giphiesService.getGiphies().subscribe(
      data => { this.giphies = data },
      err => console.log(err)
    );
  }

  public menu() {
    this.showActionMenu = !this.showActionMenu;
  }

  private scrollToBottom() {
    try {
        this.contentScroll.nativeElement.scrollTop = this.contentScroll.nativeElement.scrollHeight;
    } catch(err) { }
  }


  // giphies
  // private loadGiphiesOnList(data) {
    
  // }

  

  
  // custom properties
  private _userTypingString = '';
  @Input()
  get userTypingString(): string { 
    if (!this.usersTyping.length) return '';
    var retval = '';    
    for (var i=0; i<this.usersTyping.length; i++) {
      var u:User = this.usersTyping[i];
      retval += u.masterName+', ';
    }
    retval += (this.usersTyping.length > 1) ? ' are typing...' : ' is typing...';
    return retval;
  }


  // chat methods
  public typeMessage(event: any) {
    if (event.key === "Enter") {
      this.sendMessage(event);
    }else{
      this.sendTyping(event);
    }
  }

  public sendMessage(event: any): boolean {
  // public sendMessage(message: string): void {
      if (event) event.stopPropagation();
      if (!this.newMsg) return false;
      var newMessage = this.newMsg.trim();
      if (newMessage.length <= 0) return false;
      
      newMessage = this.filterMessage(newMessage);
      this.chatService.sendMessage({
        user: this.user,
        content: newMessage,
        date: Date.now(),
        type: ChatMessageType.TEXT
      });

      this.newMsg = '';

      this.scrollToBottom();
      return false;
  }

  public sendTyping(event: any): void {
    this.chatService.sendTyping({
      user: this.user,
      content: this.newMsg, 
      date: Date.now(),
      type: ChatMessageType.TEXT
    });
  }

  public sendInputFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (e: any) => {
        console.log('File readed OK');
        // console.log(e.target.result)
        this.chatService.sendFile({
          user: this.user,
          content: e.target.result,
          date: Date.now(),
          type: ChatMessageType.FILE
        });
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  } 

  public closeAllTabs() {
    this.chatService.sendCloseAllTabs();
  }


  public replyMessage(message: ChatMessage) {
    console.log(message);
    var replyHtml = `<span class="reply-msg">Reply to: (${ message.user.masterName }) ${ message.content }</div>`;
    this.newMsg = replyHtml;
    this.sendMessageInput.nativeElement.focus();
    // console.log(replyHtml);
    // this.sendMessageInput.nativeElement.insertAdjacentHTML('afterbegin', replyHtml);
  }

  public sendNotification(params: any, action: Action): void {
    let message: ChatMessage;

    // if (action === Action.JOINED) {
    //   message = {
    //     user: this.user,
    //     action: action
    //   }
    // } else if (action === Action.RENAME) {
    //   message = {
    //     action: action,
    //     user: this.user
    //   };
    // }
    message = {
      user: this.user,
      content: this.newMsg,
      date: Date.now(),
      type: ChatMessageType.TEXT
    }

    this.chatService.sendMessage(message); 
  }

  public filterMessage(message: string): string {
    var words = message.split(' ');
    return words.map(word => {
      if (word === word.toUpperCase()) {
        return `<strong>${ word.toLowerCase() }</strong>`;
      }else{
        return word;
      }
    })
    .join(' ')
    .replace(/(\\r\\n)|([\r\n])/gmi, '<br/>');
  }
}
