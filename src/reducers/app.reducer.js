import { LOADING, UPDATE_BALANCE } from "../actions/app.action";

const initialState = {
    loading: false,
    balance: [
        { amount: 100, symbol: '£', currency: 'GBP', code: 'GB', title: 'British Pound Sterling' },
        { amount: 200, symbol: '€', currency: 'EUR', code: 'EU', title: 'Euro' },
        { amount: 300, symbol: '$', currency: 'USD', code: 'US', title: 'United States Dollar' }
    ]
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LOADING:
            return { ...state, loading: action.loading };
        case UPDATE_BALANCE:
            console.log(action)
            return { ...state, balance: [...action.balance] };

        default:
            return state;
    }
};
