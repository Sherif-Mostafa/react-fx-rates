import { ADD_TO_HISTORY } from "../actions/exchange.action";
const initialState = {
    history: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ADD_TO_HISTORY:
            return { ...state, history: [...state.history, action.newRecord] };
        default:
            return state;
    }
};
