import React from 'react';

// Compare CounterIncrease for a simplified style
class DecreaseButton extends React.Component {
  render() {
    return (
      <button onClick={this.props.onDecrement}>
        -
      </button>
    )
  }
}
export default DecreaseButton;
