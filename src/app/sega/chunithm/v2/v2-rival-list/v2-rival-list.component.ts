import {Component} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {ChusanProfile, ChusanRival} from '../model/ChusanRival';
import {ApiService} from '../../../../api.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthenticationService} from '../../../../auth/authentication.service';
import {MessageService} from '../../../../message.service';
import {HttpParams} from '@angular/common/http';
import {StatusCode} from '../../../../status-code';

enum V2RivalAPI {
  Rival = 'api/game/chuni/v2/rival',
  Friend = 'api/game/chuni/v2/friend',
  Profiles = 'api/user/profiles',
  ToggleFavorite = 'api/game/chuni/v2/toggleFavorite',
}

@Component({
  selector: 'app-v2-rival-list',
  templateUrl: './v2-rival-list.component.html',
  styleUrls: ['./v2-rival-list.component.css']
})
export class V2RivalListComponent {
  host = environment.assetsHost;
  friendList: ChusanRival[] = [];
  chusanProfile: ChusanProfile;
  loadingProfile = true;
  loadingRival = true;
  aimeId: string;

  inputAddRivalUserId = '';

  constructor(
    private api: ApiService,
    private modalService: NgbModal,
    protected auth: AuthenticationService,
    private messageService: MessageService,
  ) {
  }

  ngOnInit() {
    this.aimeId = String(this.auth.currentAccountValue.currentCard.extId);
    const param = new HttpParams().set('aimeId', this.aimeId);

    this.api.get(V2RivalAPI.Friend, param).subscribe(
      (data) => {
        this.refreshFrom(data);
        console.log('friend:', data);
      },
      error => {
        this.messageService.notice(`get friend list failed: ${error}`);
      }
    );

    this.api.get(V2RivalAPI.Profiles).subscribe(
      resp => {
        if (resp?.status) {
          const statusCode: StatusCode = resp.status.code;
          if (statusCode === StatusCode.OK && resp.data) {
            this.chusanProfile = resp.data.chusan;
          }
          else {
            this.messageService.notice(resp.status.message);
          }
          this.loadingProfile = false;
        }
      }
    );
  }

  refreshFrom(friendList: ChusanRival[]) {
    this.friendList = friendList;
    this.loadingRival = false;
  }

  addFriend() {
    const param = new HttpParams().set('friendId', (Number).parseInt(this.inputAddRivalUserId)).set('aimeId', this.aimeId);
    this.api.post(V2RivalAPI.Friend, param).subscribe(
      data => {
        if (data) { this.ngOnInit(); }
      },
      error => this.messageService.notice(`add rival failed: ${error}`)
    );
  }

  removeFriend(rivalUserId: string) {
    const param = new HttpParams().set('friendId', (Number).parseInt(rivalUserId)).set('aimeId', this.aimeId);
    this.api.delete(V2RivalAPI.Friend, param).subscribe(
      () => {
        const newList = this.friendList.filter(item => item.rivalId !== rivalUserId);
        this.messageService.notice(`(id:${rivalUserId}) delete successfully.`);
        this.refreshFrom(newList);
      },
      error => this.messageService.notice(`remove rival failed: ${error}`)
    );
  }

  toggleFavorite(rivalUserId: string) {
    console.log(rivalUserId);
    const param = new HttpParams().set('friendId', (Number).parseInt(rivalUserId)).set('aimeId', this.aimeId);
    this.api.get(V2RivalAPI.ToggleFavorite, param).subscribe(
      (data) => {
        this.messageService.notice(`id: ${rivalUserId} toggle Favorite Over!`);
      }
    );
  }

  open(content) {
    this.modalService.open(content, {centered: true});
  }
}
