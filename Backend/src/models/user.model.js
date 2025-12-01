

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema ( {
    email : {
        type: String,
        required: true, 
        unique: true,
    },

    fullName: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        }
    },
    password: {
        type: String
    }
},
    {
        timestamps: true,
        // This helps in telling that when user was created and when was it updated in MongoDB database
    }
)

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;




// TIMESTAMPS :
// When we set timestamps: true in a Mongoose schema, Mongoose automatically adds two fields to the schema: createdAt and updatedAt.
// Telling when a document(user) was created and last updated.


