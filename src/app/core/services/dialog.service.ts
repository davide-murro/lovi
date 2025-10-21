import { Injectable, signal, Type } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { DialogState } from '../models/dialog-state.model';
import { DialogConfig } from '../models/dialog-config.model';
import { LogDialog } from '../../shared/log-dialog/log-dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private _dialog = signal<DialogState>({
    component: null,
    visible: false,
  });
  dialog = this._dialog.asReadonly();

  private _result$?: Subject<any>;

  open<TData = any, TResult = any>(
    component: Type<any>,
    config?: DialogConfig<TData>
  ): Observable<TResult> {
    this._result$ = new Subject<TResult>();
    this._dialog.set({ component, config, visible: true });
    return this._result$.asObservable();
  }

  close<TResult = any>(result?: TResult) {
    this._dialog.set({ ...this._dialog(), visible: false });
    this._result$?.next(result);
    this._result$?.complete();
  }

  // Shortcut for confirm dialogs
  confirm(title: string, message: string): Observable<boolean> {
    return this.open(ConfirmDialog, { 
      title, 
      data: { message }, 
      type: 'info'
    });
  }

  // Shortcut for log dialogs
  log(title: string, message: string, options?: Partial<DialogConfig>): Observable<boolean> {
    return this.open(LogDialog, { ...options, title, data: { message } });
  }
}
