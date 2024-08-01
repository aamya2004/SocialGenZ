CREATE DATABASE socialDB;
USE socialDB;

-- basic info of users --
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    secret VARCHAR(255) NOT NULL,
    about VARCHAR(255),
    username VARCHAR(255) UNIQUE NOT NULL,
    image_url VARCHAR(255)
);

-- Finding user followers and following --
CREATE TABLE Followers (
    user_id INT,
    follower_id INT,
    PRIMARY KEY (user_id, follower_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (follower_id) REFERENCES Users(id)
);

-- Posts table --
CREATE TABLE Posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(255) NOT NULL,
    postedBy INT,
    image_url VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postedBy) REFERENCES Users(id)
);

-- Comments table --
CREATE TABLE Comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT,
    text TEXT NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    postedBy INT,
    FOREIGN KEY (post_id) REFERENCES Posts(id),
    FOREIGN KEY (postedBy) REFERENCES Users(id)
);

-- Likes Table --
CREATE TABLE Likes (
    post_id INT,
    user_id INT,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES Posts(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
