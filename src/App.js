import React, { Component } from 'react';
import Route from 'react-router/Route';
import Switch from 'react-router-dom/Switch';
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider';
import MomentUtils from '@date-io/moment';
import Research from './Research/Research';
import StrategyDetail from './Research/StartegyDetail/StartegyDetail';
import './App.css';

class App extends Component {
  render() {
    return (
      	<MuiPickersUtilsProvider utils={MomentUtils}>
			<div className="App">
				<Switch>
					<Route exact={true} path='/research' component={Research} />
					<Route exact={true} path='/research/strategy/:strategyId' component={StrategyDetail} />
				</Switch>
			</div>
		</MuiPickersUtilsProvider>
    );
  }
}

export default App;
