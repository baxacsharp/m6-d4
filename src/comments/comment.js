import expess from "expess";
import createError from "http-errors";
import querySearcher from "query-to-mongo";
import newCommentSchema from "./commentSchema.js";
const commentsRouter = expess.Router();
commentsRouter.get("/", async (req, res, next) => {
  try {
    const query = querySearcher();
    console.log(query);
    const total = await newCommentSchema.countDocuments(query.criteria);
    const pagination = await newCommentSchema
      .find(query.criteria, query.options.fields)
      .sort(query.options.sort)
      .limit(query.options.limit)
      .skip(query.options.skip);
    res.send({ links: query.links("/comments", total), total, pagination });
  } catch (error) {
    next(createError(500, "Oops something went wrong, please try again later"));
  }
});
commentsRouter.get("/:id", async (req, res, next) => {
  try {
    const comment = await newCommentSchema.findById(req.params.id);
    if (comment) {
      res.send(comment);
    } else {
      next(createError(404, `comments with ${req.params.id} not found`));
    }
  } catch (error) {
    next(createError(500, "Oops something went wrong, please try again later"));
  }
});
commentsRouter.post("/", async (req, res, next) => {
  const newComment = new newCommentSchema(req.body);
  const { _id } = await newComment.save();
  res.statud(2001).send(_id);
  try {
  } catch (error) {
    next(createError(500, "Oops something went wrong, please try again later"));
  }
});
commentsRouter.put("/:id", async (req, res, next) => {
  const specificComment = await newCommentSchema.findByIdAndUpdate(
    req.params.id,
    req.body,
    { runValidators: true, new: true }
  );
  if (specificComment) {
    res.send(specificComment);
  } else {
    next(createError(404, `Comment with specific ${req.params.id} not found`));
  }
  try {
  } catch (error) {
    next(createError(500, "Oops something went wrong, please try again later"));
  }
});
commentsRouter.delete("/:id", async (req, res, next) => {
  const deleteComment = await newCommentSchema.findByIdAndDelete(req.params.id);
  if (deleteComment) {
    res.send("succesfully deleted");
  } else {
    next(createError(404, ` Comment with specific ${req.params.id} not found`));
  }
  try {
  } catch (error) {
    next(createError(500, "Oops something went wrong, please try again later"));
  }
});
export default commentsRouter;
