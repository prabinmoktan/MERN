import mongoose,{Schema} from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
    
    username:{
        required: true,
        unique: true,
        type: String,
        index: true,
        lowercase: true,
        trim: true
    },
    email: {
        required: true,
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        
            required: true,
            type: String,
            minLength: 6,
            maxLength: 64,
            // validate: {
            //     validator: function(v) {
            //       return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
            //     },
            //     message: props => `${props.value} is not a valid password. It must contain at least one uppercase letter, one lowercase letter, one number, and one special character.`
            //   }
        
    },
    image:{
      type:String,
      default: '',
    }
    // confirmPassword: {
    //     required: true,
    //     type: String,
    //     validate: {
    //         validator: function(v) {
    //           return v === this.password;
    //         },
    //         message: 'Passwords do not match'
    //       }
    //     }
    },
    {
      timestamps: true
    }

);

userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();
  this.password =await bcrypt.hash(this.password,10)
  next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

 userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
    _id: this._id,
    username: this.username,
    email: this.email,
    },
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn: process.env.ACCESS_TOKEN_EXPIRY},
  )
}

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign({
    _id: this._id,
    username: this.username,
    email: this.email,
    },
  process.env.REFRESH_TOKEN_SECRET,
  { expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
  )
}

export const User = mongoose.model('User', userSchema);