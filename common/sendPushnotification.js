const axios = require("axios")

//fcm settings
const fcmurl = "https://fcm.googleapis.com/fcm/send"
const headers = {
    "Authorization": `Bearer ${process.env.FCM_SERVER_KEY}`,
    "Content-Type": "application/json"
}


//function for call fcm post api
const fcmApiCall = async (body) => new Promise(async (resolve, reject) => {
    axios.post(fcmurl, body, { headers }).then((response) => {
        console.log("[axios fcm api]", JSON.stringify(response.data))
        resolve(response.data);
    }).catch((error) => {
        console.log('[axios fcm api] error-->', error.response);
        reject(error.response);
    }
    )
})


const sendNotification = async (userid,ntitle,nbody,eventType) => {
    console.log('amit',userid,ntitle,nbody,eventType);

    //logic for send push notification
    let fcmbody = {
        "sound": "default",
        "collapse_key": "type_a",
        "priority": "high",
        "content_available": true,
        "data": {
            "body": nbody,
            "title": ntitle,
            "eventType":eventType,//for social media notification
            
        }
    }
    fcmbody.to = "/topics/fcm-" + userid
    fcmbody.notification = fcmbody.data
//     if (deviceType == 1) {
//         fcmbody.notification = fcmbody.data
//     }
    try {
        await fcmApiCall(fcmbody)
        console.log("sent :->", fcmbody.to)
    } catch (error) {
        console.log("[fcmnotify] error while sending notification:->", error)
    }
}

module.exports = { sendNotification }