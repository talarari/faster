import {Observable} from 'rx';
import React, { Component } from 'react';
import AutosuggestHighlight from 'autosuggest-highlight'


const people = [
    {
        key:"Charlie",
        first: 'Charlie',
        last: 'Brown',
        twitter: 'dancounsell'
    },
    {
        key:"Charlotte",
        first: 'Charlotte',
        last: 'White',
        twitter: 'mtnmissy'
    },
    {
        key: 'Bob',
        first: 'Bob',
        last: 'Jones',
        twitter: 'ladylexy'
    },
    {
        key: 'Cooper',
        first: 'Cooper',
        last: 'King',
        twitter: 'steveodom'
    }
];


function getPeopleFromNetwork(name){
    return Observable.from(people).filter(({first})=> first.toLowerCase().match(name));
}

function getPeople(name){
    const getPersonLiveFeed = person =>
        Observable.interval(1000)
            .map(x=> ({
                    key: person.key,
                    first: (person.first + '-' + x),
                    last: person.last,
                    twitter: person.twitter
                })
            );
    return getPeopleFromNetwork(name)
        .flatMap(person=> getPersonLiveFeed(person));
}

var peoplePlugin = {
    getName(){
        return 'people'
    },

    getSuggestions(query){
        return getPeople(query);
    },

    renderSuggestion(suggestion,query){
        const suggestionText = `${suggestion.first} ${suggestion.last}`;
        const matches = AutosuggestHighlight.match(suggestionText, query);
        const parts = AutosuggestHighlight.parse(suggestionText, matches);

        return (
            <span className={'suggestion-content ' + suggestion.twitter}>
      <span className="name">
        {
            parts.map((part, index) => {
                const className = part.highlight ? 'highlight' : null;

                return (
                    <span className={className} key={index}>{part.text}</span>
                );
            })
        }
      </span>
    </span>
        );
    }

};

export default peoplePlugin;