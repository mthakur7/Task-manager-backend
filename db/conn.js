const mongoose=require('mongoose')

const db=process.env.DATABASE


mongoose.connect(db,{
    useNewUrlParser: true,
    useUnifiedTopology: true, 

}).then(()=>{
    console.log("connected successfully")
}).catch((e)=>{
    console.log("No connection")
})
