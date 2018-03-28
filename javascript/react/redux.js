// 设计思想
// （1）Web 应用是一个状态机，视图与状态是一一对应的。
// （2）所有的状态，保存在一个对象里面。

// Redux 的基本做法：用户发出 Action，Reducer 函数算出新的 State，View 重新渲染。

// Basics:
// Store 
//     保存数据的地方，你可以把它看成一个容器。整个应用只能有一个 Store。
//     Redux 提供createStore这个函数，用来生成 Store。
//     import { createStore } from 'redux';
//     const store = createStore(reducer);
// State
//     Store对象包含所有数据。如果想得到某个时点的数据，就要对 Store 生成快照。这种时点的数据集合，就叫做 State。
//     当前时刻的 State，可以通过store.getState()拿到。
//     import { createStore } from 'redux';
//     const store = createStore(fn);
//     const state = store.getState();
//     Redux 规定， 一个 State 对应一个 View。只要 State 相同，View 就相同。你知道 State，就知道 View 是什么样，反之亦然。
// Action
//     Action 就是 View 发出的通知，表示 State 应该要发生变化了
//     Action 是一个对象。其中的type属性是必须的，表示 Action 的名称
//     Action Creator: 定义一个函数来生成 Action，这个函数就叫 Action Creator
//     store.dispatch(): View 发出 Action 的唯一方法
// Reducer
//     Store 收到 Action 以后，必须给出一个新的 State，这样 View 才会发生变化。这种 State 的计算过程就叫做 Reducer。
//     Reducer 是一个函数，它接受 Action 和当前 State 作为参数，返回一个新的 State。
//     const reducer = function (state, action) { ... return new_state; };
//     Reducer 函数最重要的特征是，它是一个纯函数。也就是说，只要是同样的输入，必定得到同样的输出。
//     不得改写参数, 不能调用系统 I/O 的API, 不能调用Date.now()或者Math.random()等不纯的方法，因为每次会得到不一样的结果
//     store.subscribe(): Store 允许使用store.subscribe方法设置监听函数，一旦 State 发生变化，就自动执行这个函数。

// Reducer的拆分
//     Redux 提供了一个combineReducers方法，用于 Reducer 的拆分。你只要定义各个子 Reducer 函数，然后用这个方法，将它们合成一个大的 Reducer。
//     import { combineReducers } from 'redux';
//     const chatReducer = combineReducers({ chatLog, statusMessage, userName})

// 工作流程
//     用户发出 Action: store.dispatch(action);
//     Store 自动调用Reducer，并且传入两个参数：当前State和收到的Action. Reducer会返回新的State: let nextState = todoApp(previousState, action);
//     State一旦有变化，Store 就会调用监听函数: store.subscribe(listener);
//     listener可以通过store.getState()得到当前状态。如果使用的是React，这时可以触发重新渲染View。

// 中间件与异步操作
//     发送 Action 的这个步骤，即store.dispatch()方法，可以添加功能
//     applyMiddlewares: Redux的原生方法，作用是将所有中间件组成一个数组，依次执行
//     异步操作的基本思路: 异步操作的差别是它要发出三种 Action: 操作发起时的Action, 操作成功时的Action, 操作失败时的Action

// React-Redux 
//     所有组件分成两大类：UI 组件（presentational component）和容器组件（container component）
// UI组件有以下几个特征: 
//     只负责 UI 的呈现，不带有任何业务逻辑
//     没有状态（即不使用this.state这个变量）
//     所有数据都由参数（this.props）提供
//     不使用任何 Redux 的 API
// 容器组件
//     负责管理数据和业务逻辑，不负责 UI 的呈现
//     带有内部状态
//     使用 Redux 的 API
// 如果一个组件既有UI又有业务逻辑: 将它拆分成下面的结构：外面是一个容器组件，里面包了一个UI组件。前者负责与外部的通信，将数据传给后者，由后者渲染出视图
// React-Redux规定，所有的UI组件都由用户提供，容器组件则是由React-Redux自动生成。也就是说，用户负责视觉层，状态管理则是全部交给它































