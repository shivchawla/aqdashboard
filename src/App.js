import React, { Component } from 'react';
import Route from 'react-router/Route';
import ReactGA from 'react-ga';
import Media from 'react-media';
import Switch from 'react-router-dom/Switch';
import Button from '@material-ui/core/Button';
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Snackbar from './components/Alerts/SnackbarComponent';
import MomentUtils from '@date-io/moment';
import {withRouter} from 'react-router-dom';
import ChunkingLoader from './components/Loaders/ChunkingLoader';
import {horizontalBox} from './constants';
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
const UnderDevelopment = React.lazy(() => import('./ErrorPages/UnderDevelopment'));
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
        this.deferredA2HSEvent = null;
        ReactGA.initialize(gaTrackingId); //Unique Google Analytics tracking number
        this.state = {
            newContentToast: false,
            addToHomescreenToast: false,
            responseSnackbar: false,
            responseSnackbarMessage: ''
        };
    }

    fireTracking = () => {
        ReactGA.pageview(window.location.href);
    }

    captureSWEvent = payload => {
        this.toggleNewContentToast();
    }

    toggleNewContentToast = () => {
        this.setState({newContentToast: !this.state.newContentToast});
    }

    toggleA2HSSnackbar = () => {
        this.setState({addToHomescreenToast: !this.state.addToHomescreenToast});
    }

    toggleResponseSnacbar = (message) => {
        this.setState({responseSnackbar: !this.state.responseSnackbar, responseSnackbarMessage: message});
    }

    onResponseSnackbarClose = () => {
        this.setState({responseSnackbar: false});
    }

    componentDidMount() {
        var self = this;
        window.addEventListener('beforeinstallprompt', function (e) {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            self.deferredA2HSEvent = e;
            self.toggleA2HSSnackbar();   
        });
        this.props.event && this.props.event.on('SW_NEW_CONTENT', this.captureSWEvent);
        this.fireTracking();
    }

    renderSnackbarAction = () => {
        return (
            <Button 
                    color="secondary" 
                    size="small" 
                    onClick={
                        () => {
                            window.location.reload(true);
                        }
                    }
            >
              Reload
            </Button>
        );
    }

    renderA2HSSnackbarAction = () => {
        return (
            <div style={{...horizontalBox, justifyContent: 'space-between'}}>
                <Button onClick={this.toggleA2HSSnackbar} color="secondary">CANCEL</Button>
                <Button 
                        style={{
                            color: '#fbc02d'
                        }} 
                        size="small" 
                        onClick={() => {
                            try {
                                this.deferredA2HSEvent.prompt();
                                this.deferredA2HSEvent.userChoice.then((choiceResult) => {
                                    if (choiceResult.outcome === 'accepted') {
                                        this.setState({addToHomescreenToast: false});
                                        this.toggleResponseSnacbar('Successfully added to homecreen');
                                    } else {
                                        this.setState({addToHomescreenToast: false});
                                    }
                                    this.deferredA2HSEvent.deferredPrompt = null;
                                });
                            } catch(err) {
                                console.log('Error', err);
                            }
                            console.log('Add Clicked');
                        }}
                >
                ADD
                </Button>
            </div>
        );
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
                        <Snackbar 
                            openStatus={this.state.newContentToast}
                            message='New update available plese reload!!'
                            renderAction={this.renderSnackbarAction}
                        />
                        <Snackbar 
                            openStatus={this.state.addToHomescreenToast}
                            message='Please add AdviceQube to homescreen'
                            renderAction={this.renderA2HSSnackbarAction}
                        />
                        <Snackbar 
                            openStatus={this.state.responseSnackbar}
                            handleClose={this.onResponseSnackbarClose}
                            message='Successfully added Adviceqube to homescreen'
                        />
                        <Media 
                            query="(max-width: 800px)"
                            render={() => (
                                <React.Suspense fallback={<ChunkingLoader />}>
                                    <UnderDevelopment />
                                </React.Suspense>
                            )}
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
