import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SupabaseService } from './services/supabase.service';
import { PowerSyncService } from './services/powersync.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private sessionSub!: Subscription;

  constructor(
    private supabaseService: SupabaseService,
    private powerSyncService: PowerSyncService,
  ) {}

  ngOnInit(): void {
    this.sessionSub = this.supabaseService.session$
      .pipe(filter((session) => session !== null))
      .subscribe(() => {
        this.powerSyncService.init();
      });
  }

  ngOnDestroy(): void {
    this.sessionSub?.unsubscribe();
    this.powerSyncService.disconnect();
  }
}
