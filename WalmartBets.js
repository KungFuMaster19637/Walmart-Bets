function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                return (allText);
            }
        }
    }
    rawFile.send(null);
}

function collapseNav() {
    let nav = document.getElementById("myNavBar");
    if (nav.className === "navBar") {
        nav.className += " responsive";
    } else {
        nav.className = "navBar";
    }
}
/*
let navbar = document.getElementById("myNavBar");
let sticky = navbar.offsetTop;
window.onscroll = function() {stickyNav()};

function stickyNav() {
    console.log(window.scrollY);
  if (window.scrollY >= sticky) {
    alert("smoll");
    navbar.classList.add("sticky");
  } else {
    alert("smoll");

    navbar.classList.remove("sticky");
  }
}*/