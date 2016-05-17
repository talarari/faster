import {Observable} from 'rx';
import React, { Component } from 'react';


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


const getPeopleFromNetwork = name => Observable.from(people).filter(({first})=> first.toLowerCase().match(name));

const getPersonLiveFeed = person =>
    Observable.interval(1000)
        .map(x=> ({
                description: person.first + '-' + x,
                data:{
                    key: person.key,
                    first: (person.first + '-' + x),
                    last: person.last,
                    twitter: person.twitter
                }
            })
        );


var peoplePlugin = {
    getName(){
        return 'people'
    },

    getSuggestions(query){
        return getPeopleFromNetwork(query);
    },

    reviveSuggestion(suggestion){
        return getPersonLiveFeed(suggestion);
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