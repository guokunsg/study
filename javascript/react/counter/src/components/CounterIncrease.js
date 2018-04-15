import React from 'react';

const CounterIncrease = ( { onIncrement } ) => (
    <button onClick={onIncrement}>
      +
    </button>
)
export default CounterIncrease;

// Above is the same as:
/*class IncreaseButton extends React.Component {
  render() {
    return (
      <button onClick={this.props.onIncrement}>
        -
      </button>
    )
  }
}
export default IncreaseButton;*/