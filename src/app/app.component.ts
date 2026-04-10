import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { PowerSyncService } from './services/powersync.service';
import { AttachmentQueueManager } from './services/attachment-queue.manager';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly powerSyncService = inject(PowerSyncService);
  private readonly attachmentQueueManager = inject(AttachmentQueueManager);

  private sessionSub!: Subscription;

  ngOnInit(): void {
    this.sessionSub = this.auth.session$
      .pipe(filter((session) => session !== null))
      .subscribe(async () => {
        await this.powerSyncService.init();
        await this.attachmentQueueManager.init();
      });
  }

  ngOnDestroy(): void {
    this.sessionSub?.unsubscribe();
    this.attachmentQueueManager.stop();
    this.powerSyncService.disconnect();
  }
}
