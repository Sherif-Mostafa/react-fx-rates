// App Actions

export const LOADING = 'LOADING';
export const UPDATE_BALANCE = 'UPDATE_BALANCE';


// App Action Creators

export const toggleLoading = showLoading => ({
    type: LOADING, loading: showLoading
});

export const updateBalance = newBalance => ({
    type: LOADING, balance: newBalance
});
