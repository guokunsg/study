import React from 'react'
import CounterContainer from './CounterContainer'
import TodoContainers from './TodoContainers';

const App = ({store}) => (
    <div>
        <h2>Counter Example</h2>
        <hr/>
        <CounterContainer testProp="A test own property" />
        <TodoContainers />
    </div>
)

export default App;