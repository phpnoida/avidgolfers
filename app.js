const express=require('express');
const courseRoute=require('./routes/course');
const groupRoute=require('./routes/group');
const userRoute=require('./routes/user');

const app=express();

app.use(express.json());
app.use('/api',courseRoute);
app.use('/api',groupRoute);
app.use('/api',userRoute);

module.exports=app;