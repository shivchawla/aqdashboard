import React from 'react';
const {helpUrl = 'https://static.adviceqube.com/quant'} = require('../localConfig');

export default class HelpFrame extends React.Component {
    iframe = () => {
        const iframe = `<iframe src=${helpUrl} style="width: 100vw; height: calc(100vh - 64px); border: none"></iframe>`;
        return {
            __html: iframe
          }
    }
    
    render() {
        return (
            <div 
                dangerouslySetInnerHTML={this.iframe()} 
                style={{width: '100vw', height: 'calc(100vh - 64px)'}}
            />
        );
    }
}