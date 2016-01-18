function tester(idList, test, description) {
    "use strict";

    var color = "";
    var index = 0;
    var li = document.createElement("li");
    var list = document.getElementById(idList);
    var result = "";

    index = list.childElementCount + 1;
    if (test) {
        color = "green";
        result = "<b>" + index + ". </b>" + description;

    } else {
        color = "red";
        description = "<s>" + description + "</s>";
        result = "<b>" + index + ". </b>" + description;
    }
    li.style.margin = "8px";
    li.style.padding = "2px";
    li.style.color = color;
    li.innerHTML = result;
    list.insertBefore(li, list.childNodes[0]);
}
