const fetch = require('isomorphic-fetch')
const cheerio = require('cheerio')

/**
 * Returns a promise that resolves into an article.
 *
 *     randomArticle()
 *     .then(article => {
 *       article.id
 *       article.html
 *       article.text
 *     })
 */

function randomArticle () {
  const id = randomId()
  let html

  return fetch(`http://plrplr.com/${id}`)
    .then(checkStatus)
    .then(res => res.text())
    .then(rawHtml => {
      const $ = cheerio.load(rawHtml)
      const html = formatContent($('.entry-content').html())
      const title = formatTitle($('title').html())
      const content = markdownify(html)
      return { id, content, title }
    })
}

/**
 * Cleans up HTML.
 */

function formatContent (text) {
  return text
    .replace(/[\s\r\n\t]+/g, ' ')
    .trim()
    .replace(/\s*<br><br>\s*/g, '</p><p>')
    .replace(/\s*<p>Word count: [^<]*<\/p>\s*/g, '')
    .replace(/\s*<br class="clear-content">\s*/g, '')
}

/**
 * Cleans up the `<title>` tag.
 */

function formatTitle (text) {
  return text
    .replace(/\| Free PLR Article Directory$/g, '')
    .trim()
}

function markdownify (html) {
  const $ = cheerio.load(`<div>${html}</div>`)
  let blocks = []
  $('p').each(function () {
    blocks.push($(this).text())
  })
  return blocks.join('\n\n')
}

/**
 * Returns a random article number.
 */

function randomId () {
  return Math.round(Math.random() * 98000) + 100
}

/**
 * Checks the status of a fetch() call and returns an error for non-2xx and
 * non-3xx responses.
 */

function checkStatus (res) {
  if (res.status >= 200 && res.status < 300) {
    return res
  } else {
    var err = new Error(res.statusText)
    err.response = res
    throw err
  }
}
