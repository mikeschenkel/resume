const getTwitterAvatarUrl = require("twitter-avatar-url");
const eleventyImage = require("@11ty/eleventy-img");

const isProd = process.env.ELEVENTY_ENV === 'production';

function getImageOptions(username) {
  return {
    widths: [72],
    urlPath: "/assets/images/avatars/",
    outputDir: "./dist/assets/images/avatars/",
    formats: isProd ? ["avif", "webp", "jpeg"] : ["webp", "jpeg"],
    cacheDuration: "4w",
    filenameFormat: function(id, src, width, format) {
      return `${username.toLowerCase()}.${format}`;
    }
  };
}

function fetchImageData(username, url) {
  if(!url) {
    throw new Error("src property required in `img` shortcode.");
  }

  // return nothing, even though this returns a promise
  eleventyImage(url, getImageOptions(username)).then(function() {

  });
}

async function imgAvatar(username, classes = "") {
  // We know where the images will be
  let fakeUrl = `https://twitter.com/${username}.jpg`;
  let imgData = eleventyImage.statsByDimensionsSync(fakeUrl, 400, 400, getImageOptions(username));
  let markup = eleventyImage.generateHTML(imgData, {
    alt: `${username}’s Avatar`,
    class: "avatar" + (classes ? ` ${classes}` : ""),
    loading: "lazy",
    decoding: "async",
  }, {
    whitespaceMode: "inline"
  });

  return markup;
}

module.exports = function(eleventyConfig) {
  let usernames;

  eleventyConfig.on("beforeBuild", () => {
    usernames = new Set();
  });
  eleventyConfig.on("afterBuild", () => {
    let arr = Array.from(usernames);
    console.log( `Generating ${arr.length} Twitter avatars.` );
    getTwitterAvatarUrl(arr).then(results => {
      for(let result of results) {
        fetchImageData(result.username, result.url.large);
      }
    });
  });

  eleventyConfig.addNunjucksAsyncShortcode("imgavatar", async function(username, classes = "") {
    usernames.add(username.toLowerCase());
    return imgAvatar(username, classes);
  });
};
