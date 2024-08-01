import cloudinary from "cloudinary";

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

//config cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const createPost = async (req, res) => {
  console.log("Post=>", req.body);
  const { content, image } = req.body;
  if (!content.length) {
    return res.json({
      error: "content is required",
    });
  }

  try {
    const imageValue = image.length>0 ? image : "";

    // Construct the query and values
    const query = `INSERT INTO Posts (content, image_url, postedBy) VALUES (?, ?, ?)`;
    const values = [content, imageValue, req.auth._id];

    // Execute the query
    const [result] = await pool.query(query, values);

    // Get the inserted post ID
    const insertedId = result.insertId;

    // Retrieve the newly inserted row
    const [newPostResult] = await pool.query(
      `SELECT id, content, image_url, postedBy FROM Posts WHERE id = ?`,
      [insertedId]
    );

    const newPost = newPostResult[0];

    res.json(newPost);
    console.log(newPost);
  } catch (error) {
    console.log("Error while creating post server => ", error);
    res.sendStatus(400);
  }
};

// UPLOAD IMAGE FUNCTIONALITY TO BE VIEWED AND MODIFIED LATER
export const uploadImage = async (req, res) => {
  // console.log(req.files.image.path);
  try {
    const result = await cloudinary.uploader.upload(req.files.image.path);
    // console.log(result);

    const imageUrl = result.secure_url;
    const publicId = result.public_id;
    const query = `
    UPDATE Posts
    SET image_url = ?
    WHERE id = ?
    RETURNING id, content, image_url, postedBy
  `;

    const values = [imageUrl, req.body.postId]; // Assuming req.body.postId is passed from client
    const dbResult = await pool.query(query, values);
    const updatedPost = dbResult.rows[0];

    res.json({
      url: imageUrl,
      public_id: publicId,
      post: updatedPost
    });
  } catch (error) {
    console.log("ERROR WHILE UPLOAD IMAGE SERVER => ", error);
  }
};

// post-rendring
export const postByUser = async (req, res) => {
  try {
    // Fetch the IDs of users the current user is following
    const [followingResults] = await pool.query(
      `SELECT follower_id FROM Followers WHERE user_id = ?`, [req.auth._id]
    );

    // Convert the result into an array of user IDs
    const followingIds = followingResults.map(row => row.follower_id);
    followingIds.push(req.auth._id); // Add the current user's ID

    // Prepare a string of placeholders for the SQL query
    const placeholders = followingIds.map(() => '?').join(',');

    // Fetch the posts made by the current user and followed users
    const [posts] = await pool.query(
      `SELECT 
         p.id,
         p.content,
         p.image_url,
         p.createdAt,
         u.id AS user_id,
         u.name,
         u.image_url AS user_image,
         (SELECT JSON_ARRAYAGG(l.user_id) FROM Likes l WHERE l.post_id = p.id) AS likes,
         (SELECT JSON_ARRAYAGG(
             JSON_OBJECT(
               'id', c.id,
               'text', c.text,
               'created', c.created,
               'postedBy', c.postedBy,
               'name', (SELECT name FROM Users WHERE id = c.postedBy),
               'user_image', (SELECT image_url FROM Users WHERE id = c.postedBy)
             )
           ) FROM Comments c WHERE c.post_id = p.id
         ) AS comments
       FROM Posts p
       JOIN Users u ON p.postedBy = u.id
       WHERE p.postedBy IN (${followingIds.map(() => '?').join(', ')})
       ORDER BY p.createdAt DESC
       LIMIT 10`,
      followingIds
    );
    

    // Send the result as JSON
    console.log(posts)
    res.json(posts);
  } catch (error) {
    console.log("ERROR while post rendering SERVER => ", error);
    res.status(500).send("Server Error");
  }
};


//post-edit
export const userPost = async (req, res) => {
  try {

    const postId = req.params._id;

    const query = `
    SELECT p.id, p.content, p.image_url, p.postedBy, u.name, u.image
    FROM Posts p
    JOIN Users u ON p.postedBy = u.id
    WHERE p.id = ?`;

    const values = [postId];

    const result = await pool.query(query,values);
    const post = result.rows[0];

    if(!post){
      return res.status(404).send("Post not found");
    }

    res.json(post);
  } catch (error) {
    console.log("Error while UserPost edit server =>", error);
  }
};

//update post
export const updatePost = async (req, res) => {
  // console.log("Post update", req.body);

  const postId = req.params._id;
  const { content, image } = req.body;
  try {

    const query = `
    UPDATE Posts
    SET content = ?, image_url = ?
    WHERE id = ?
    RETURNING id, content, image_url, postedBy`;

    const values = [content,image,postId];

    const result = await pool.query(query,values);
    const updatedPost = result.rows[0];

    if(!updatePost){
      return res.status(404).send("Post not found");
    }
    res.json(updatePost);
  } catch (error) {
    console.log("Error while update post server =>", error);
  }
};

//delete Post to be updated according to the uploading software i use
export const deletePost = async (req, res) => {
  const postId = req.params._id;
  console.log("Post ID:", postId);
  
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Delete likes associated with the post
    await connection.query('DELETE FROM Likes WHERE post_id = ?', [postId]);
    
    // Delete comments associated with the post
    await connection.query('DELETE FROM Comments WHERE post_id = ?', [postId]);

    // Delete the post itself
    const [result] = await connection.query('DELETE FROM Posts WHERE id = ?', [postId]);
    console.log("Delete result:", result);

    if (result.affectedRows > 0) {
      await connection.commit();
      res.status(200).send({ message: 'Post and associated data deleted successfully' });
    } else {
      await connection.rollback();
      res.status(404).send({ message: 'Post not found' });
    }
  } catch (error) {
    await connection.rollback();
    console.error('Error occurred:', error);
    res.status(500).send({ message: 'An error occurred', error });
  } finally {
    connection.release();
  }
};
//like post
export const likePost = async (req, res) => {
  try {
    console.log(req.auth._id);
    const postId = req.body._id;
    console.log(postId);
    const checkLikeQuery = `SELECT * FROM Likes WHERE post_id = ? AND user_id = ?`;
    const checkLikeValues = [postId, req.auth._id];
    const [checkLikeResult] = await pool.query(checkLikeQuery, checkLikeValues);
    console.log("This is " ,checkLikeResult);
    
    if(checkLikeResult.length>0){
      return res.status(400).send("You have already liked this post");
    }
    console.log("hi");
    
    const addLikeQuery = `INSERT INTO Likes (post_id, user_id) VALUES (?, ?)`;
    const addLikeValues = [postId, req.auth._id];
    
    try {
      const [result] = await pool.query(addLikeQuery, addLikeValues);
      console.log('Like added successfully:', result);
    } catch (error) {
      console.log('Error executing addLikeQuery:', error);
    }

    const fetchPostQuery = `
    SELECT id, content, image_url, postedBy FROM Posts WHERE id= ?`;
    const fetchPostValues = [postId];
    const fetchPostResult = await pool.query(fetchPostQuery,fetchPostValues);
    const post = fetchPostResult[0];
    res.json(post);

  } catch (error) {
    console.log("likepost => ", error);
  }
};

export const unlikePost = async (req, res) => {
  const postId = req.body._id
  console.log(postId);
  try {
    const removeLikeQuery = `
    DELETE FROM Likes where post_id = ? AND user_id = ?`;
    
    const removeLikeValues = [postId, req.auth._id];
    await pool.query(removeLikeQuery, removeLikeValues);
    
    const fetchPostQuery = `
    SELECT id, content, image_url, postedBy FROM Posts where id= ?`;
    
    const fetchPostValues = [postId];
    const fetchPostResult = await pool.query(fetchPostQuery, fetchPostValues);
    const post = fetchPostResult[0];

    res.json(post);
  } catch (error) {
    console.log("unlikePost", error);
  }
};

export const addComment = async (req, res) => {
    const postId = req.body._id;
    const comment = req.body.comment;
    console.log(comment);
    console.log(postId);

    try{
      const addCommentResult = await pool.query(`INSERT INTO Comments (post_id, text, postedBy) VALUES (?,?,?)`,[postId,comment,req.auth._id])
      console.log(addCommentResult[0]);
      res.json(addCommentResult);
    }
    catch (error) {
      console.log("unlikePost", error);
    }
}
