// ==UserScript==
// @name         Sort GoodReads shelf
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Sort GoodReads shelf
// @author       Georgy
// @match        https://www.goodreads.com/shelf/show/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict'

  function getShelfName() {
    const pathNameParts = document.location.pathname.split('/')
    const shelfName = pathNameParts[pathNameParts.length - 1]
    return shelfName
  }

  function getPagePromises(shelfName, pages) {
    const parser = new DOMParser()
    const promises = []
    for (let i = 1; i < pages; i++) {
      promises.push(
        fetch(`https://www.goodreads.com/shelf/show/${shelfName}?page=${i + 1}`)
          .then(res => res.text())
          .then(t => parser.parseFromString(t, 'text/html'))
      )
    }
    return promises
  }

  function getProcessedEntries(allPages) {
    const filteredEntries = allPages.reduce((acc, page, i) => {
      const tiles = Array.from(
        page.querySelectorAll(
          'body > div.content > div.mainContentContainer > div.mainContent > div.mainContentFloat > div.leftContainer > div.elementList'
        )
      )

      const entries = tiles.map(tile => {
        const text = tile
          .querySelector('div.left span.greyText.smallText:not(.role)')
          .innerText.trim()
        const textArr = text.split(' ').filter(a => a)
        return {
          tile,
          rating: Number(textArr[2]),
          ratings: Number(textArr[4].split(',').join('')),
          published: Number(textArr[8])
        }
      })

      return [...acc, ...entries]
    }, [])

    return filteredEntries.sort((a, b) => b.rating - a.rating)
  }

  function render(entries) {
    const container = document.querySelector(
      'body > div.content > div.mainContentContainer > div.mainContent > div.mainContentFloat > div.leftContainer'
    )
    container.innerText = ''

    elementsToKeep.forEach(el => container.append(el))

    entries.forEach(entry => container.append(entry.tile))
  }

  async function showMeTheBest({ published = 0, ratings = 0, pages = 1 } = {}) {
    if (!entriesCache.length) {
      console.log('Request data')
      const shelfName = getShelfName()
      const pagesDOM = await Promise.all(getPagePromises(shelfName, pages))
      const allPages = [document, ...pagesDOM]
      entriesCache = getProcessedEntries(allPages)
    }

    const processedEntries = entriesCache.filter(
      ({ published: p, ratings: r }) => p >= published && r >= ratings
    )

    render(processedEntries)
  }

  let entriesCache = []
  const elementsToKeep = []

  window.onload = function() {
    // Get total number of books and pages available
    const pageIndicator = document
      .querySelectorAll('div.mediumText > span.smallText')[0]
      .textContent.trim()
    const numberOfBooks = Number(
      /\b.{1,5}$/
        .exec(pageIndicator)[0]
        .replace(',', '')
        .trim()
    )
    const numberOfPages = Math.ceil(numberOfBooks / 50)

    // Make breadcrumbs `inline-block` to insert filters right after
    const breadcrumbs = document.getElementsByClassName('breadcrumbs')[0]
    breadcrumbs.style.display = 'inline-block'
    breadcrumbs.style.marginBottom = '16px'
    elementsToKeep.push(breadcrumbs)

    // Insert control buttons
    const container = document.createElement('div')
    container.style.display = 'inline-block'
    container.style.float = 'right'
    container.style.textAlign = 'end'

    const publishedInput = document.createElement('input')
    publishedInput.id = 'published'
    publishedInput.className = 'searchBox__input'
    publishedInput.style.width = '20%'
    publishedInput.style.marginRight = '5px'
    publishedInput.placeholder = 'Published'
    container.append(publishedInput)

    const ratingsInput = document.createElement('input')
    ratingsInput.id = 'ratings'
    ratingsInput.className = 'searchBox__input'
    ratingsInput.style.width = '20%'
    ratingsInput.placeholder = 'Ratings'
    container.append(ratingsInput)

    const button = document.createElement('button')
    button.textContent = 'Sort'
    button.style.marginLeft = '7px'
    button.style.marginRight = '7px'
    button.className = 'button orange'
    button.onclick = () => {
      let ratingsValue = document.getElementById('ratings').value
      let ratings = Number(ratingsValue) || 0
      let publishedValue = document.getElementById('published').value
      let published = Number(publishedValue) || 0
      showMeTheBest({ pages: numberOfPages, ratings, published })
    }
    container.append(button)

    elementsToKeep.push(container)

    // Get page header
    const genreHeader = document.getElementsByClassName('genreHeader')[0]
    elementsToKeep.push(genreHeader)

    breadcrumbs.parentNode.insertBefore(container, breadcrumbs.nextSibling)
  }
})()
