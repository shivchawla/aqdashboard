import React, { Component } from 'react';
// import ReactGA from 'react-ga';
import Media from 'react-media';
import Button from '@mui/material/Button';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Snackbar from './components/Alerts/SnackbarComponent';
import { Route, Routes } from 'react-router-dom';

import ChunkingLoader from './components/Loaders/ChunkingLoader';
import {horizontalBox} from './constants';
import './App.css';

// const {gaTrackingId} = require('./localConfig');

/**
 * Chunking code using React.Suspense and async imports
 */
import Research from './Research/Research';
import StrategyDetail from './Research/StartegyDetail/StartegyDetail';
import StrategyBacktests from './Research/StrategyBacktests/StrategyBacktests';
import BacktestDetail from './Research/BacktestDetail/BacktestDetail';
import Community from './Community/Community';
import ThreadView from './Community/ThreadView/ThreadView';
import NewPost from './Community/NewPost/NewPost';
// import Help from './HelpFrame';
// import Home from './HomeFrame';
import Tutorial from './TutorialFrame';
import ForbiddenAccess from './ErrorPages/ForbiddenAccess';
import NoIternetAccess from './ErrorPages/NoIternetAccess';
import BadRequest from './ErrorPages/BadRequest';
import PageNotFound from './ErrorPages/PageNotFound';
import UnderDevelopment from './ErrorPages/UnderDevelopment';
import FlowChartAlgo from './Research/FlowChartAlgo';


const theme = createTheme({
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
        // ReactGA.initialize(gaTrackingId); //Unique Google Analytics tracking number
        this.state = {
            newContentToast: false,
            addToHomescreenToast: false,
            responseSnackbar: false,
            responseSnackbarMessage: ''
        };
    }

    fireTracking = () => {
        // ReactGA.pageview(window.location.href);
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
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterMoment}>
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
                                    <Routes>
                                        {/* <Route exact={true} path='/home' element={<Home/>}/> */}
                                        <Route exact={true} path='/' element={<Research/>}/>
                                        <Route exact={true} path='/research' element={<Research/>}/>
                                        <Route exact={true} path='/research/strategy/:strategyId' element={<StrategyDetail/>}/>
                                        <Route exact={true} path='/research/backtests/:strategyId' element={<StrategyBacktests/>}/>
                                        <Route exact={true} path='/research/backtests/:strategyId/:backtestId' element={<BacktestDetail/>}/>
                                        <Route exact={true} path='/community' element={<Community/>}/>
                                        <Route exact={true} path='/community/postDetail/:postId' element={<ThreadView/>}/>
                                        <Route exact={true} path='/community/newPost' element={<NewPost/>}/>
                                        {/* <Route exact={true} path='/help' element={<Help/>}/> */}
                                        <Route exact={true} path='/tutorial' element={<Tutorial/>}/>
                                        <Route exact={true} path='/forbiddenAccess' element={<ForbiddenAccess/>}/>
                                        <Route exact={true} path='/errorPage' element={<NoIternetAccess/>}/>
                                        <Route exact={true} path='/badRequest' element={<BadRequest/>}/>
                                        <Route exact={true} path='/algo' element={<FlowChartAlgo/>}/>
                                        <Route element={<PageNotFound/>}/>
                                    </Routes>
                                </React.Suspense>
                            )}
                        />
                    </div>
                </LocalizationProvider>
            </ThemeProvider>
        );
    }
}

export default App;
