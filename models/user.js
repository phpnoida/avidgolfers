const mongoose = require('mongoose')

const userschema = mongoose.Schema({

    profileImg: {
        type: String,
        default: "",
    },
    prefix: {
        type: String,
        default: "",
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        default: "",
    },
    petName: {
        type: String,
        default: "",
    },
    countryCode: {
        type: String,
        default: "+91"
    },
    secondaryCountryCode: {
        type: String,
        default: "+91"
    },
    dob: {
        type: String,
        default: "1990-01-01"
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    phoneScope: {
        type: Number,
        default: 1, //0- no one 1 - everyone 2 - batchonly
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    emailScope: {
        type: Number,
        default: 1, //0- no one 1 - everyone 2 - batchonly
    },
    secondaryPhone: {
        type: String,
        default: "",
    },
    secondaryPhoneScope: {
        type: Number,
        default: 1, //0- no one 1 - everyone 2 - batchonly
    },
    secondaryEmail: {
        type: String,
        default: "",
    },
    secondaryEmailScope: {
        type: Number,
        default: 1, //0- no one 1 - everyone 2 - batchonly
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: Number,
        default: 1, // 0 -female 1 -male
    },
    lgbtqia: {
        type: Boolean,
        default: false
    },
    bloodGroup: {
        type: String,
        default: "",
    },
    profession: {
        type: String,
        default: "",
    },
    designation: {
        type: String,
        default: "",
    },
    company: {
        type: String,
        default: "",
    },
    schoolNumber: {
        type: String,
        default: "",
    },
    batch: {
        type: String,
        default: "",
    },
    house: {
        type: String,
        default: "",
    },
    section: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "",
    },
    state: {
        type: String,
        default: "",
    },
    city: {
        type: String,
        default: "",
    },
    pincode: {
        type: String,
        default: "",
    },
    permanentAddress: {
        type: String,
        default: "",
    },
    correspondenceAddress: {
        type: String,
        default: "",
    },
    isSameAddress: {
        type: Boolean,
        default: false
    },
    status: {
        type: Number, // 0 -pending 1 -active 2 -deactive 3 - rejected 4 -deleted 5 - loggedin 6 - logout 
        default: 0
    },
    aboutMe: {
        type: String,
        default: "",
    },
    schoolMemories: {
        type: String,
        default: "",
    },
    philosophy: {
        type: String,
        default: "",
    },
    hobbies: {
        type: String,
        default: "",
    },
    favMusician: {
        type: String,
        default: "",
    },
    favMovies: {
        type: String,
        default: "",
    },
    favPeople: {
        type: String,
        default: "",
    },
    favSportsTeams: {
        type: String,
        default: "",
    },
    favMovies: {
        type: String,
        default: "",
    },
    favBooks: {
        type: String,
        default: "",
    },
    philanthorpy: {
        type: String,
        default: "",
    },
    photos: {
        type: Array,
        default: [],
    },
    videos: {
        type: Array,
        default: [],
    },
    docs: {
        type: Array,
        default: [],
    },
    tags: {
        type: Array,
        default: [],
    },
    isBulkImport: {
        type: Boolean,
        default: false
    },
    //new data
    //user links
    fb: {
        type: String,
        default: ""
    },
    insta: {
        type: String,
        default: ""
    },
    gplus: {
        type: String,
        default: ""
    },
    wiki: {
        type: String,
        default: ""
    },
    youtube: {
        type: String,
        default: ""
    },
    twitter: {
        type: String,
        default: ""
    },
    whatsapp: {
        type: String,
        default: ""
    },
    linkedinUrl: {
        type: String,
        default: "",
    },
    links: {
        type: Array,
        default: []
    },


    // profession
    linkedPage: {
        type: String,
        default: ""
    },
    designation: {
        type: String,
        default: ""
    },
    company: {
        type: String,
        default: ""
    },
    businessSector: {
        type: String,
        default: ""
    },
    secondaryBusinessSector: {
        type: String,
        default: ""
    },
    mentoring: {
        type: Boolean,
        default: true
    },
    uersExperience: {
        type: Array,
        default: []
    },
    uersEducational: {
        type: Array,
        default: []
    },
    awards: {
        type: Array,
        default: []
    },
    relativeInSchool: [{
        relativeName: String,
        relationship: String,
        relativeProfileImg: String,
        batch: String,
        house: String,
        section: String,
        schoolNumber: String,
        _id: String,
    }],

    //my family
    children: {
        type: Array,
        default: []
    },
    relationsheepStatus: {
        type: String,
        default: ""
    },
    motherName: {
        type: String,
        default: ""
    },
    fatherName: {
        type: String,
        default: ""
    },
    spouseName: {
        type: String,
        default: ""
    },
    spousePhoto: {
        type: String,
        default: ""
    },
    dateOfMarriage: {
        type: String,
        default: ""
    },
    dateOfMarriage: {
        type: String,
        default: ""
    },
    lastseen: {
        type: Number,
        default: 0
    },
    chatLastseen: {
        type: Number,
        default: 0
    },
    chatOnline: {
        type: Boolean,
        default: false
    },
    deviceType: {
        type: Number,
        default: 0 //0 -android 1 -ios
    },
    deviceTypeTxt: {
        type: String,
        default: "android"
    },
    deviceModelNumber: {
        type: String,
        default: ""
    },
    following: {
        type: Array,
        default: [],
        ref: "Users"
    },
    followers: {
        type: Array,
        default: [],
        ref: "Users"
    },
    postSettings: [{
        type: Number
    }],
    //list of ids

    myPostsNotifySettings: {
        type: Number,
        default: 0
            //0-no notification 1-send notification on all comments 2-twice a day 3-one a day
    },
    myCommentNotifySettings: {
        type: Number,
        default: 0
            //0-no notification 1-send notification on all replies 2-twice a day 3-one a day
    },
    generalPostsNotifySettings: {
        type: Number,
        default: 0
            //0-no notification 1-send notification on all new post 2-twice a day 3-one a day 4-every hour 5-every two hour
    },
    chatNotificationSettings: {
        type: Number,
        default: 1 // 0 = off , 1 = on
    },
    enableChat: {
        type: Number,
        default: 1 // 0 = off , 1 = on 
    },
    lastmyPostNotifyAt: {
        type: Number,
        default: 0
    },
    lastmyCommentNotifyAt: {
        type: Number,
        default: 0
    },
    lastGenPostNotifyAt: {
        type: Number,
        default: 0
    },
    unreadMessageNotificationSettings: {
        type: Number,
        default: 1 //0-no notification 1-one a day
    },
}, {
    timestamps: true
})

const User = mongoose.model('User',userschema);
module.exports=User;