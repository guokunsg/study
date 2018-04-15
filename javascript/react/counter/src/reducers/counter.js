
import { INCREASE, DECREASE } from '../constants/ActionTypes'

// state must have a default value. 
// There will be two @@redux/INIT action, first one is for testing so must not return undefined.
// The second @@redux/INIT will pass in the actual external preloaded state
// There is also a @@redux/PROBE_UNKNOWN_ACTION_2.a.w.… action
const counterReducer = (state = {}, action) => {
    switch(action.type) {
        case INCREASE:
            return { counter: state.counter + 1 } ;
        case DECREASE:
            state.counter -= 1;
            // Need to return a new object. combined reducers compares the object for state change
            return { ...state };
        default:
            // If no change, return the same state. 
            // Must not return undefined. Return an object, it will be combined with the external initial state
            return state;
    }
}

export default counterReducer;

