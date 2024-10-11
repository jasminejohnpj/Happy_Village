const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
    Userid :  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SurveyForm'
    },
    userName : {type:String},
    mobile :{type:String},
    password : {type:String},
    role: {type:String}
},{timestamps: false});

module.exports = mongoose.model('Admin' , adminSchema);

