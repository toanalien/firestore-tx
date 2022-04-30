const async = require('async')
const axios = require('axios')
const uid = "12345678"
const endpoint = process.env.ENDPOINT
const totalCall = 180000;
const concurrency = 3000;

let errCount = 0;
let successCount = 0;

let counting = []
for (let i = 0; i < totalCall; i++) {
    counting.push(i)
}

(async () => {
    let createProfileEndpoint = `${endpoint}/createProfile`
    let resp = await axios.post(createProfileEndpoint, { uid })
    console.log(resp)

    let transactionEndpoint = `${endpoint}/testTransaction`
    async.eachLimit(counting, concurrency, function (count, callback) {
        console.log(`call ${count}`)
        axios.post(transactionEndpoint, { uid }).then(function (resp) {
            console.log(`success ${count}`)
            successCount++;
            callback()
        }).catch(function (e) {
            console.log(`fail ${count}`)
            console.log(e)
            errCount++;
            callback()
        })
    }, function (e) {
        console.log(e)
        console.log("finished")
        console.log({ successCount, errCount })
    })
})();