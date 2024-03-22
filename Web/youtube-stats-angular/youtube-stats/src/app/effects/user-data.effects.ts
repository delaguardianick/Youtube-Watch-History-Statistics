import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap } from 'rxjs/operators';
import { Observable, EMPTY, of } from 'rxjs';
import { UserDataActions } from '../actions/user-data.actions';


@Injectable()
export class UserDataEffects {

  loadUserDatas$ = createEffect(() => {
    return this.actions$.pipe(

      ofType(UserDataActions.loadUserDatas),
      concatMap(() =>
        /** An EMPTY observable only emits completion. Replace with your own observable API request */
        EMPTY.pipe(
          map(data => UserDataActions.loadUserDatasSuccess({ data })),
          catchError(error => of(UserDataActions.loadUserDatasFailure({ error }))))
      )
    );
  });


  constructor(private actions$: Actions) {}
}
