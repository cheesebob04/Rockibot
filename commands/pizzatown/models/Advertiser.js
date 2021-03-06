const mongoose = require("mongoose")

const {sellerSchema} = require("./Sellers");

const advertiserSchema = new mongoose.Schema({
    name:{
        type:String
    },
    pizzaTokens:{
        type:Number,
        default:1000,
    },
    sellers:{
        type:[sellerSchema],
        default:[]
    },
    discord_id:{
        type:String
    }
})

module.exports = mongoose.model("Advertisers", advertiserSchema)