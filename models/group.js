const mongoose = require('mongoose');
const moment=require('moment');
const groupsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    profilePicture: {
        type: String,
    },
    users: [{
        id: {
            type: String,
            required: true,
            ref: "Users"
        },
        status: {
            type: Number,
            default: 0, // 0=pending , 1=active , 2=reject, 3=remove
        },
        isAdmin: {
            type: Boolean,
            default: false,
            require: true
        },
        isUserMute: {
            type: Boolean,
            default: false
        },
        isSuperAdmin: {
            type: Boolean,
            default: false,
            require: true
        }
    }],
    mutedUsers: [{
        type: String,
        ref: "Users"
    }],
    status: {
        type: Boolean,
        default: false //1-active 2-deactive
    },
    hasMessageReported: {
        type: Boolean,
        default: false
    },
    hasHiddenMessage: {
        type: Boolean,
        default: false,
    },
    totalReports: {
        type: Number,
        default: 0
    },
    firstComment: {
        type: String,
        default: null
    },
    lastUpdate: {
        type: Number,
        default: moment().unix()
    }
}, { timestamps: true });

groupsSchema.index({ name: 'text' });

const Group=mongoose.model('Groups', groupsSchema);

module.exports = Group;