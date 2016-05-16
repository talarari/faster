import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import {Observable} from 'rx'

import * as plugins  from './plugins/index';

const values = map => Object.keys(map).map(x=> map[x]);

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
function getSuggestions(query) {
    return Observable.from(Object.keys(plugins))
    .flatMap(pluginKey=>{
        let plugin = plugins[pluginKey];
        const reviveSuggestion = s => plugin.reviveSuggestion ? plugin.reviveSuggestion(s) : Observable.just(s);

        return plugin.getSuggestions(query)
            .flatMap(s=> {
                let suggestionKey = guid();
                return reviveSuggestion(s)
                    .map(s=>({
                        suggestion: s,
                        pluginKey: pluginKey,
                        suggestionKey: suggestionKey
                    }));
            })
            .scan((acc,{suggestion,pluginKey,suggestionKey})=> ({...acc,
                [suggestionKey]:{
                    suggestion,
                    pluginKey
                }}),{})
            .map(suggestionsByUniqueKey=> ({[pluginKey]:values(suggestionsByUniqueKey)}));
    })
    .scan((allPluginSuggestions,singlePluginSuggestion)=>({...allPluginSuggestions,...singlePluginSuggestion}),{});
}


function renderSuggestion(pluginSuggestion, { value, valueBeforeUpDown }) {
    const query = (valueBeforeUpDown || value).trim();
    return plugins[pluginSuggestion.pluginKey].renderSuggestion(pluginSuggestion.suggestion, query);
}

class App extends React.Component {
    constructor() {
        super();

        this.state = {
            value: '',
            suggestions: {}
        };

        this.subs = undefined;
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsUpdateRequested = this.onSuggestionsUpdateRequested.bind(this);
    }

    componentWillUnmount() {
        if (this.subs) this.subs.dispose();
    }

    onChange(event, { newValue, method }) {
        this.setState({
            value: newValue
        });
    }

    onSuggestionsUpdateRequested({ value }) {

        var self = this;
        if (self.subs) self.subs.dispose();

        this.setState({
            suggestions: {}
        });

        var pluginsSuggestions = getSuggestions(value);

        this.subs = pluginsSuggestions
            .do(x=> console.log(JSON.stringify(x,null,2)))
            .subscribe(x=> {
                this.setState({
                    suggestions: x
                });
            });

    }

    render() {
        const { value, suggestions } = this.state;
        const inputProps = {
            placeholder: "Type 'c'",
            value,
            onChange: this.onChange
        };

        var flatSuggestions = values(suggestions);
        var suggestionsArray = flatSuggestions.length > 0 ? flatSuggestions.reduce((a,b)=> [...a,...b]) : flatSuggestions;

        return (
            <Autosuggest suggestions={suggestionsArray}
                         onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
                         getSuggestionValue={()=>""}
                         renderSuggestion={renderSuggestion}
                         inputProps={inputProps}/>
        );
    }
}

export default App;