const { DateTime } = require('luxon');
const iconsprite = require('./_11ty/iconsprite.js');
const markdownIt = require('markdown-it');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginImageAvatar = require("./_11ty/imageAvatarPlugin");

module.exports = function (eleventyConfig) {

  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginImageAvatar);

  eleventyConfig.addFilter('dateToFormat', (date, format) => {
    return DateTime.fromJSDate(date, { zone: 'Europe/Amsterdam' }).toFormat(
      String(format)
    )
  });

  eleventyConfig.addFilter('dateToISO', date => {
    return DateTime.fromJSDate(date, { zone: 'Europe/Amsterdam' }).toISO({
      includeOffset: false,
      suppressMilliseconds: true
    })
  });

  eleventyConfig.addFilter('obfuscate', str => {
    const chars = []
    for (var i = str.length - 1; i >= 0; i--) {
      chars.unshift(['&#', str[i].charCodeAt(), ';'].join(''))
    }
    return chars.join('')
  });

  eleventyConfig.addFilter('stripSpaces', str => {
    return str.replace(/\s/g, '')
  });

  eleventyConfig.addFilter('stripProtocol', str => {
    return str.replace(/(^\w+:|^)\/\//, '')
  });

  eleventyConfig.addNunjucksAsyncShortcode('iconsprite', iconsprite);

  eleventyConfig.addShortcode('icon', (name, isSocial) => {
    const id = name.toLowerCase().replace(/\s/g, '')
    const availableSocialIcons = [
      'github',
      'twitter',
      'linkedin',
      'skype',
      'dribbble',
      'behance',
      'medium',
      'reddit',
      'slack',
      'whatsapp'
    ]
    if (isSocial && !availableSocialIcons.includes(id)) {
      return `<span aria-hidden="true">${name}:&nbsp;</span>`
    }
    return `<svg class="icon icon--${id}" role="img" aria-hidden="true" width="24" height="24">
              <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-${id}"></use>
            </svg>`;
  });

  // Markdown
  eleventyConfig.setLibrary(
    'md',
    markdownIt({
      html: true,
      breaks: true,
      linkify: true,
      typographer: true
    })
  );

  // Layouts
  eleventyConfig.addLayoutAlias('base', 'base.njk');
  eleventyConfig.addLayoutAlias('resume', 'resume.njk');

  // Collections
  const collections = ['work', 'community', 'education'];
  collections.forEach((name) => {
    eleventyConfig.addCollection(name, function (collection) {
      const folderRegex = new RegExp(`\/${name}\/`)
      const inEntryFolder = (item) =>
        item.inputPath.match(folderRegex) !== null

      const byStartDate = (a, b) => {
        if (a.data.start && b.data.start) {
          return a.data.start - b.data.start;
        }
        return 0;
      }

      return collection
        .getAllSorted()
        .filter(inEntryFolder)
        .sort(byStartDate)
        .sort((a, b) => {
          return a.data.order - b.data.order;
        })
        .reverse();
    })
  });

  // Pass-through files
  eleventyConfig.addPassthroughCopy('src/robots.txt');
  eleventyConfig.addPassthroughCopy('src/assets/images');
  eleventyConfig.addPassthroughCopy('src/assets/scripts');
  eleventyConfig.addPassthroughCopy('src/assets/fonts');

  // Deep-Merge
  eleventyConfig.setDataDeepMerge(true);

  // Asset Watch Targets
  eleventyConfig.addWatchTarget('./src/assets');

  // BrowserSync Options
  eleventyConfig.setBrowserSyncConfig({
    open: true,
  });

  // Base Config
  return {
    dir: {
      input: 'src',
      output: 'dist',
      includes: 'includes',
      layouts: 'layouts',
      data: 'data'
    },
    templateFormats: ['njk', 'md', '11ty.js'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  }
}
