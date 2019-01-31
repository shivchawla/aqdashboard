import React, { Component } from 'react';
import Route from 'react-router/Route';
import Switch from 'react-router-dom/Switch';
import {MuiPickersUtilsProvider} from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import Research from './Research/Research';
import './App.css';

class App extends Component {
  render() {
    return (
      	<MuiPickersUtilsProvider utils={MomentUtils}>
			<div className="App">
				<Switch>
					<Route exact={true} path='/research' component={Research} />
				</Switch>
			</div>
		</MuiPickersUtilsProvider>
    );
  }
}

export default App;
