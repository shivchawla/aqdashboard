import React, { Component } from 'react';
import ThreadListItem from './ThreadListItem/ThreadListItem.jsx';
import { useNavigate } from 'react-router-dom';
// import Loading from 'react-loading-bar';
// import 'react-loading-bar/dist/index.css';

class ThreadList extends Component {

    _mounted = false;

    constructor(props) {
        super();
        this.state = {
        };

        this.updateState = (data) => {
            if (this._mounted) {
                this.setState(data);
            }
        }

    }

    componentDidMount() {
        this._mounted = true;
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    render() {


        const listOfThreads = [];

        const getDisplayData = () => {
            if (!this.props.loading) {
                if (this.props.threads) {
                    for (let i = 0; i < this.props.threads.length; i++) {
                        listOfThreads.push(<ThreadListItem key={this.props.threads[i]._id} threadData={this.props.threads[i]} />)
                    }
                }
                return listOfThreads;
            }
        }

        return (
            <div className="height_width_full"
                style={{
                    'padding': '0px 4px 1% 4px',
                    'overflowY': 'auto', 'minHeight': '300px'
                }}>
                {/* <div className="main-loader">
                    <Loading
                        show={this.props.loading}
                        color="teal"
                        showSpinner={false}
                    />
                </div> */}
                {getDisplayData()}
            </div>
        );
    }
}

export default ThreadList;
