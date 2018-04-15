
import { ADD_TODO, REMOVE_TODO } from '../constants/ActionTypes'

const todoReducer = (state = [], action) => {
    switch(action.type) {
        case ADD_TODO:
            return state.concat(action.task);
        case REMOVE_TODO:
            let newState = state.slice();
            newState.splice(action.index, 1);
            return newState;
        default:
            return state;
    }
}

export default todoReducer;

