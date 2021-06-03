import express from "express";
// import { sendEmail } from "../helpers/email.js";
import mongoose from "mongoose";
// import fs from "fs"
// import { fileURLToPath } from "url";
// import { dirname, join, extname } from "path";
// import uniqid from "uniqid";
import createError from "http-errors";
import postValidation from "./validation.js";
// import { validationResult } from "express-validator";
import multer from "multer";
// import fs from "fs-extra";
import { getBlogPosts, writeBlogs, writeBlogCovers } from "../helpers/files.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import commentsSection from "../comments/commentSchema.js";
import commentSchema from "../comments/commentSchema.js";
// import { pipeline } from "stream";
// import { generatePDFStream } from "../helpers/upload.js";

// const { readJSON, writeJSON, writeFile, createReadStream } = fs;

const router = express.Router();

// const imagesPath = join(
//   dirname(fileURLToPath(import.meta.url)),
//   "../../public/images/blogCovers"
// );

router.get("/", async (req, res, next) => {
  try {
    const blogs = await postValidation.find().populate("comments");
    // if (req.query.title) {
    //   const filteredBlogs = blogs.filter((post) =>
    //     post.title.toLowerCase().includes(req.query.title.toLowerCase())
    //   );

    //   filteredBlogs.length > 0
    //     ? res.status(200).send(filteredBlogs)
    //     : next(createError(404, `No Blogs with title: ${req.query.title}`));
    // } else {
    //   blogs.length > 0
    //     ? res.send(blogs)
    //     : next(createError(404, "No blogs available!"));
    // }
    res.send(blogs);
  } catch (error) {
    next(createError(400, "Error occured while finding posts"));
  }
});
// router.get("/:id/pdfDownload", async (req, res, next) => {
//   try {
//     await generatePDFStream();
//     res.send("generated");
//     // const destination = res;
//     // res.setHeader("Content-Disposition", "attachment; filename=export.pdf"); // The way to acces the file in your laptop
//     //the way to connect source to destination
//   } catch (error) {
//     next(error);
//   }
// });

router.get("/:id", async (req, res, next) => {
  try {
    const blogs = await postValidation.findById(req.params.id);
    if (blogs) {
      res.send(blogs);
    } else {
      next(createError(404, `Blogpost by ${req.params.id} not found`));
    }
    // const post = blogs.find((post) => post._id === req.params.id);
    // post
    //   ? res.status(200).send(post)
    //   : next(
    //       createError(404, "Blog post not found, check your ID and try again!")
    //     );
  } catch (error) {
    next(createError(500, "Error occured while finding the posts"));
  }
});

router.post("/", async (req, res, next) => {
  try {
    const newUser = new postValidation(req.body);
    const { _id } = await newUser.save();
    res.status(201).send(_id);

    // const blogs = await postValidation();
    // const response = await sendEmail("Umidjanubaydullayev@gmail.com");
    // console.log(response);
    // const errors = validationResult(req);

    // if (errors.isEmpty()) {
    //   const post = { ...req.body, _id: uniqid(), createdOn: new Date() };
    //   blogs.push(post);
    //   await writeBlogs(blogs);
    //   res.status(201).send(post);
    // } else {
    //   next(createError(400, errors));
    // }
  } catch (error) {
    next(error);
    if (
      (error.title || error.category || error.content || error.author) ===
      "ValidationError"
    ) {
      next(createError(400, error));
    } else {
      next(createError(500, "An error occurred while saving student"));
    }
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const blog = await postValidation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { runValidators: true, new: true }
    );
    // const errors = validationResult(req);
    if (blog) {
      res.send(blog);
    } else {
      next(createError(404, `post with ${req.params.id} id not found`));
    }
    // if (errors.isEmpty()) {
    //   const post = blogs.find((post) => post._id === req.params.id);
    //   const filtered = blogs.filter((post) => post._id !== req.params.id);
    //   const updatedPost = {
    //     ...req.body,
    //     createdOn: post.createdOn,
    //     _id: post._id,
    //     lastUpdatedOn: new Date(),
    //   };
    //   filtered.push(updatedPost);
    //   await writeBlogs(filtered);
    //   res.status(200).send(post);
    // } else {
    //   next(createError(400, errors));
    // }
  } catch (error) {
    next(createError(500, "error occured while requesting"));
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const blog = await postValidation.findByIdAndDelete(req.params.id);
    // const newPostsArray = blogs.filter((post) => post._id !== req.params.id);
    // await writeBlogs(newPostsArray);
    if (blog) {
      res.send(blog);
    } else {
      next(createError(404, `blog with ${req.params.id} not found`));
    }
  } catch (error) {
    next(createError(500, "Error occured while searching for blogs"));
  }
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blogCovers",
    resource_type: "auto",
  },
});

const upload = multer({
  storage: cloudinaryStorage,
}).single("blogCover");

router.post("/:id/uploadCover", upload, async (req, res, next) => {
  try {
    console.log(req.file);
    const blogs = await getBlogPosts();

    let blog = blogs.find((blog) => blog._id === req.params.id);
    if (!blog) {
      next(createError(400, "id does not match"));
    }

    blog.cover = req.file.path;

    const newBlogs = blogs.filter((blog) => blog._id !== req.params.id);
    newBlogs.push(blog);
    await writeBlogs(newBlogs);

    res.status(200).send("Image uploaded successfully");
  } catch (error) {
    next(error);
  }
});

router.get("/:id/comments", async (req, res, next) => {
  try {
    const getBlogPosts = await postValidation.findById(req.params.id, {
      comments: 1,
      _id: 0,
    });
    if (getBlogPosts) {
      res.send(getBlogPosts);
    } else {
      next(
        createError(404, `blogpost with specific ${req.parasm.id}not found`)
      );
    }
  } catch (error) {
    next(createError(500, "Oops something went wrong, please try again later"));
  }
});
router.get("/:id/comments/:bookId", async (req, res, next) => {
  try {
    const blogpost = await postValidation.findOne(
      {
        _id: req.params.id,
      },
      {
        comments: {
          $elemMatch: { id: req.params.bookId },
        },
      }
    );
    if (blogpost) {
      const { comments } = blogpost;
      if (comments && comments.length > 0) {
        res.send(comments);
      } else {
        next(
          createError(
            404,
            `comment with specific ${req.parasm.bookId}not found`
          )
        );
      }
    } else {
      next(
        createError(404, `blogpost with specific ${req.parasm.id}not found`)
      );
    }
  } catch (error) {
    next(createError(500, "Oops something went wrong, please try again later"));
  }
});

router.post("/:id/comments", async (req, res, next) => {
  try {
    const comment = await new commentSchema(req.body).save();
    await postValidation.findByIdAndUpdate(req.params.id, {
      $push: { comments: comment._id },
    });
    res.status(204).send();
    /**
     *
     *
     *  FIND BLOG
     * IF BLOG EXISTS
     *   CREATE A COMMENT WITCH COMMENT SCHEMA
     *   PUSH COMMENT ID  TO COMMENTS ARRAY
     */
  } catch (error) {
    next(createError(500, "Oops something went wrong, please try again later"));
  }
});
router.put("/:id/comments/:bookId", async (req, res, next) => {
  try {
    const blogpost = await postValidation.findOneAndUpdate(
      { _id: req.params.id, "comments._id": req.params.bookId },
      {
        $set: { "comments.$": req.body },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    if (blogpost) {
      res.send(blogpost);
    } else {
      next(
        createError(404, `Blogposts with specific ${req.params.id} not found`)
      );
    }
  } catch (error) {
    next(createError(500, "Oops something went wrong, please try again later"));
  }
});
router.delete("/:id/comments/:bookId", async (req, res, next) => {
  try {
    const blogpost = await postValidation.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: { _id: req.params.bookId },
        },
      },
      { new: true }
    );
    if (blogpost) {
      res.send("succesfully deleted");
    } else {
      next(
        createError(404, `blogposts with specific ${req.params.id} not found`)
      );
    }
  } catch (error) {
    next(createError(500, "Oops something went wrong, please try again later"));
  }
});

export default router;
