const app = require('./app');
const { connectdatabase } = require('./config/database');


connectdatabase();

app.listen(process.env.PORT, ()=>{
    console.log(`server is running on port ${process.env.PORT}`);
})