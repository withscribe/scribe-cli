#!/usr/bin/env node

const readline = require('readline')
const fs = require('fs')
const program = require('commander')
const requestPromise = require('request-promise')
const colors = require('colors')
const clipboardy = require('clipboardy')
require('dotenv').config()

const ENDPOINT = `${process.env.ENDPOINT}`

program
  .option('-e, --email [argument]', 'Enter email as argument')
  .option('-p --password [argument]', 'Enter password as argument')
  .option('-c --copy', 'Copy token to clipboard')
  .parse(process.argv)

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write("*")
  else
    rl.output.write(stringToWrite)
}

getEmail = () => {
  return new Promise(function(resolve, reject) {
    console.log()
    console.log("Login to receive access token")
    console.log()
    rl.question('Email: ', function(email) {
      if(!email.length) {
        reject("You must enter an email. Try again.")
      }
      resolve(email)
    })
  })
}

getPassword = () => {
  return new Promise(function(resolve, reject) {
    process.stdout.write("Password: ")
    rl.stdoutMuted = true;
    rl.on('line', function(password) {
      if(!password.length) {
        reject('You must enter a password. Try again.')
      }
      resolve(password)
      rl.close()
    })
  })
}

loginMutation = (email, password) => {
  return {
    "query": `
      mutation loginMutation($email: String!, $password: String!, $rememberMe: Boolean!) {
        login(email: $email, password: $password, rememberMe: $rememberMe) {
          token
        }
      }
    `,
    variables: { email: `${email}`, password: `${password}`, rememberMe: false }
  }
}

copyToClipboard = (flag, token) => {
  if(flag) {
    clipboardy.write(token)
    console.log(`${colors.bold('token copied to clipboard')}`)
  }
}

persistToken = (token) => {
  fs.writeFileSync('./.scriberc', token, (err) => {
    if(err) {
      console.error(err)
      process.exit(1)
    }
  })
}

rp = () => {
  post = (body) => {
    return requestPromise(ENDPOINT, {
      method: 'POST',
      body,
      json: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  return {
    post
  }
}

consoleView = (email, password) => {
  rp().post(loginMutation(email, password)).then(res => {
    const { login } = res.data
    if(login !== null) {
      console.log()
      console.log("\n****************************************************************************")
      console.log(`${colors.bold(`${colors.white(`\t\t\t${colors.magenta('SCRIBE')} ${colors.black('ACCESS TOKEN')}`)}`)}`)
      console.log("****************************************************************************")
      console.dir(login, { depth: 2, colors: true })
      persistToken(JSON.stringify(login))
      console.log()
      console.log(`${colors.bold('token has been saved to')} ${colors.yellow('.scriberc')}`)
      copyToClipboard(program.copy, login.token)
      console.log()
      process.exit(1)
    } else {
      console.log("\nIncorrect Username or Password. Try again.\n")
      process.exit(1)
    }
  }).catch((err) => {
    console.error(err)
  })
}

if(program.email && program.password) {
  consoleView(program.email, program.password)
} else {
    getEmail().then((emailInput) => {
        const email = emailInput
        getPassword().then((passwordInput) => {
            const password = passwordInput
            consoleView(email, password)
        }).catch((err) => {
            console.log()
            console.error(err)
            process.exit(1)
        })
    }).catch((err) => {
        console.log()
        console.error(err)
        process.exit(1)
    })
}




