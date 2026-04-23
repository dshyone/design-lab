import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  readonly triggerAdd$ = new Subject<void>();

  triggerAdd() {
    this.triggerAdd$.next();
  }
}
