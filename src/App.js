import React, { Component } from 'react';
import * as plugins  from './plugins/index';
import Faster from './Faster'
class App extends React.Component {

    render() {

        return (
            <Faster
                plugins={plugins}/>
        );
    }
}

export default App;