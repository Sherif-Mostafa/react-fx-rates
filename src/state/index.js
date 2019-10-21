import { combineReducers } from 'redux';

import exchangeReducer from "../reducers/exchange.reducer";
import appReducer from "../reducers/app.reducer";

export default combineReducers({
    exchange: exchangeReducer,
    app: appReducer
});
