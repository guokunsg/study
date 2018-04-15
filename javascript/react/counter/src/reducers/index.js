
import { combineReducers } from 'redux';
import counter from './counter';
import todoReducer from './todo';

export default combineReducers({
  counter, 
  TODO: todoReducer
})


