// ==UserScript==
// @name         ddgAlternativeEngines
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add alternative search engines to duck duck go
// @author       Georgy
// @match        https://duckduckgo.com/?q=*
// @exclude      https://duckduckgo.com/?q=
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  window.onload = () => {

    const searchBarElement = document.getElementsByClassName('header__content header__search')[0]
    searchBarElement.style.width = 'calc(100% - 115px)'
    searchBarElement.style.display = 'inline-block'

    const searchContainer = document.getElementsByClassName('header__search-wrap')[0]
    const searchValue = document.location.search.match(/\?q=([^&]+)/)[1]

    const googleButton = document.createElement('a')
    googleButton.className = 'result--more__btn btn btn--full'
    googleButton.style.marginLeft = '11px'
    googleButton.style.marginBottom = '5px'
    googleButton.style.lineHeight = '2.4'
    googleButton.style.width = '14px'
    googleButton.style.display = 'inline-block'
    googleButton.textContent = 'G'
    googleButton.href = `https://www.google.com/search?q=${searchValue}`
    googleButton.rel = 'noopener noreferrer'
    googleButton.target = '_blank'
    searchContainer.appendChild(googleButton)

    const yandexButton = document.createElement('a')
    yandexButton.className = 'result--more__btn btn btn--full'
    yandexButton.style.marginLeft = '5px'
    yandexButton.style.marginBottom = '5px'
    yandexButton.style.lineHeight = '2.4'
    yandexButton.style.width = '14px'
    yandexButton.style.display = 'inline-block'
    yandexButton.textContent = 'Y'
    yandexButton.href = `https://yandex.ru/search/?text=${searchValue}`
    yandexButton.rel = 'noopener noreferrer'
    yandexButton.target = '_blank'
    searchContainer.appendChild(yandexButton)
  }
})();