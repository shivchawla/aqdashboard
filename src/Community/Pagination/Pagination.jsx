import React, { Component } from 'react';
import ActionIcon from '../../components/Buttons/ActionIcon';
import {useNavigate} from 'react-router-dom';
import Utils from './../../Utils';

class Pagination extends Component {

    _mounted = false;

    constructor(props) {
        super();
        this.state = {
        };


        this.clickedOnFirstPage = () => {
            if (Utils.isLoggedIn()) {
                if (this.props.page !== 1) {
                    this.props.onpageChanged(1);
                }
            } else {
                Utils.goToLoginPage(this.props.history, window.location.href);
            }
        }

        this.clickedOnLastPage = () => {
            if (Utils.isLoggedIn()) {
                let currentPage = parseInt(JSON.stringify(this.props.page), 10);
                if (currentPage * 10 < this.props.dataCount) {
                    this.props.onpageChanged(this.props.numberOfPages);
                }
            } else {
                Utils.goToLoginPage(this.props.history, window.location.href);
            }
        }

        this.clickedOnPrevPage = () => {
            if (Utils.isLoggedIn()) {
                let currentPage = parseInt(JSON.stringify(this.props.page), 10);
                if (currentPage > 1) {
                    this.props.onpageChanged(currentPage - 1);
                }
            } else {
                Utils.goToLoginPage(this.props.history, window.location.href);
            }
        }

        this.clickedOnNextPage = () => {
            if (Utils.isLoggedIn()) {
                let currentPage = parseInt(JSON.stringify(this.props.page), 10);
                if (currentPage * 10 < this.props.dataCount) {
                    this.props.onpageChanged(currentPage + 1);
                }
            } else {
                Utils.goToLoginPage(this.props.history, window.location.href);
            }
        }

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

        return (
            <div
                    style={{
                        'justifyContent': 'center', 'alignItems': 'center',
                        'display': 'flex', 'marginTop': '15px'
                    }}
            >
                <ActionIcon 
                    onClick={this.clickedOnFirstPage}
                    type='first_page'
                    color={(this.props.page <= 1) ? '#9b9b9b' : 'black'}
                    style={{
                        fontWeight: 'bold',
                        fontSize: '20px', 
                        padding: '5px', 
                        cursor: 'pointer'
                    }}
                />
                <ActionIcon 
                    onClick={this.clickedOnPrevPage}
                    type='chevron_left'
                    color={this.props.page <= 1 ? '#9b9b9b' : 'black'}
                    style={{
                        fontWeight: 'bold',
                        fontSize: '20px', 
                        padding: '5px', 
                        cursor: 'pointer'
                    }}
                />
                <h3 
                        style={{
                            minWidth: '100px', 
                            textAlign: 'center',
                            color: '#3c3c3c', 
                            margin: '0px'
                        }}
                >
                    PAGE {this.props.page}
                </h3>
                <ActionIcon 
                    onClick={this.clickedOnNextPage} 
                    type="chevron_right"
                    color={this.props.dataCount <= (this.props.page * 10) ? '#9b9b9b' : 'black'}
                    style={{
                        fontWeight: 'bold',
                        fontSize: '20px', 
                        padding: '5px', 
                        cursor: 'pointer'
                    }}
                />
                <ActionIcon 
                    onClick={this.clickedOnLastPage}
                    type="last_page"
                    color={this.props.dataCount <= (this.props.page * 10) ? '#9b9b9b' : 'black'}
                    style={{
                        fontWeight: 'bold',
                        fontSize: '20px', 
                        padding: '5px', 
                        cursor: 'pointer'
                    }}
                />
            </div>
        );
    }
}

export default Pagination;
