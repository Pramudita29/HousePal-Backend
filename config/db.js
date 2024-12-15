const mongoose=require("mongoose");

const connectDB=async() => {
    try{
        await mongoose.connect("mongodb://localhost:27017/db_houseHelper")
        console.log("MongoDB Connected")
    }
    catch(e){
        console.log("MongoDB not Connected")
    }
}



module.exports=connectDB