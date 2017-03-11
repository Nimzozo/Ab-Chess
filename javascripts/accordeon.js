// Accordeon.js
// 2017-03-11
// Copyright (c) 2017 Nimzozo

/*global
    window
*/

/*jslint
    browser, white
*/

window.Accordeon = window.Accordeon || function (containerId, data, options) {
    "use strict";

    var accordeon = {
        container: {},
        options: {
            uniqueOpenList: false
        },
        element: {},
        lists: []
    };

    /**
     * Css classes and ids.    
     */
    var css = {
        accordeon: "accordeon",
        link: "accordeon__link",
        list: "accordeon__list",
        listHeader: "list-header",
        listItem: "list__item",
        openList: "list_open",
        openListHeader: "list-header_open",
        selectedLink: "link_selected"
    };

    /**
     * requestAnimationFrame polyfill.
     */
    function raf(callback) {
        return window.requestAnimationFrame(callback) ||
            window.webkitRequestAnimationFrame(callback) ||
            window.mozRequestAnimationFrame(callback) ||
            window.setTimeout(callback, 1000 / 60);
    }

    /**
     * HTML list class.
     */
    function HtmlList(data) {

        var htmlList = {
            animationSpeed: 4,
            data: data,
            currentItemHeight: 0,
            element: {},
            header: {},
            isOpen: false,
            itemMaxHeight: 20,
            items: [],
            name: ""
        };

        /**
         * Set the currentItemHeight to an item.
         * @param {Object} element 
         */
        htmlList.setCurrentHeight = function (element) {
            element.style.height = htmlList.currentItemHeight + "px";
        };

        /**
         * Animate the items height change.
         */
        htmlList.animate = function () {
            if (htmlList.isOpen) {
                htmlList.currentItemHeight -= htmlList.animationSpeed;
                htmlList.items.forEach(htmlList.setCurrentHeight);
                if (htmlList.currentItemHeight === 0) {
                    htmlList.element.className = css.list;
                    htmlList.header.className = css.listHeader;
                    htmlList.isOpen = false;
                    return;
                }
            } else {
                htmlList.currentItemHeight += htmlList.animationSpeed;
                htmlList.items.forEach(htmlList.setCurrentHeight);
                if (htmlList.currentItemHeight === htmlList.itemMaxHeight) {
                    htmlList.isOpen = true;
                    return;
                }
            }
            raf(htmlList.animate);
        };

        /**
         * Close the list.
         */
        htmlList.close = function () {
            htmlList.currentItemHeight = htmlList.itemMaxHeight;
            raf(htmlList.animate);
        };

        /**
         * Create the list header.
         */
        htmlList.createHeader = function () {
            htmlList.header = document.createElement("HEADER");
            htmlList.header.className = (htmlList.isOpen)
                ? css.openListHeader
                : css.listHeader;
            htmlList.header.innerHTML = htmlList.name;
            htmlList.header.addEventListener("click", htmlList.onHeaderClick);
        };

        /**
         * Create the list items.
         */
        htmlList.createItems = function () {
            htmlList.data.items.forEach(function (datum) {
                var link = document.createElement("A");
                var listItem = document.createElement("LI");
                listItem.className = css.listItem;
                link.className = (datum.selected)
                    ? css.selectedLink
                    : css.link;
                link.innerHTML = datum.name;
                link.href = datum.href;
                listItem.appendChild(link);
                htmlList.items.push(listItem);
            });
        };

        /**
         * Initialize the list.
         */
        htmlList.initialize = function () {
            htmlList.readData();
            htmlList.element = document.createElement("UL");
            htmlList.element.className = (htmlList.isOpen)
                ? css.openList
                : css.list;
            htmlList.createHeader();
            htmlList.element.appendChild(htmlList.header);
            htmlList.createItems();
            htmlList.items.forEach(function (item) {
                htmlList.element.appendChild(item);
            });
        };

        /**
         * Header click handler.
         */
        htmlList.onHeaderClick = function () {
            if (htmlList.isOpen) {
                htmlList.close();
            } else {
                if (accordeon.options.uniqueOpenList) {
                    accordeon.closeLists();
                }
                htmlList.open();
            }
        };

        /**
         * Open the list.
         */
        htmlList.open = function () {
            htmlList.currentItemHeight = 0;
            htmlList.element.className = css.openList;
            htmlList.header.className = css.openListHeader;
            raf(htmlList.animate);
        };

        /**
         * Read the data and initialize the list.
         */
        htmlList.readData = function () {
            if (data.open) {
                htmlList.isOpen = true;
            }
            htmlList.name = data.name;
        };

        htmlList.initialize();
        return htmlList;
    }

    /**
     * Build the menu.
     */
    accordeon.build = function () {
        accordeon.container = document.getElementById(containerId);
        accordeon.element = document.createElement("DIV");
        accordeon.element.className = css.accordeon;
        data.items.forEach(function (listData) {
            var list = new HtmlList(listData);
            accordeon.lists.push(list);
            accordeon.element.appendChild(list.header);
            accordeon.element.appendChild(list.element);
        });
        accordeon.container.appendChild(accordeon.element);
    };

    /**
     * Close all the lists.
     */
    accordeon.closeLists = function () {
        accordeon.lists.forEach(function (list) {
            if (list.isOpen) {
                list.close();
            }
        });
    };

    /**
     * Initialize the accordeon.
     */
    accordeon.initialize = function () {
        options = options || {};
        Object.keys(accordeon.options).forEach(function (key) {
            if (options.hasOwnProperty(key)) {
                accordeon.options[key] = options[key];
            }
        });
        accordeon.build();
    };

    accordeon.initialize();
    return {

    };
};
