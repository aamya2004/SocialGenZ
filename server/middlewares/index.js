import {expressjwt} from "express-jwt" // to verify token
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();


// this verify token if not verify it throw error other wise we are able to access the user id
export const requireSignIn = expressjwt({ 
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
});


const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();


// this verify whether the user is authorised to update/delete the post
export const canEditDeletePost = async (req,res, next) =>{
    try {
        const post = await pool.query(`SELECT * FROM posts where id = ?`,[req.params._id]);
        console.log("POST IN UPDATE DELETE MIDDLEWARE =>", post);
        console.log(post[0][0].postedBy);
        if(req.auth._id != post[0][0].postedBy){
            return res.status(400).send("Unauthorised");
        }
        else{
            next();
        }
    } catch (error) {
        console.log("error while authorise canDeletePost",error);
    }
}