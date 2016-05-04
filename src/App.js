import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import {Observable} from 'rx'

import * as plugins  from './plugins/index';


function getSuggestions(query) {

    return Observable.merge(Object.keys(plugins).map(key=> {
        return plugins[key].getSuggestions(query)
            .map(x=> ({
                pluginSuggestion: x,
                pluginKey: key
            }))
    }));
}

function renderSuggestion(suggestion, { value, valueBeforeUpDown }) {
    const query = (valueBeforeUpDown || value).trim();
    return plugins[suggestion.pluginKey].renderSuggestion(suggestion.pluginSuggestion, query);
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

        var pluginsSuggestions = getSuggestions(value);

        this.subs = pluginsSuggestions
            .finally(()=> {
                this.setState({
                    suggestions: {}
                });
            })
            .subscribe(x=> {
                self.state.suggestions[x.key] = x;
                this.setState({
                    suggestions: self.state.suggestions
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

        var suggestionsArray = Object.keys(suggestions).map(i=>suggestions[i]);

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