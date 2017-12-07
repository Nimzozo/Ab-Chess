// drop-down-list.js
// 2017-12-07
// Copyright (c) 2017 Nimzozo

window.addEventListener("load", function () {
    "use strict";

    /**
     * Css classes and ids.    
     */
    var css = {
        header: "drop-down-header",
        item: "drop-down-list__item",
        link: "drop-down-list__link",
        list: "drop-down-list",
        openHeader: "drop-down-header_open",
        openList: "drop-down-list_open",
        selectedLink: "drop-down-list__link_selected"
    };
    var headers = document.getElementsByClassName(css.header);
    var items = document.getElementsByClassName(css.item);
    var lists = document.getElementsByClassName(css.list);
    var openHeaders = document.getElementsByClassName(css.openHeader);
    var openLists = document.getElementsByClassName(css.openList);
    var selectedLinks = document.getElementsByClassName(css.selectedLink);

    function raf(callback) {
        return window.requestAnimationFrame(callback) ||
            window.webkitRequestAnimationFrame(callback) ||
            window.mozRequestAnimationFrame(callback) ||
            window.setTimeout(callback, 1000 / 60);
    }

    function DropDownList(header, list, isOpen) {
        var dropDownList = {
            animationSpeed: 4,
            header: header,
            itemsHeight: 0,
            itemsMaxHeight: 20,
            items: [],
            list: list,
            isOpen: isOpen
        };

        dropDownList.animate = function () {
            if (dropDownList.isOpen) {
                if (dropDownList.itemsHeight < 1) {
                    dropDownList.header.className = css.header;
                    dropDownList.list.className = css.list;
                    dropDownList.isOpen = false;
                    return;
                }
                dropDownList.itemsHeight -= dropDownList.animationSpeed;
            } else {
                if (dropDownList.itemsHeight === dropDownList.itemsMaxHeight) {
                    dropDownList.isOpen = true;
                    return;
                }
                dropDownList.itemsHeight += dropDownList.animationSpeed;
            }
            dropDownList.updateItems();
            raf(dropDownList.animate);
        };

        dropDownList.create = function () {
            var children = list.children;
            Object.keys(children).forEach(function (key) {
                var child = children[key];
                if (child.tagName.toLowerCase() === "li") {
                    dropDownList.items.push(child);
                }
            });
            if (dropDownList.isOpen) {
                dropDownList.itemsHeight = dropDownList.itemsMaxHeight;
            }
            header.addEventListener("click", dropDownList.onHeaderClick);
        };

        dropDownList.onHeaderClick = function () {
            if (dropDownList.isOpen) {
                raf(dropDownList.animate);
            } else {
                raf(dropDownList.open);
            }
        };

        dropDownList.open = function () {
            dropDownList.updateItems();
            dropDownList.header.className = css.openHeader;
            dropDownList.list.className = css.openList;
            raf(dropDownList.animate);
        };

        dropDownList.updateItems = function () {
            dropDownList.items.forEach(function (item) {
                item.style.height = dropDownList.itemsHeight + "px";
            });
        };

        return dropDownList.create();
    }

    Object.keys(headers).forEach(function (key) {
        var dropDown = {};
        var header = headers[key];
        var list = lists[key];
        dropDown = new DropDownList(header, list, false);
    });
    Object.keys(openHeaders).forEach(function (key) {
        var dropDown = {};
        var header = openHeaders[key];
        var list = openLists[key];
        dropDown = new DropDownList(header, list, true);
    });
    Object.keys(items).forEach(function (key) {
        var link = items[key].firstChild;
        link.addEventListener("click", function () {
            Object.keys(selectedLinks).forEach(function (index) {
                var selectedLink = selectedLinks[index];
                raf(function () {
                    selectedLink.className = css.link;
                });
            });
            link.className = css.selectedLink;
        });
    });

});