import React, { Component } from 'react';
import Chip from '../../components/DataDisplay/Chip';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import Utils from './../../Utils';
class Search extends Component {

    _mounted = false;

    constructor(props) {
        super();
        this.state = {
            'addTagsClicked': false,
            'tags': [],
            'searchText': ''
        };

        if (props.searchDefaultValue) {
            this.state.searchText = props.searchDefaultValue;
        }

        this.searchChange = (event) => {
            this.updateState({ 'searchText': event.target.value })
        }


        this.tagClosed = (index) => {
            let tags = JSON.parse(JSON.stringify(this.state.tags));
            if (tags.length > index) {
                tags.splice(index, 1);
            }
            this.updateState({ 'tags': tags });
        }

        this.clickedOnSearch = () => {
            if (Utils.isLoggedIn()) {
                this.props.clickedOnSearch(this.state.searchText);
            } else {
                Utils.goToLoginPage(this.props.history, window.location.href);
            }
        }
        this.handleKeyPressSearch = (event) => {
            if (event.key === 'Enter') {
                if (Utils.isLoggedIn()) {
                    this.props.clickedOnSearch(event.target.value);
                } else {
                    Utils.goToLoginPage(this.props.history, window.location.href);
                }
            } else if (event.key === 'Escape') {
                this.updateState({ 'searchText': '' });
                if (Utils.isLoggedIn()) {
                    this.props.clickedOnSearch('');
                }
            }
        }

        this.handleKeyPressAddTags = (event) => {
            if (event.key === 'Enter' && event.target.value && event.target.value.trim().length > 0) {
                let tags = JSON.parse(JSON.stringify(this.state.tags));
                tags.push(event.target.value);
                event.target.value = "";
                this.updateState({ 'tags': tags });
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

        const tags = [];
        for (let i = 0; i < this.state.tags.length; i++) {
            tags.push(
                <Chip 
                    label={this.state.tags[i]}
                    key={i}
                    onDelete={() => this.tagClosed(i)}
                    style={{
                        background: '#cc6666'
                    }}
                />
            )
        }

        const getTagsDiv = () => {
            if (this.state.addTagsClicked) {
                return (
                    <div style={{ 'display': 'flex' }}>
                        <input
                            type="text"
                            style={{
                                width: '250px',
                                border: '1px solid #e5e5e5',
                                padding: '5px 10px 5px 10px',
                                marginTop: '10px'
                            }}
                            placeholder="Add tags here and press Enter"
                            onKeyPress={this.handleKeyPressAddTags} />
                        <div 
                                style={{ 
                                    display: 'flex', 
                                    margin: '10px 0px 0px 10px', 
                                    alignItems: 'center' 
                                }}
                        >
                            {tags}
                        </div>
                    </div>
                );
            } else {
                return (
                    <p 
                            onClick={() => { this.updateState({ 'addTagsClicked': true }) }} 
                            className="add-tags"
                    >
                        Add Tags?
                    </p>
                );
            }
        }

        return (
            <React.Fragment>
                <div style={{ 'display': 'flex' }}>
                    <input 
                            value={this.state.searchText} 
                            type="text" 
                            style={{
                                width: '100%',
                                padding: '4px 10px 4px 10px', 
                                border: '1px solid #e1e1e1'
                            }} 
                            placeholder="Search Term"
                            onKeyDown={this.handleKeyPressSearch}
                            onChange={this.searchChange} 
                    />
                    <Button 
                            onClick={this.clickedOnSearch} 
                            style={{ 'marginLeft': '10px' }} 
                            color="primary"
                            variant="contained"
                    >
                        SEARCH
                    </Button>
                </div>
                {getTagsDiv()}
            </React.Fragment>
        );
    }
}

export default Search;
