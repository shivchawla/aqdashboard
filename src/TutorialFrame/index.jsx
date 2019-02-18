import React from 'react';
import AqDesktopLayout from '../components/Layout/AqDesktopLayout';
const {tutorialUrl = 'https://static.adviceqube.com/quant'} = require('../localConfig');

export default class TutorialFrame extends React.Component {
    iframe = () => {
        const iframe = `<iframe src=${tutorialUrl} style="width: 100vw; height: calc(100vh - 64px); border: none"></iframe>`;
        return {
            __html: iframe
          }
    }
    render() {
        return (
            <AqDesktopLayout>
                <div 
                    dangerouslySetInnerHTML={this.iframe()} 
                    style={{width: '100vw', height: 'calc(100vh - 64px)'}}
                />
            </AqDesktopLayout>
        );
    }
}