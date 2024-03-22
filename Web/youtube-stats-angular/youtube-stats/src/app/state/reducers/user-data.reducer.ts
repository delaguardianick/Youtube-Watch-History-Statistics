// import { createFeature, createReducer, on } from '@ngrx/store';
// import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// import { UserData } from '../models/user-data.model';
// import { UserDataActions } from '../actions/user-data.actions';

// export const userDatasFeatureKey = 'userDatas';

// export interface State extends EntityState<UserData> {
//   // additional entities state properties
// }

// export const adapter: EntityAdapter<UserData> = createEntityAdapter<UserData>();

// export const initialState: State = adapter.getInitialState({
//   // additional entity state properties
// });

// export const reducer = createReducer(
//   initialState,
//   on(UserDataActions.addUserData,
//     (state, action) => adapter.addOne(action.userData, state)
//   ),
//   on(UserDataActions.upsertUserData,
//     (state, action) => adapter.upsertOne(action.userData, state)
//   ),
//   on(UserDataActions.addUserDatas,
//     (state, action) => adapter.addMany(action.userDatas, state)
//   ),
//   on(UserDataActions.upsertUserDatas,
//     (state, action) => adapter.upsertMany(action.userDatas, state)
//   ),
//   on(UserDataActions.updateUserData,
//     (state, action) => adapter.updateOne(action.userData, state)
//   ),
//   on(UserDataActions.updateUserDatas,
//     (state, action) => adapter.updateMany(action.userDatas, state)
//   ),
//   on(UserDataActions.deleteUserData,
//     (state, action) => adapter.removeOne(action.id, state)
//   ),
//   on(UserDataActions.deleteUserDatas,
//     (state, action) => adapter.removeMany(action.ids, state)
//   ),
//   on(UserDataActions.loadUserDatas,
//     (state, action) => adapter.setAll(action.userDatas, state)
//   ),
//   on(UserDataActions.clearUserDatas,
//     state => adapter.removeAll(state)
//   ),
// );

// export const userDatasFeature = createFeature({
//   name: userDatasFeatureKey,
//   reducer,
//   extraSelectors: ({ selectUserDatasState }) => ({
//     ...adapter.getSelectors(selectUserDatasState)
//   }),
// });

// export const {
//   selectIds,
//   selectEntities,
//   selectAll,
//   selectTotal,
// } = userDatasFeature;
