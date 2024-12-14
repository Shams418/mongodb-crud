import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
        trim: true,
    },
    description: {
        type: String,
        require: true,
        trim: true,
    },
    user: {
        type:mongoose.Schema.ObjectId,
        ref:"user",
        require:true
    }
})

export const Blog = mongoose.model("Blog", blogSchema);