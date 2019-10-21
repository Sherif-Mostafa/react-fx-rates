// Exchange Actions

export const ADD_TO_HISTORY = 'ADD_TO_HISTORY';


// Exchange Action Creators

export const addNewRecordToHistyory = newRecord => ({
    type: ADD_TO_HISTORY, newRecord
});
