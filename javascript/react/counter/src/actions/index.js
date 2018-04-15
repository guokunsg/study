import { INCREASE, DECREASE } from "../constants/ActionTypes"

// This way require react-thunk, otherwise has error: Actions must be plain objects.
export const onIncrement = () => {
    return (dispatch, getState) => {
        dispatch( { type: INCREASE } )
    };
}

export const onDecrement = () => {
    // Return the action to dispatch
    return { 
        type: DECREASE 
    }
}
