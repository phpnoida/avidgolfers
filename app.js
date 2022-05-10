const express=require('express');
const courseRoute=require('./routes/course');
const groupRoute=require('./routes/group');
const userRoute=require('./routes/user');
const dashboardRoute=require('./routes/dashboard');
//matches
const matchFormatRoute=require('./routes/matchFormat');
const searchfriendsRoute=require('./routes/autoSuggestion');
const scheduleMatchRoute=require('./routes/scheduleMatch');
const ongoingMatchRoute=require('./routes/ongoingMatch')

const app=express();

app.use(express.json());
app.use('/api',courseRoute);
app.use('/api',groupRoute);
app.use('/api',userRoute);
app.use('/api',dashboardRoute);
//matches
app.use('/api',matchFormatRoute);
app.use('/api',searchfriendsRoute);
app.use('/api',scheduleMatchRoute);
app.use('/api',ongoingMatchRoute);

module.exports=app;