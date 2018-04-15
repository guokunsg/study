import { connect } from 'react-redux';
import React from 'react'
import { ADD_TODO, REMOVE_TODO } from '../constants/ActionTypes';

class TodoContainer extends React.Component {

    // Need to use arrow function to bind this. 
    // if use handleAddSubmit(e, input) {}, this will be undefined
    handleAddSubmit = (e, input) => {
        e.preventDefault();
        if (! input.value.trim())
            return;
        this.props.dispatch({ 
            type: ADD_TODO, 
            task: input.value 
        })
    }

    handleDelete = function(e, i) {
        const {dispatch} = this.props;
        e.preventDefault();
        dispatch({
            type: REMOVE_TODO,
            index: i
        })
    }

    render() {
        let input; // Used by ref to receive the DOM input
        const { tasks } = this.props;
        return (
            <form onSubmit={ e => {
                this.handleAddSubmit(e, input);
            }}>
                <input ref={
                    // Refs provide a way to access DOM nodes or React elements created in the render method
                    node => input = node
                }/>
                <button type="submit">
                    Add
                </button>
                <ul> {
                    tasks.map((task, i) => (
                        <li key={i}>
                            <button onClick={ e => this.handleDelete(e, i)}>-</button>
                            {task}
                        </li>
                    ))
                }</ul>
            </form>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        tasks: state.TODO
    };
}

export default connect(mapStateToProps)(TodoContainer);