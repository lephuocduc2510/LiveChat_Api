import { IsEmail } from "class-validator";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const UserVerificationSchema = new Schema({
    name: String,
    email: String,
    password: String,
    dateOfBirth: Date,
    verified: Boolean
});