import { bindActionCreators } from "redux";
import { connect } from 'react-redux';
import React from 'react'
import Counter from "../components/Counter"
import CounterIncrease  from "../components/CounterIncrease"
import CounterDecrease  from "../components/CounterDecrease"
import { onIncrement, onDecrement } from "../actions"

const CounterContainer = ({ counter, onIncrement, onDecrement, testProp }) => {
    // onIncrement and onDecrement are wrapped function bindActionCreator, which does the following: 
    // function bindActionCreator(actionCreator, dispatch) {
    //    return function () {
    //      return dispatch(actionCreator.apply(undefined, arguments));
    //    };
    //  }

    return (
        <p> 
            <Counter value={counter} /> 
            <CounterIncrease onIncrement= {
                // This way require middleware to process the function to return an action
                () => { return onIncrement(); }
            }/>
            <CounterDecrease onDecrement = {onDecrement}/>
        </p>
)}

// mapStateToProps(state, [ownProps]): stateProps
// ownProps: props passed to the connected component, see App.js
const mapStateToProps = (state, ownProps) => {
    // The real state object for counter is state.counter, which is an object. state.counter is the key
    let counterState = state.counter;
    return {
        counter: counterState.counter
    };
}

// mapDispatchToProps(dispatch, [ownProps]
const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(
        { onIncrement, onDecrement: onDecrement }, 
        dispatch
    );
}

// Connect the component to the store
export default connect(
    mapStateToProps, 
    mapDispatchToProps, 
    // Above is the same as the following line. connect checks the type of the parameter and handle it differently
    // { onIncrement, onDecrement } 
)(CounterContainer)
