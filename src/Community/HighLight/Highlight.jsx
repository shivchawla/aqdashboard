import hljs from 'highlight.js';
import React from 'react';

class Highlight extends React.Component {
    _mounted = false;
    componentDidMount() {
        this._mounted = true;
        this.highlightCode();
    }

    componentDidUpdate() {
        this.highlightCode();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    highlightCode() {
        if (this._mounted){
            const nodes = this.el.querySelectorAll('.ql-syntax');
            for (let i = 0; i < nodes.length; i++) {
                if (this.props.className){
                    nodes[i].classList.add(this.props.className);
                }
                hljs.highlightBlock(nodes[i])
            }
        }
    }

    setEl = (el) => {
        this.el = el;
    };

    render() {
        const {children, className, element: Element, innerHTML} = this.props;
        const props = { ref: this.setEl, className };

        if (innerHTML) {
            props.dangerouslySetInnerHTML = { __html: children };
            if (Element) {
                return <Element {...props} />;
            }
            return <div {...props} />;
        }

        if (Element) {
            return <Element {...props}>{children}</Element>;
        }
        setTimeout(() => {
            this.highlightCode();
        }, 200);
        return <div ref={this.setEl}>{children}</div>;
    }
}

Highlight.defaultProps = {
    innerHTML: false,
    className: null,
    element: null,
};

export default Highlight;