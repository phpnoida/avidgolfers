const env=require('dotenv');
env.config();

const connectDB=require('./database');
connectDB();

const app=require('./app');

const server=app.listen('7002',()=>{
    console.log('server is ready...')
})

