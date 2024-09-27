const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

//Loading environment variables
require("dotenv").config();

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});


// UserSchema.pre('save', async function (next) {
//     const person = this;

//     // Hash the password only if it has been modified (or is new)
//     if (!person.isModified('password')) return next();

//     try {
//         // hash password generation
//         const salt = await bcrypt.genSalt(10);

//         // hash password
//         const hashedPassword = await bcrypt.hash(person.password, salt);

//         // Override the plain password with the hashed one
//         person.password = hashedPassword;
//         next();
//     } catch (err) {
//         return next(err);
//     }
// })

// UserSchema.methods.comparePassword = async function (candidatePassword) {
//     try {
//         // Use bcrypt to compare the provided password with the hashed password
//         const isMatch = await bcrypt.compare(candidatePassword, this.password);
//         return isMatch;
//     } catch (err) {
//         throw err;
//     }
// }

// Create and export the User model
const User =  mongoose.model('User', UserSchema);

module.exports = User;
