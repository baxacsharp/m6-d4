import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON, writeFile, createReadStream } = fs;
export const currentPdf = join(
  dirname(fileURLToPath(import.meta.url)),
  "./mypdf.pdf"
);

const blogCoversFolder = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../public/images/blogCovers"
);
const blogPostsFile = join(
  dirname(fileURLToPath(import.meta.url)),
  "../blogPosts/posts.json"
);

const authorsAvatarFolder = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../public/images/authorAvatars"
);
const authorsFile = join(
  dirname(fileURLToPath(import.meta.url)),
  "../authors/authors.json"
);

export const getBlogPosts = async () => await readJSON(blogPostsFile);
export const writeBlogs = async (content) =>
  await writeJSON(blogPostsFile, content);

export const getAuthors = async () => await readJSON(authorsFile);
export const writeAuthors = async (content) =>
  await writeJSON(authorsFile, content);

export const writeBlogCovers = async (fileName, content) =>
  await writeFile(join(blogCoversFolder, fileName), content);
export const writeAuthorAvatars = async (fileName, content) =>
  await writeFile(join(authorsAvatarFolder, fileName), content);
export const getReadStreamCsv = () => createReadStream(authorsFile);
