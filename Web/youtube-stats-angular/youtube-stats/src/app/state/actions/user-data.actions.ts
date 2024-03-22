// import { createActionGroup, emptyProps, props } from '@ngrx/store';
// import { Update } from '@ngrx/entity';

// import { UserData } from '../models/user-data.model';

// export const UserDataActions = createActionGroup({
//   source: 'UserData/API',
//   events: {
//     'Load UserDatas': props<{ userDatas: UserData[] }>(),
//     'Add UserData': props<{ userData: UserData }>(),
//     'Upsert UserData': props<{ userData: UserData }>(),
//     'Add UserDatas': props<{ userDatas: UserData[] }>(),
//     'Upsert UserDatas': props<{ userDatas: UserData[] }>(),
//     'Update UserData': props<{ userData: Update<UserData> }>(),
//     'Update UserDatas': props<{ userDatas: Update<UserData>[] }>(),
//     'Delete UserData': props<{ id: string }>(),
//     'Delete UserDatas': props<{ ids: string[] }>(),
//     'Clear UserDatas': emptyProps(),
//   }
// });
