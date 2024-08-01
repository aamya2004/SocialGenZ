// import User from "../models/user.js";
import { comparePassword, hashPassword } from "../helpers/auth.js";
import jwt from "jsonwebtoken";
// import user from "../models/user.js";
import { nanoid } from "nanoid"; // it used to generate userId

// SQL MODIFICATION
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

// for register
export const register = async (req, res) => {
  const { name, email, password, secret } = req.body;

  // Validation
  if (!name) return res.status(400).send("Name is required");
  if (!password || password.length < 6)
    return res.status(400).send("Password should be at least 6 characters long");
  if (!secret) return res.status(400).send("Secret answer is required");

  try {
    // Check if user already exists
    const [existingUsers] = await pool.query(`SELECT * FROM Users WHERE email = ?`, [email]);
    if (existingUsers.length > 0) return res.status(400).send("Email already exists");

    // Hash the password
    const hash = await hashPassword(password);
    const username = nanoid(6);

    // Insert new user into the database
    const insertValues = [name, email, hash, secret, username];
    await pool.query(`INSERT INTO Users (name, email, password, secret, username) VALUES (?, ?, ?, ?, ?)`, insertValues);

    return res.json({ ok: true });
  } catch (error) {
    console.log("Registration failed =>", error);
    return res.status(400).send("Error, try again");
  }
};

export const login = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    // Check if user exists
    const [users] = await pool.query(`SELECT * FROM Users WHERE email = ?`, [email]);
    console.log(users);
    if (users.length === 0) return res.status(400).send("User not found");
    
    const user = users[0];
    console.log(user);
    
    // Check password
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).send("Incorrect password");
    console.log(match);
    
    // Create a JWT token
    const token = jwt.sign(
      { _id: user.id }, // Assuming `id` is the primary key column name in Users table
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log(token);


    // Exclude password and secret from the response
    user.password = undefined;
    user.secret = undefined;

    res.json({
      token,
      user,
    });
  } catch (err) {
    console.log("ERROR WHILE LOGIN =>", err);
    return res.status(400).send("Error, Try again");
  }
};
// this is to check if the user is authorised enoughf to access the protected page
export const currentUser = async (req, res) => {
  // console.log(req.auth._id);
  try {
    // const user = await User.findById(req.auth._id);
    // res.json(user);
    const { _id } = req.auth._id;
    const user = await pool.query(`SELECT * FROM Users where id=?`, [_id]);

    if (user.length === 0) {
      return res.status(400).send("User not found");
    }

    const currentUser = {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      username: user[0].username,
    };

    return res.json(currentUser);
  } catch (err) {
    console.log("Error in CurrentUser=>", err);
    res.sendStatus(400);
  }
};

//-------continue from here -----------------
// for forgot password
export const forgotPassword = async (req, res) => {
  console.log(req.body);
  const { email, newPassword, secret } = req.body;
  //validation
  if (!newPassword || !newPassword < 6) {
    return res.json({
      error: "new Password is required and should be minimum 6 charector long",
    });
  }
  if (!secret) {
    return res.json({
      error: "Secret is required",
    });
  }
  // const user = await user.findOne({ email, secret });

  const user = await pool.query(
    `select * from users where email = ? , secret = ?`,
    [email, secret]
  );

  if (!user) {
    res.json({
      error: "We can't verify you with those details",
    });
  }

  try {
    // remove old password and add new one
    const hashed = await hashPassword(newPassword);
    // await User.findByIdAndUpdate(user._id, { password: hashed });
    await pool.query(`UPDATE Users SET password =? WHERE id =?`, [hashed, _id]);
    return res.json({
      success: "Congrats now you can login with your new Passwrd",
    });
  } catch (error) {
    console.log("Error while forgotPassword =>", error);
    return res.json({
      error: "Sometjing went wrong, Try again",
    });
  }
};

// for profile update
export const profileUpdate = async (req, res) => {
  try {
    // console.log(req.body);
    const data = {};
    if (req.body.username) {
      data.username = req.body.username;
    }
    if (req.body.name) {
      data.name = req.body.name;
    }
    if (req.body.about) {
      data.about = req.body.about;
    }
    if (req.body.image) {
      data.image = req.body.image;
    }

    // let user = await User.findByIdAndUpdate(req.auth._id, data, { new: true });
    let user = await pool.query(`UPDATE users SET name = ?,about=?,username=?,image_url = ? WHERE id = ?;`
      ,[data.name,data.about,data.username,data.image_url,req.auth._id]
    );
    user.password = undefined;
    user.secret = undefined;

    res.json(user);
  } catch (error) {
    if (error.code == 1100) {
      return res.json({ error: "Duplicate Username" });
    }
    console.log("Error while profile updating server =>", error);
  }
};

// for finding people to follow - get all user


export const findPeople = async (req, res) => {
  try {
    const [followedUsersResult] = await pool.query(
      `SELECT follower_id FROM Followers WHERE user_id = ?`,
      [req.auth._id]
    );

    const followedUserIds = followedUsersResult.map(row => row.follower_id);

    let findPeopleQuery;
    let queryParams = [req.auth._id];

    if (followedUserIds.length) {
      const placeholders = followedUserIds.map(() => '?').join(',');
      queryParams = [req.auth._id, ...followedUserIds];
      findPeopleQuery = `
        SELECT id, name, email, about, username, image_url 
        FROM Users 
        WHERE id != ? AND id NOT IN (${placeholders})
      `;
    } else {
      findPeopleQuery = `
        SELECT id, name, email, about, username, image_url 
        FROM Users 
        WHERE id != ?
      `;
    }

    const [findPeopleResult] = await pool.query(findPeopleQuery, queryParams);

    res.json(findPeopleResult);
  } catch (error) {
    console.log("Error in findPeople controller =>", error);
    res.status(500).json({ error: "Server error" });
  }
};

// middeware => when click on follow my id add on that user followers array
export const addFollower = async (req, res, next) => {
  try {
    // const user = await User.findByIdAndUpdate(req.body._id, {
    //   $addToSet: { followers: req.auth._id },
    // });

    await pool.query(
      `INSERT IGNORE INTO Followers (user_id, follower_id) VALUES (?, ?)`,
      [req.body._id, req.auth._id]
    );
    next();
  } catch (error) {
    console.log("Error whiel addFollower middleware controler =>", error);
  }
};

//Follow people -> that user _id add in my following array
export const userFollow = async (req, res) => {
  try {
    console.log(req.auth._id);
    // const user = await User.findByIdAndUpdate(
    //   req.auth._id,
    //   {
    //     $addToSet: { following: req.body._id },
    //   },
    //   { new: true }
    // ).select("-password -secret");

    await pool.query(`INSERT IGNORE INTO Followers (user_id,follower_id) VALUES (?,?)`,
      [req.auth._id, req.body._id]
    );

    const userResult = await pool.query(`SELECT id,name,email,about,username,image_url from Users WHERE id = ?`,
      [req.auth._id]
    )

    const user = userResult[0];
    console.log("Hello");
    console.log(user);
    res.json(user);
  } catch (error) {
    console.log("Error userFollow controller => ", error);
  }
};

//Following page show the all follwoing user
export const userFollowing = async (req, res) => {
  try {
    const followingResult = await pool.query(
      `SELECT Users.id, Users.name, Users.email, Users.about, Users.username, Users.image_url 
       FROM Users 
       JOIN Followers ON Users.id = Followers.follower_id 
       WHERE Followers.user_id = ?`,
      [req.auth._id]
    );

    res.json(followingResult);
  } catch (error) {
    console.log("Error in getUserFollowing controller =>", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const getFollowersCount = async (req, res) => {
  try {
    const followersCountResult = await pool.query(
      `SELECT Users.id, Users.name, COUNT(Followers.follower_id) AS followersCount
       FROM Users 
       JOIN Followers ON Users.id = Followers.user_id 
       WHERE Users.id IN (
         SELECT follower_id 
         FROM Followers 
         WHERE user_id = ?
       )
       GROUP BY Users.id, Users.name`,
      [req.auth._id]
    );

    res.json(followersCountResult);
  } catch (error) {
    console.log("Error in getFollowersCount controller =>", error);
    res.status(500).json({ error: "Server error" });
  }
};

//meddleware
export const removeFollower = async (req, res, next) => {
  try {
    await pool.query(
      `DELETE FROM Followers WHERE user_id = ? AND follower_id = ?`,
      [req.body._id, req.auth._id]
    );
    next();
  } catch (error) {
    console.log("removeFollower =>", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const userUnfollow = async (req, res) => {
  try {
    // Delete the following relationship
    await pool.query(
      `DELETE FROM Followers WHERE user_id = ? AND follower_id = ?`,
      [req.auth._id, req.body._id]
    );

    // Fetch the updated user excluding password and secret
    const userResult = await pool.query(
      `SELECT id, name, email, about, username, image_url FROM Users WHERE id = ?`,
      [req.auth._id]
    );
    const user = userResult.rows[0];

    res.json(user);
  } catch (error) {
    console.log("Error userUnfollow controller =>", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};