import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import {Observable} from 'rx'
import AutosuggestHighlight from 'autosuggest-highlight'

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
function getSuggestions(plugins,query) {
    return Observable.from(Object.keys(plugins))
        .flatMap(pluginKey=>{
            let plugin = plugins[pluginKey];
            const reviveSuggestion = s => plugin.reviveSuggestion ? plugin.reviveSuggestion(s) : Observable.just(s);

            return plugin.getSuggestions(query)
                .flatMap(s=> {
                    let suggestionKey = guid();
                    return reviveSuggestion(s)
                        .map(s=>({
                            value: s,
                            suggestionKey: suggestionKey
                        }));
                })
                .scan((acc,{value,suggestionKey})=> ({
                    ...acc,
                    [suggestionKey]:{
                        value,
                        pluginKey
                    }
                }),{})
                .map(suggestionsByUniqueKey=> ({
                    [pluginKey]: {
                        pluginKey: pluginKey,
                        suggestions: values(suggestionsByUniqueKey)
                    }
                }));
        })
        .scan((allPluginSuggestions,singlePluginSuggestion)=>({...allPluginSuggestions,...singlePluginSuggestion}),{})
        .map(allPluginSuggestions=> values(allPluginSuggestions));
}


function renderSuggestion(pluginSuggestion, { value, valueBeforeUpDown }) {
    const query = (valueBeforeUpDown || value).trim();

    const suggestionText = pluginSuggestion.value.description;
    const matches = AutosuggestHighlight.match(suggestionText, query);
    const parts = AutosuggestHighlight.parse(suggestionText, matches);

    return (
        <span>
        {
            parts.map((part, index) => {
                const className = part.highlight ? 'highlight' : null;

                return (
                    <span className={className} key={index}>{part.text}</span>
                );
            })
        }
      </span>
    );
}

function renderSectionTitle(section) {
    return (
        <strong>{section.pluginKey}</strong>
    );
}

function getSectionSuggestions(section) {
    return section.suggestions;
}


class Faster extends React.Component {
    constructor() {
        super();

        this.state = {
            value: '',
            suggestions: []
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
            suggestions: []
        });

        var pluginsSuggestions = getSuggestions(this.props.plugins,value);

        this.subs = pluginsSuggestions
        // .do(x=> console.log(JSON.stringify(x,null,2)))
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


        return (
            <Autosuggest
                multiSection={true}
                suggestions={suggestions}
                onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
                getSuggestionValue={s=>value}
                renderSuggestion={renderSuggestion}
                renderSectionTitle={renderSectionTitle}
                getSectionSuggestions={getSectionSuggestions}
                inputProps={inputProps}/>
        );  
    }
}

export default Faster;