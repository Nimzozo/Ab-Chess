window.Accordeon = window.Accordeon || function (indexes) {
    "use strict";

    var accordeon = {
        "items": [
            {
                "name": "Basics",
                "items": [
                    {
                        "name": "Default options",
                        "href": "examples/basics/default.html"
                    },
                    {
                        "name": "Visual changes",
                        "href": "examples/basics/visual.html"
                    },
                    {
                        "name": "Locked pieces",
                        "href": "examples/basics/locked.html"
                    },
                    {
                        "name": "Orientation",
                        "href": "examples/basics/orientation.html"
                    },
                    {
                        "name": "Squares highlighting",
                        "href": "examples/basics/highlighting.html"
                    }
                ]
            },
            {
                "name": "Methods",
                "items": [
                    {
                        "name": "Flip",
                        "href": "examples/methods/flip.html"
                    },
                    {
                        "name": "Play",
                        "href": "examples/methods/play.html"
                    },
                    {
                        "name": "Set FEN",
                        "href": "examples/methods/set-fen.html"
                    },
                    {
                        "name": "Get FEN",
                        "href": "examples/methods/get-fen.html"
                    },
                    {
                        "name": "Get active color",
                        "href": "examples/methods/get-active-color.html"
                    }
                ]
            },
            {
                "name": "Advanced",
                "items": [
                    {
                        "name": "Random moves",
                        "href": "examples/advanced/random-moves.html"
                    }
                ]
            }
        ]
    };
    var css = {
        activeHeader: "list__header_active",
        activeSubList: "sub-list_active",
        header: "list__header",
        item: "list__item",
        link: "example-link",
        list: "list",
        selectedItem: "sub-list__item_selected",
        selectedLink: "example-link_selected",
        subItem: "sub-list__item",
        subList: "sub-list"
    };
    var activeHeader = document.getElementsByClassName(css.activeHeader)[0];
    var activeSubList = document.getElementsByClassName(css.activeSubList)[0];

    function changeHeight(element, step, limit) {
        var clientHeight = element.clientHeight;
        var newHeight = clientHeight + step;
        var strHeight = newHeight + "px";
        element.style.height = strHeight;
        if ((step > 0 && newHeight < limit) ||
            (step < 0 && newHeight > limit)) {
            requestAnimationFrame(function () {
                changeHeight(element, step, limit);
            });
        } else if (limit === 0) {
            element.style.display = "none";
        }
    }

    function getItemsFromList(list) {
        var arrayChildren = [];
        var children = list.children;
        Object.keys(children).forEach(function (key) {
            var child = children[key];
            if (child.tagName === "LI") {
                arrayChildren.push(child);
            }
        });
        return arrayChildren;
    }

    function closeList(header, list) {
        var listItems = getItemsFromList(list);
        listItems.forEach(function (item) {
            item.style.display = "block";
            changeHeight(item, -4, 0);
        });
        header.className = css.header;
        list.className = css.subList;
        activeSubList = undefined;
    }

    function openList(header, list) {
        var listItems = getItemsFromList(list);
        header.className = css.activeHeader;
        list.className = css.activeSubList;
        listItems.forEach(function (item) {
            item.style.height = 0;
            item.style.display = "block";
            changeHeight(item, 4, 36);
        });
        if (activeSubList !== undefined) {
            closeList(activeHeader, activeSubList);
        }
        activeHeader = header;
        activeSubList = list;
    }

    function selectLink(link) {
        var selectedLink = document.getElementsByClassName(css.selectedLink);
        if (selectedLink.length > 0) {
            selectedLink[0].className = css.link;
        }
        link.className = css.selectedLink;
    }

    function getAccordeon(indexes) {
        var list = document.createElement("UL");
        list.className = css.list;
        accordeon.items.forEach(function (item, index) {
            var header = document.createElement("H4");
            var htmlItem = document.createElement("LI");
            var subList = document.createElement("UL");
            if (index === indexes[0]) {
                activeHeader = header;
                activeSubList = subList;
                header.className = css.activeHeader;
                subList.className = css.activeSubList;
            } else {
                header.className = css.header;
                subList.className = css.subList;
            }
            header.innerHTML = item.name;
            header.addEventListener("click", function () {
                if (subList === activeSubList) {
                    closeList(header, subList);
                } else {
                    openList(header, subList);
                }
            });
            htmlItem.className = css.item;
            htmlItem.appendChild(header);
            item.items.forEach(function (subItem, subIndex) {
                var htmlSubItem = document.createElement("LI");
                var link = document.createElement("A");
                htmlSubItem.className = css.subItem;
                link.innerHTML = subItem.name;
                link.href = subItem.href;
                if (index === indexes[0] && subIndex === indexes[1]) {
                    link.className = css.selectedLink;
                } else {
                    link.className = css.link;
                }
                link.addEventListener("click", function () {
                    selectLink(link);
                });
                htmlSubItem.appendChild(link);
                subList.appendChild(htmlSubItem);
            });
            htmlItem.appendChild(subList);
            list.appendChild(htmlItem);
        });
        return list;
    }

    return getAccordeon(indexes);
};

