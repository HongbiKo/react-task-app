import { configureStore } from '@reduxjs/toolkit';
import reducer from './reducer/reducer';

const store = configureStore({
  reducer
})

// store의 데이터 타입 지정
// 리턴 유틸리티 타입
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;


export default store;