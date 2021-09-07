import {configureStore} from '@reduxjs/toolkit';
import earthquakeReducer from "./earthquakeReducer";
import {useDispatch, useSelector} from "react-redux";

const store = configureStore({
    reducer: {
        earthquake: earthquakeReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed Hooks
export const useAppSelector = <T extends (state: RootState) => any>(stateSelector: T) => useSelector<RootState, ReturnType<T>>(stateSelector);
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;