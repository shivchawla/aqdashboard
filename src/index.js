import React from 'react';
import ReactDOM from 'react-dom';
import {CookiesProvider} from 'react-cookie';
import {BrowserRouter as Router} from 'react-router-dom';
import './index.css';
import App from './App';
import {Event} from './utils/events';
import registerServiceWorker from './serviceWorker';

const event = new Event();

ReactDOM.render(
    <CookiesProvider>
        <Router>
            <App event={event}/>
        </Router>
    </CookiesProvider>
    , document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
registerServiceWorker(event);
