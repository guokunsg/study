import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import App from "./containers/App.js"
import reducer from './reducers'

import thunk from 'redux-thunk';

// thunk passes state and dispatch, process the function to action, compare actions/index.js onIncrement and onDecrement
const middleWare = [ thunk ];

// Initial state to be passed to the reducer
const initialState = {
  counter: // counter is the key for counter reducer, defined in reducers/index.js
    { counter: 50 }, // The counter state object
  TODO:
    [], 
};

// createStore(reducer, [preloadedState], [enhancer])
const store = createStore(
  reducer, 
  initialState,
  applyMiddleware(...middleWare)
);

// Initialize the state

render(
  <Provider store = {store}>
    <App />
  </Provider>, 
  document.getElementById('root')
)



