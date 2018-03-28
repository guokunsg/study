// Study notes. May not run. Just to record some basic knowledge of React
// React Only Updates What’s Necessary
// JSX
// can embed any JavaScript expression in JSX by wrapping it in curly braces (must not " ")

// Conceptually, components are like JavaScript functions. They accept arbitrary inputs (called “props”) 
// and return React elements describing what should appear on the screen. 
// Functional declaration form
function WarningBanner(props) {
    if (! props.warn) {
      return null;
    }
    return ( <div className="warning"> Warning! </div> );
}
// Class form declaration
class Clock extends React.Component {
    constructor(props) {
        // Props are Read-Only
        super(props);
        // To reflect changes, use state
        this.state = {date: new Date()};
        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
    }
  
    // Called when components is rendered to the DOM for the first time
    componentDidMount() {
        this.timerID = setInterval( () => this.tick(), 1000 );
    }
  
    // Called when the component is removed
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
  
    tick() {
        // Must use setState. Do not modify state directly
        // State Updates May Be Asynchronous and merged
        this.setState({ date: new Date()});
    }

    handleClick() {
        // prevState is passed in with the previous state
        this.setState(prevState => ({
            isToggleOn: !prevState.isToggleOn
        }));
    }
  
    render() {
      return (
            // JSX tags may contain children:
            <div>
                <h1>Hello, world!</h1>
                <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
                <button onClick={this.handleClick}> { this.state.isToggleOn ? 'ON' : 'OFF' }
                </button>
            </div>
        );
    }
}
  
ReactDOM.render(
    <Clock />,
    document.getElementById('root')
);
  
  
  
  
  
