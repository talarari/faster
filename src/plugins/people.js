import {Observable} from 'rx';
import React, { Component } from 'react';


const getPeopleFromNetwork = name => Observable.range(1,20).map(i=>{
    const first ="caaaa" + i*1000;
    const last= 'blaaaaa';
    return{
        description: first + last,
        first,
        last
    }
});

const getPersonLiveFeed = person =>
    Observable.interval(1000)
        .map(x=> ({
                description: person.description + x,
                data:{
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
    }

    // reviveSuggestion(suggestion){
    //     return getPersonLiveFeed(suggestion);
    // }
};

export default peoplePlugin;