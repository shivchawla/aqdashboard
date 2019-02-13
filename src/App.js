import React, { Component } from 'react';
import Route from 'react-router/Route';
import Switch from 'react-router-dom/Switch';
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MomentUtils from '@date-io/moment';
import Research from './Research/Research';
import StrategyDetail from './Research/StartegyDetail/StartegyDetail';
import StrategyBacktests from './Research/StrategyBacktests/StrategyBacktests';
import BacktestDetail from './Research/BacktestDetail/BacktestDetail';
import Community from './Community/Community';
import ThreadView from './Community/ThreadView/ThreadView';
import NewPost from './Community/NewPost/NewPost';
import Help from './HelpFrame';
import Home from './HomeFrame';
import Tutorial from './TutorialFrame';
import ForbiddenAccess from './ErrorPages/ForbiddenAccess';
import NoIternetAccess from './ErrorPages/NoIternetAccess';
import BadRequest from './ErrorPages/BadRequest';
import PageNotFound from './ErrorPages/PageNotFound';
import Stepper from './samples/Stepper';
import FlowChartAlgo from './Research/FlowChartAlgo';
import './App.css';

const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#008080'
		},
	}
});

class App extends Component {
  render() {
    return (
		<MuiThemeProvider theme={theme}>
			<MuiPickersUtilsProvider utils={MomentUtils}>
				<div className="App">
					<Switch>
						<Route exact={true} path='/research' component={Research} />
						<Route exact={true} path='/research/strategy/:strategyId' component={StrategyDetail} />
						<Route exact={true} path='/research/backtests/:strategyId' component={StrategyBacktests} />
						<Route exact={true} path='/research/backtests/:strategyId/:backtestId' component={BacktestDetail} />
						<Route exact={true} path='/community' component={Community}/>
						<Route exact={true} path='/community/postDetail/:postId' component={ThreadView} />
						<Route exact={true} path='/community/newPost' component={NewPost} />
						<Route exact={true} path='/help' component={Help}/>
						<Route exact={true} path='/tutorial' component={Tutorial}/>
						<Route exact={true} path='/home' component={Home}/>
						<Route exact={true} path='/' component={Home}/>
						<Route exact={true} path='/forbiddenAccess' component={ForbiddenAccess} />
            <Route exact={true} path='/errorPage' component={NoIternetAccess} />
            <Route exact={true} path='/badRequest' component={BadRequest} />
						<Route exact={true} path='/stepper' component={Stepper} />
						<Route exact={true} path='/algo' component={FlowChartAlgo} />
						<Route component={PageNotFound} />
					</Switch>
				</div>
			</MuiPickersUtilsProvider>
		</MuiThemeProvider>
    );
  }
}

export default App;
