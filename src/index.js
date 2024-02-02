import React from 'react';
import ReactDOM from 'react-dom';
import {CookiesProvider} from 'react-cookie';
import {HashRouter as Router} from 'react-router-dom';
import './index.css';
import App from './App';
import {Event} from './utils/events';
import registerServiceWorker, {unregister} from './serviceWorker';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
const event = new Event();

//Before
// ReactDOM.render(
//     <CookiesProvider>
//         <Router>
//             <App event={event}/>
//         </Router>
//     </CookiesProvider>
//     , document.getElementById('root')
// );

// After
root.render(
    <CookiesProvider>
        <Router>
            <App event={event}/>
        </Router>
    </CookiesProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// registerServiceWorker(event);
unregister();
