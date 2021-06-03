import express from "express";
import { Transform } from "json2csv";
import createError from "http-errors";
import { pipeline } from "stream";
import uniqid from "uniqid";
import multer from "multer";
import {
  getAuthors,
  writeAuthors,
  writeAuthorAvatars,
  getReadStreamCsv,
} from "../helpers/files.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const Authors = await getAuthors();
  res.send(Authors);
});
router.get("/:id/createCsv", (req, res, next) => {
  try {
    const field = ["name", " surname", "email"];
    const options = { field };
    const json2csv = new Transform(options);
    res.setHeader("Content-Disposition", `attachment; filename=export.csv`);

    const source = getReadStreamCsv();
    // console.log(getReadStreamCsv());
    // console.log(source);
    pipeline(source, json2csv, res, (err) => {
      console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res) => {
  const authors = await getAuthors();

  const author = authors.find((author) => author._id === req.params.id);

  author
    ? res.send(author)
    : res.send("Author does not exist, check your author ID");
});

router.post("/", async (req, res) => {
  const authors = await getAuthors();

  if (authors.find((author) => author.email === req.body.email)) {
    res.send("email already in use, please try a different email.");
  } else {
    const author = req.body;
    author._id = uniqid();
    author.createdOn = new Date();
    authors.push(author);

    await writeAuthors(authors);

    res.send(author);
  }
});

router.put("/:id", async (req, res) => {
  const authors = await getAuthors();
  const newAuthorsArray = authors.filter(
    (author) => author._id !== req.params.id
  );
  const author = authors.find((author) => author._id === req.params.id);

  if (!author) {
    next(createError(400, "id does not match"));
  }

  const updatedAuthor = {
    ...req.body,
    createdOn: author.createdOn,
    _id: author._id,
    lastUpdatedOn: new Date(),
  };
  newAuthorsArray.push(updatedAuthor);

  await writeAuthors(newAuthorsArray);

  res.send(updatedAuthor);
});

router.delete("/:id", async (req, res) => {
  const authors = await getAuthors();
  const newAuthorsArray = authors.filter(
    (author) => author._id !== req.params.id
  );

  await writeAuthors(newAuthorsArray);

  res.send("Author deleted successfully");
});

router.post(
  "/:id/uploadAvatar",
  multer().single("authorAvatar"),
  async (req, res, next) => {
    try {
      console.log(req.file);
      const authors = await getAuthors();

      let author = authors.find((author) => author._id === req.params.id);
      if (!author) {
        next(createError(400, "id does not match"));
      }

      await writeAuthorAvatars(req.params.id + ".jpg", req.file.buffer);

      author.avatar = `http://localhost:3001/images/authorAvatars/${req.params.id}.jpg`;

      const newAuthors = authors.filter(
        (author) => author._id !== req.params.id
      );
      newAuthors.push(author);
      await writeAuthors(newAuthors);

      res.status(200).send("Image uploaded successfully");
    } catch (error) {
      next(error);
    }
  }
);

export default router;
