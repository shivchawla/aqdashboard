import React, { Component } from 'react';
import Route from 'react-router/Route';
import ReactGA from 'react-ga';
import Media from 'react-media';
import Switch from 'react-router-dom/Switch';
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MomentUtils from '@date-io/moment';
import {withRouter} from 'react-router-dom';
import ChunkingLoader from './components/Loaders/ChunkingLoader';
import './App.css';

const {gaTrackingId} = require('./localConfig');

/**
 * Chunking code using React.Suspense and async imports
 */

const Research = React.lazy(() => import('./Research/Research'));
const StrategyDetail = React.lazy(() => import('./Research/StartegyDetail/StartegyDetail'));
const StrategyBacktests = React.lazy(() => import('./Research/StrategyBacktests/StrategyBacktests'));
const BacktestDetail = React.lazy(() => import('./Research/BacktestDetail/BacktestDetail'));
const Community = React.lazy(() => import('./Community/Community'));
const ThreadView = React.lazy(() => import('./Community/ThreadView/ThreadView'));
const NewPost = React.lazy(() => import('./Community/NewPost/NewPost'));
const Help = React.lazy(() => import('./HelpFrame'));
const Home = React.lazy(() => import('./HomeFrame'));
const Tutorial = React.lazy(() => import('./TutorialFrame'));
const ForbiddenAccess = React.lazy(() => import('./ErrorPages/ForbiddenAccess'));
const NoIternetAccess = React.lazy(() => import('./ErrorPages/NoIternetAccess'));
const BadRequest = React.lazy(() => import('./ErrorPages/BadRequest'));
const PageNotFound = React.lazy(() => import('./ErrorPages/PageNotFound'));
const FlowChartAlgo = React.lazy(() => import('./Research/FlowChartAlgo'));


const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#008080'
		},
	}
});

class App extends Component {
    constructor(props) {
        super(props);
        ReactGA.initialize(gaTrackingId); //Unique Google Analytics tracking number
    }

    fireTracking = () => {
        ReactGA.pageview(window.location.href);
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) { // Route changed
            this.fireTracking();
        }
    }

    render() {
        return (
            <MuiThemeProvider theme={theme}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <div className="App">
                        <Media 
                            query="(max-width: 800px)"
                            render={() => <PageNotFound />}
                        />
                        <Media 
                            query="(min-width: 801px)"
                            render={() => (
                                <React.Suspense fallback={<ChunkingLoader />}>
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
                                        <Route exact={true} path='/algo' component={FlowChartAlgo} />
                                        <Route component={PageNotFound} />
                                    </Switch>
                                </React.Suspense>
                            )}
                        />
                    </div>
                </MuiPickersUtilsProvider>
            </MuiThemeProvider>
        );
    }
}

export default withRouter(App);
