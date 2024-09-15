import mongoose,{Schema} from "mongoose";
import mongooseAggregatePipeline from 'mongoose-aggregate-paginate-v2'

const tweetSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

}, {
    timestamps: true
})

tweetSchema.plugin(mongooseAggregatePipeline)

export const Tweet = mongoose.model("Tweet", tweetSchema)