import { Component, SystemJsNgModuleLoader, OnInit } from "@angular/core";
import * as Stomp from "stompjs";
import * as SockJS from "sockjs-client";

import { MatDialog } from "@angular/material";
import { ResponseData } from "../responseData";
import { MultiPlayerRulesComponent } from "../multi-player-rules/multi-player-rules.component";
import { MultiPlayerService } from "../multi-player.service";

import { timer } from "rxjs/observable/timer"; // (for rxjs < 6) use 'rxjs/observable/timer'
import { take, map } from "rxjs/operators";

@Component({
  selector: "app-multi-player-game",
  templateUrl: "./multi-player-game.component.html",
  styleUrls: ["./multi-player-game.component.css"]
})
export class MultiPlayerGameComponent implements OnInit {
  countDown;
  count: any;
  data: string[] = [];
  options: string[] = [];
  showConversation: Boolean = false;
  ws: any;

  questions: ResponseData;
  userName: string;
  questionId: string;
  questionStamp: string;

  op1: string;
  op2: string;
  op3: string;
  op4: string;

  selectedAnswer: string;
  correctAns: any;
  startTime: number;
  totalTime: number;

  disabled: boolean;
  disableDiv = false;

  message: any;
  i = 0;
  check = "123";
  userData: any;
  score: string;
  user: number[] = [];
  counter = 1;

  users = [
    { uId: 101, userName: "Ajay", score: 0 },
    { uId: 102, userName: "Fazeel", score: 0 },
    { uId: 103, userName: "Ajinkya", score: 0 },
    { uId: 104, userName: "Satyaki", score: 0 }
  ];

  constructor(
    public dialog: MatDialog,
    private multiPlayerService: MultiPlayerService
  ) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(MultiPlayerRulesComponent, {
      width: "350px",
      height: "350px"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed");
    });
  }

  toggleDisable() {
    this.disableDiv = !this.disableDiv;
  }

  connect() {
    const socket = new WebSocket("ws://172.23.239.201:8080/greeting");
    // var ws = new WebSocket('ws://172.23.238.182:8080/api/v1/clock');
    this.ws = Stomp.over(socket);
    let that = this;
    // const userData = JSON.stringify({userId: '100'});
    this.ws.connect(
      {},
      function(frame) {
        that.ws.subscribe("/errors", function(message) {
          alert("Error " + message.body);
        });

        that.ws.subscribe("/topicQuestion/reply", function(message) {
          console.log("Response data is ==========> :" + message);
          // this.multiPlayerService.seconds = 20;
          that.showGreeting(message.body);
        });

        that.ws.subscribe("/user/topicResponse/reply", function(message) {
          console.log("Response data is ==========> :" + message);
          // this.multiPlayerService.seconds = 20;
          that.showGreeting(message.body);
        });

        that.disabled = true;
      }

      // this function is used to show alert box when disconnect socket
      // function(error) {
      //   alert('STOMP error ' + error);
      // }
    );
  }
  disconnect() {
    if (this.ws != null) {
      this.ws.ws.close();
    }
    this.setConnected(false);
    console.log("Disconnected");
  }

  sendResponse() {
    console.log("Data Send ==========>");
    const dd = JSON.stringify({
      userId: "101",
      questionStamp: "dummy data",
      questionId: "110",
      selectedResponse: "any",
      correctAns: "any",
      endTime: "0",
      score: "0"
    });
    console.log("edelwksamdkmsdasmk==============>" + dd);
    this.ws.send("/app/messageOpen", {}, dd);
  }

  sendAnswer(answer) {
    this.selectedAnswer = answer;
    console.log("answer coming from client is ", answer);
    const ans = JSON.stringify({
      userId: "101",
      questionStamp: this.questionStamp,
      questionId: this.questionId,
      selectedResponse: this.selectedAnswer,
      correctAns: this.correctAns,
      score: this.score,
      endTime: JSON.stringify(this.count)
    });
    console.log("end time =>>>>>>>>>>>>>>>>>>>>" + this.count);
    // this.ws.send("/app/privateMessage", {}, ans);
    this.ws.send("/app/privateMessage", {}, ans);
  }

  sendAnswerToAll(answer) {
    this.selectedAnswer = answer;
    console.log("answer coming from client is ", answer);

    const ans = JSON.stringify({
      userId: "101",
      questionStamp: this.questionStamp,
      questionId: this.questionId,
      selectedResponse: this.selectedAnswer,
      correctAns: this.correctAns,
      score: this.score,
      endTime: JSON.stringify(this.count)
    });
    console.log("end time =>>>>>>>>>>>>>>>>>>>>" + this.count);
    // this.ws.send("/app/privateMessage", {}, ans);
    if (this.counter < 2) {
      this.sendAnswer(answer);
      this.counter++;
    } else {
      this.ws.send("/app/messageOpen", {}, ans);
    }
  }

  showGreeting(message) {
    // clearInterval(this.multiPlayerService.timer);

    this.showConversation = true;
    // console.log('Type of Data =====> ' + typeof message);
    const rep = message
      .replace("{", "")
      .replace("}", "")
      .replace(/"/g, "");
    const quest = rep.split(",");

    for (let j = 0; j <= quest.length; j++) {
      this.data[j] = quest[j];
    }

    this.questionId = this.data[0].split(":")[1];
    console.log(this.questionId);
    this.questionStamp = this.data[1].split(":")[1];
    console.log(this.questionStamp);
    this.op1 = this.data[2].split(":")[1];
    this.op2 = this.data[3].split(":")[1];
    this.op3 = this.data[4].split(":")[1];
    this.op4 = this.data[5].split(":")[1];
    this.correctAns = this.data[6].split(":")[1];
    console.log("Correct Ans" + this.correctAns);
    // tslint:disable-next-line:radix
    this.totalTime = parseInt(this.data[7].split(":")[1]);
    // this.user[0] = parseInt(this.data[10].split(':')[1]);
    console.log(this.totalTime);
    // this.multiPlayerService.seconds = this.totalTime;

    this.startTimer();
  }
  startTimer() {
    // this.multiPlayerService.timer = setInterval(() => {
    //   this.multiPlayerService.seconds--;
    //   if (this.multiPlayerService.seconds < 1) {
    //     //this.sendAnswer('');
    //   }
    // });
    // let count = 10;

    this.count = 15;
    this.countDown = timer(0, 1000).pipe(
      take(this.count),
      map(() => --this.count)
    );
    if (this.countDown < 1) {
      this.sendAnswer("");
    }
  }

  setConnected(connected) {
    this.disabled = connected;
    this.showConversation = connected;
    this.data = [];
  }

  ngOnInit() {
    this.connect();
    // this.multiPlayerService.seconds = 20;
  }
}
