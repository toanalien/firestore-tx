const functions = require('firebase-functions')
const firebaseAdmin = require('firebase-admin')
const express = require('express')

firebaseAdmin.initializeApp()
db = firebaseAdmin.firestore()

const app = express()
let cors = require('cors')

let corsOptions = {
    origin: '*'
};

app.use(cors(corsOptions))

const api = functions.https.onRequest(app)


app.post('/createProfile', async (req, res) => {
    let uid = req.body['uid']
    let profileRef = db.collection('profile').doc(uid)
    let profileDoc = await profileRef.get()
    if (!profileDoc.exists) {
        let balance = 0
        await profileRef.set({ uid, balance })
        return res.sendStatus(201)
    } else {
        return res.sendStatus(200)
    }
})

app.post('/testTransaction', async (req, res) => {
    let uid = req.body['uid']
    let profileRef = db.collection('profile').doc(uid)
    try {
        await db.runTransaction(async (t) => {
            let timestamp = new Date().getTime()
            let logRef = db.collection('transactionHistory').doc()
            let profileDoc = await t.get(profileRef)
            let profileData = profileDoc.data()
            let oldBalance = profileData['balance']
            let operator = [1, -1]
            let randomOperator = operator[Math.floor(Math.random() * operator.length)];
            let newBalance = oldBalance + randomOperator * Math.floor(Math.random() * 100)

            await t.update(profileRef, { balance: newBalance });
            await t.set(logRef, { uid, timestamp, oldBalance, newBalance });
            res.sendStatus(200)
            console.log('Transaction success!');
        })
    } catch (e) {
        console.log('Transaction failure:', e);
        res.sendStatus(403)
    }
});

app.get('/counting', async (req, res) => {
    db.collection('transactionHistory').get().then(snap => {
        res.status(200).send({ length: snap.size });
    });
})

module.exports = {
    api
}