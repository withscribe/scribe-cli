#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs')
const program = require('commander');
const requestPromise = require('request-promise');
var colors = require('colors');
require('dotenv').config()

const ENDPOINT = `${process.env.ENDPOINT}`

program
  .option('-c --count [amount]', 'specify the amount of stories to retrieve')
  .parse(process.argv);

storiesQuery = () => {
    return {
        "query": `
            query storiesQuery($first: Int) {
                stories(first: $first) {
                    id
                    author
                    title
                    content
                }
            }
        `,
        variables: { }
    }
}

getAccessToken = (count) => {
    fs.readFile('./.scriberc', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            console.error('myfile does not exist');
            return;
          }

          throw err;
        }
        const obj = JSON.parse(data)
        rp(obj.token, count).query().then((result) => {
            console.log(JSON.parse(result))
        })
      });
}

rp = (token, count) => {
    query = () => {
        return requestPromise(`${ENDPOINT}?query=allStories{allStories(first:${count}){id}}&orperationName=allStories&variables=first`, {
            method: 'GET',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }
    return {
        query
    }
}

if(program.count) {
    getAccessToken(program.count)
}