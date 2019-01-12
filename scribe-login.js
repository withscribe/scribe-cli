#!/usr/bin/env node

const readline = require('readline');
const program = require('commander');
const requestPromise = require('request-promise');
require('dotenv')

const ENDPOINT = 'http://138.197.130.167/scribe'

program
  .option('-e, --email <argument>', 'Enter email as argument')
  .option('-p --password <argument>', 'Enter password as argument')
  .parse(process.argv);

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write("*");
  else
    rl.output.write(stringToWrite);
};

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
            rl.close();
        });
    })
}

loginMutation = (email, password) => {
    return {
        "query": `
        mutation loginMutation($email: String!, $password: String!, $rememberMe: Boolean!) { login(email: $email, password: $password, rememberMe: $rememberMe) { token } }
        `,
        variables: { email: `${email}`, password: `${password}`, rememberMe: false }
    }
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

if(program.email !== null && program.password !== null) {
    rp().post(loginMutation(program.email, program.password)).then(res => {
        const { login } = res.data
        if(login !== null) {
            console.log()
            console.log("\n****************************************************************************")
            console.log("\t\t      SCRIBE ACCESS TOKEN")
            console.log("****************************************************************************")
            console.log(login.token)
            console.log()
            process.exit(1)
        } else {
            console.log("\nIncorrect Username or Password. Try again.\n")
            process.exit(1)
        }
    }).catch((err) => {
        console.error(err)
    })
} else {
    getEmail().then((emailInput) => {
        const email = emailInput
        getPassword().then(function(passwordInput) {
            const password = passwordInput
            rp().post(loginMutation(email, password)).then(res => {
                const { login } = res.data
                if(login !== null) {
                    console.log()
                    console.log("\n****************************************************************************")
                    console.log("\t\t      SCRIBE ACCESS TOKEN")
                    console.log("****************************************************************************")
                    console.log(login.token)
                    console.log()
                    process.exit(1)
                } else {
                    console.log("\nIncorrect Username or Password. Try again.\n")
                    process.exit(1)
                }
            }).catch((err) => {
                console.error(err)
            })
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




