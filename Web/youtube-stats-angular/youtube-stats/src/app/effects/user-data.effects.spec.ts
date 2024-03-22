import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { UserDataEffects } from './user-data.effects';

describe('UserDataEffects', () => {
  let actions$: Observable<any>;
  let effects: UserDataEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserDataEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(UserDataEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
