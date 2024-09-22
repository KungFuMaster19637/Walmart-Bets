//Constants
const currentCycle = "5.0";
const totalBudget = 60;

//#region Loading Shop and Balance Notes
function readTextFile(file) {
  let connection = new XMLHttpRequest();
  connection.open("GET", file, false);
  connection.onreadystatechange = function () {
    if (connection.readyState === 4) {
      if (connection.status === 200 || connection.status == 0) {
        // Removes all text of the balancetext div
        const resetText = document.getElementById("balance-text");
        while (resetText.lastElementChild) {
          resetText.removeChild(resetText.lastElementChild);
        }

        // Writes the new text of balancetext div
        let allText = connection.responseText;
        let lines = allText.split("\n");
        for (let line = 0; line < lines.length; line++) {
          let paragraph;
          if (line === 0 || line === 1) {
            paragraph = document.createElement("h1");
          } else {
            paragraph = document.createElement("p");
          }

          paragraph.textContent += `${lines[line]} \r\n`;
          document.getElementById("balance-text").appendChild(paragraph);
        }
      }
    }
  };
  connection.send(null);
}

function loadShop(cycle) {
  document
    .getElementById("shop-cycle")
    .setAttribute("src", `Shop/${cycle}.png`);
}

function loadCycle(cycle) {
  loadShop(cycle);
  readTextFile(`BalanceNotes/Cycle${cycle}.txt`);
  cycle != 10
    ? (document.getElementById("discounts").style.display = "none")
    : (document.getElementById("discounts").style.display = "block");
}

function loadBalanceHistory(cycle) {
  for (let count = 1; count <= cycle; count++) {
    let listItem;
    listItem = document.createElement("li");
    listItem.setAttribute("onclick", `loadCycle(${count})`);
    listItem.textContent = `Cycle ${count}`;
    document.getElementById("balance-list").appendChild(listItem);
  }
}

function openHistory() {
  let list = document.getElementById("balance-list");
  if (list.style.display === "block") {
    list.style.display = "none";
  } else {
    list.style.display = "block";
  }
}
//#endregion

//#region Loading Nav

function collapseNav() {
  let nav = document.getElementById("myNavBar");
  if (nav.className === "navBar") {
    nav.className += " responsive";
  } else {
    nav.className = "navBar";
  }
}

//#endregion

//#region Loading Leaderboard

function readFromExcel(excelFile) {
  let connection = new XMLHttpRequest();
  connection.open("GET", excelFile, true);
  connection.responseType = "blob";
  connection.onload = function () {
    let fullData = [];
    let file = this.response;
    let reader = new FileReader();

    //For browsers that arent IE
    reader.onload = function (e) {
      ProcessExcel(e.target.result);
    };

    reader.readAsBinaryString(file);
  };
  connection.send();
}
function ProcessExcel(data) {
  let workbook = XLSX.read(data, {
    type: "binary",
  });

  //Fetch the name of First Sheet.
  let firstSheet = workbook.SheetNames[0];

  //Read all rows from First Sheet into an JSON array.
  let excelRows = XLSX.utils.sheet_to_row_object_array(
    workbook.Sheets[firstSheet]
  );

  let fullData = [];

  for (let i = 0; i < excelRows.length; i++) {
    let leaderboardObject = {
      playerName: "",
      cycle: "",
      video: "",
      time: "",
      team1: "",
      team2: "",
    };
    leaderboardObject.playerName = excelRows[i].Player;
    leaderboardObject.cycle = excelRows[i].Cycle;
    leaderboardObject.video = excelRows[i].Video;
    leaderboardObject.time = excelRows[i].Time;
    leaderboardObject.team1 = `${excelRows[i].Character1}-${excelRows[i].Character2}-${excelRows[i].Character3}-${excelRows[i].Character4}`;
    leaderboardObject.team2 = `${excelRows[i].Character5}-${excelRows[i].Character6}-${excelRows[i].Character7}-${excelRows[i].Character8}`;
    fullData.push(leaderboardObject);
  }

  let buttonFormatter = function (cell, formatterParams, onRendered) {
    return "<i class='fa fa-youtube-play'></i>";
  };

  let imageFormatter = function (cell, formatterParams, onRendered, team) {
    let imageString = "";
    for (let i = 0; i < 4; i++) {
      imageString += `<img class = 'leaderboard-character-image' 
            src='${loadPictures(
              cell
                .getValue()
                .split("-")
                .map((item) => item.trim())[i]
            )}'
            >`;
    }
    return imageString;
  };

  let currentCycleDir = "desc";

  let sortWithFixedCycle = function (e, column) {
    let dir = "desc";
    table.getSorters().forEach(function (sort) {
      if (column.getField() === sort.column.getField()) {
        dir = sort.dir;
      }
    });

    table.setSort([
      { column: column, dir: dir },
      { column: "cycle", dir: currentCycleDir },
    ]);
  };

  let changeCycleDir = function (e, column) {
    currentCycleDir = table.getSorters()[0].dir;
  };

  let table = new Tabulator("#leaderboard-table", {
    layout: "fitColumns",
    rowHeight: 80,
    responsiveLayout: "hide",
    autoResize: true,

    initialSort: [
      { column: "time", dir: "asc" },
      { column: "cycle", dir: currentCycleDir },
    ],

    groupBy: ["cycle"],
    groupHeader: function (value, count) {
      return (
        "Cycle " +
        value +
        "<span style='color:#2196c4'; margin-left:10px;'>(" +
        +count +
        " runs)</span>"
      );
    },

    columnDefaults: {
      resizable: false,
      vertAlign: "middle",
      hozAlign: "center",
      headerHozAlign: "center",
      headerSort: false,
    },
    columns: [
      {
        title: "Total Time",
        field: "time",
        headerClick: sortWithFixedCycle,
        headerSort: true,
      },
      {
        title: "Cycle",
        field: "cycle",
        headerClick: changeCycleDir,
        headerSort: true,
        sorter: "number",
      },
      {
        title: "Name",
        field: "playerName",
        headerClick: sortWithFixedCycle,
        headerSort: true,
        formatter: "textarea",
      },
      {
        title: "Video",
        field: "video",
        formatter: buttonFormatter,
        cellClick: function (e, cell) {
          let Btn = document.createElement("Button");
          Btn.id = "video-link-button";
          if (cell.getValue() === "No Link") {
            Btn.onclick = alert("This video is not available anymore :( ");
          } else {
            Btn.onclick = window.open(cell.getValue());
          }
        },
      },
      {
        title: "Team 1",
        field: "team1",
        widthGrow: 2,
        formatter: imageFormatter,
      },
      {
        title: "Team 2",
        field: "team2",
        widthGrow: 2,
        formatter: imageFormatter,
      },
    ],
    data: fullData,
  });

  table.on("tableBuilt", () => {
    table.setPage(2);
  });
}

function loadPictures(imageName) {
  let fullLink = "Images/Characters/" + imageName + ".png";
  return fullLink;
}

//#endregion

//#region Loading Team Builder
function updateCharacterCost() {
  var totalCost = 0;
  $(".cost").each(function () {
    var costString = $(this).attr("data-cost");
    // Extract numeric part using regular expression
    var numericPartMatch = costString.match(/\d+/);
    var namePartMatch = costString.match(/[A-Za-z]+/);
    if (numericPartMatch !== null && namePartMatch !== null) {
      var cost = parseInt(numericPartMatch[0]); // Extracts the first occurrence of a number in the string
      var name = namePartMatch[0]; // Extracts the first occurrence of letters in the string
      $(this).text(name + "; " + "Cost: " + cost);
      totalCost += cost;
    } else {
      $(this).text("Cost: 0");
    }
  });

  // function updateCharacterCost() {
  //   var totalCost = 0;
  //   $(".cost").each(function () {
  //     var cost = parseInt($(this).attr("data-cost"));
  //     if (!isNaN(cost)) {
  //       $(this).text("Cost: " + cost);
  //       totalCost += cost;
  //     }
  //   });

  if (!isNaN(totalCost)) {
    $("#total-cost").text("Total Cost: " + totalCost);
    if (totalCost > totalBudget) $("#over-budget").show();
    else $("#over-budget").hide();
    $(".character .img")
      .filter(function () {
        return $(this).attr("data-cost") > totalBudget - totalCost;
      })
      .addClass("disabled");
  } else {
    $("#total-cost").text("");
  }
}

function readCSVFile(file) {
  let connection = new XMLHttpRequest();
  connection.open("GET", file, false);
  connection.onreadystatechange = function () {
    if (connection.readyState === 4) {
      if (connection.status === 200 || connection.status == 0) {
        let allText = connection.responseText;
        let lines = allText.split("\n");
        for (let line = 0; line < lines.length; line++) {
          let values = lines[line].split(",");
          let key = values[0];
          let value = values.slice(1);
          characterCostMap[key] = value;
        }
      }
    }
  };
  connection.send(null);
  connection.close();
}

function loadCharacterCostsFromCSV() {
  readCSVFile("characterCosts.csv");
}

function loadPortraits() {
  $.each(characterCostMap, function (name, details) {
    var characterName = name;
    var characterImage = "Images/Characters/" + characterName + ".png";
    var characterElement = details[0];
    var characterRarity = details[1];
    var characterWeapon = details[2];
    var characterCost = details[3];

    var characterDiv = $(`
      <div class="character" style="display: inline-block; position: relative; min-width: 64px; min-height: 64px;">
        <img src="${characterImage}" alt="${characterName}" data-rar="${characterRarity}" data-ele="${characterElement}" data-weap="${characterWeapon}" style="width: 64px; height: 90px;">
        <div class="overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: none; justify-content: center; align-items: center; background-color: rgba(0, 0, 0, 0.5);">
          <p class="overlay-text" style="color: white; font-size: 12px; text-shadow: 1px 1px 1px black;"></p>
        </div>
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
          <p style="color: white; font-size: 36px; text-shadow: 2px 2px 2px black; position: absolute; top: 0; left: 0;">${characterCost}</p>
          <p style="color: white; font-size: 10px; text-shadow: 1px 1px 1px black; margin-top: 80%;">${characterName}</p>
        </div>
      </div>
    `);
    var img = characterDiv.find("img")[0];
    img.addEventListener("error", function (event) {
      event.target.src = "Images/Characters/Unknown.png";
      event.onerror = null;
    });

    $("#characterpicker").append(characterDiv);
  });
}

$(document).ready(function () {
  //readCSVFile('characterCosts.csv');
  //since I can't load CSV files in jsfiddle
  $("#character1").addClass("selected").css("box-shadow", "0 0 10px 5px blue");
  $(".character-selected").click(function () {
    $(".character-selected").removeClass("selected").css("box-shadow", "");
    $(this).addClass("selected").css("box-shadow", "0 0 10px 5px blue");
    selectedCharacter = $(this).attr("id");
    updateCharacterCost();
  });

  $(".character").click(function () {
    var clickedChar = $(this).find("img");
    if (clickedChar.hasClass("disabled")) {
      return false;
    }
    var characterImgSrc = $(this).find("img").attr("src");
    var characterImgAlt = $(this).find("img").attr("alt");
    var characterRarity = $(this).find("img").attr("data-rar");
    var characterCost = $(this).find("p").text();
    clickedChar.addClass("disabled").addClass("selected");
    if (characterImgAlt.startsWith("Traveler")) {
      $(".character img[alt^=Traveler]").addClass("disabled");
    }

    $("#" + selectedCharacter + " .close").click();
    $("#" + selectedCharacter)
      .find("img")
      .attr("src", characterImgSrc);
    $("#" + selectedCharacter)
      .find("img")
      .attr("alt", characterImgAlt);
    $("#" + selectedCharacter)
      .find(".cost")
      .attr("data-cost", characterCost);
    $("#" + selectedCharacter)
      .find(".cost")
      .attr("data-rar", characterRarity);

    characterList.push($(this).find("img").attr("alt"));
    updateCharacterCost();
    selectedCharacterID = parseInt(selectedCharacter.slice(-1));
    if (selectedCharacterID == 8) selectedCharacterID = 1;
    else selectedCharacterID++;
    selectedCharacter = "character" + selectedCharacterID;
    $("#" + selectedCharacter).click();
  });

  $(".close").click(function () {
    let parentDiv = $(this).closest(".character-selected");
    let clearChar = parentDiv.find("img").attr("alt");
    if (clearChar && clearChar.startsWith("Traveler")) clearChar = "Traveler";
    let index = characterList.indexOf(parentDiv.find("img").attr("alt"));
    if (index > -1) {
      characterList.splice(index, 1);
    }

    parentDiv.find("img").attr("src", "Images/Characters/Unknown.png");
    parentDiv.find("img").attr("alt", "");
    parentDiv.find("p").attr("data-cost", 0);

    $(".character img[alt^=" + clearChar + "]").removeClass("disabled");
    updateCharacterCost();
  });

  $("#close-all").click(function () {
    fillEmptySlots();
    characterList.length = 0;
    $(".character img").removeClass("disabled").removeClass("selected");
    updateCharacterCost();
  });
});

function fillEmptySlots() {
  $(".character-selected").each(function () {
    $(this).find("img").attr("src", "Images/Characters/Unknown.png");
    $(this).find("img").attr("alt", "");
    $(this).find("p").attr("data-cost", 0);
  });
}

function loadManualCharacterCosts() {
  characterCostMap = {
    //Character: Element, Rarity, Weapon, Cost
    Kazuha: ["Anemo", 5, "Sword", 12],
    Venti: ["Anemo", 5, "Bow", 6],
    Sucrose: ["Anemo", 4, "Catalyst", 6],
    Xianyun: ["Anemo", 5, "Catalyst", 6],
    Xiao: ["Anemo", 5, "Polearm", 6],
    Faruzan: ["Anemo", 4, "Bow", 4],
    Jean: ["Anemo", 5, "Sword", 4],
    Sayu: ["Anemo", 4, "Claymore", 4],
    Wanderer: ["Anemo", 5, "Catalyst", 4],
    Heizou: ["Anemo", 4, "Catalyst", 2],
    Lynette: ["Anemo", 4, "Sword", 2],
    TravelerAnemo: ["Anemo", 5, "Sword", 2],

    Ayaka: ["Cryo", 5, "Sword", 6],
    Shenhe: ["Cryo", 5, "Polearm", 6],
    Chongyun: ["Cryo", 4, "Claymore", 4],
    Eula: ["Cryo", 5, "Claymore", 4],
    Ganyu: ["Cryo", 5, "Bow", 4],
    Kaeya: ["Cryo", 4, "Sword", 4],
    Rosaria: ["Cryo", 4, "Polearm", 4],
    Wriothesley: ["Cryo", 5, "Catalyst", 4],
    Charlotte: ["Cryo", 4, "Catalyst", 2],
    Diona: ["Cryo", 4, "Bow", 2],
    Layla: ["Cryo", 4, "Sword", 2],
    Aloy: ["Cryo", 5, "Bow", 0],
    Freminet: ["Cryo", 4, "Claymore", 0],
    Mika: ["Cryo", 4, "Catalyst", 0],
    Qiqi: ["Cryo", 5, "Sword", 0],

    Nahida: ["Dendro", 5, "Catalyst", 12],
    Alhaitham: ["Dendro", 5, "Sword", 8],
    TravelerDendro: ["Dendro", 5, "Sword", 6],
    Tighnari: ["Dendro", 5, "Bow", 6],
    Kinich: ["Dendro", 5, "Claymore", 6],
    Emilie: ["Dendro", 5, "Polearm", 6],
    Collei: ["Dendro", 4, "Bow", 4],
    Baizhu: ["Dendro", 5, "Catalyst", 4],
    Kirara: ["Dendro", 4, "Claymore", 4],
    Yaoyao: ["Dendro", 4, "Polearm", 4],
    Kaveh: ["Dendro", 4, "Claymore", 2],

    Fischl: ["Electro", 4, "Bow", 8],
    Raiden: ["Electro", 5, "Polearm", 8],
    Clorinde: ["Electro", 5, "Sword", 6],
    Keqing: ["Electro", 5, "Sword", 6],
    Kuki: ["Electro", 4, "Sword", 6],
    Yae: ["Electro", 5, "Catalyst", 6],
    Beidou: ["Electro", 4, "Claymore", 4],
    Cyno: ["Electro", 5, "Polearm", 4],
    Lisa: ["Electro", 4, "Catalyst", 4],
    Sara: ["Electro", 4, "Bow", 4],
    Sethos: ["Electro", 4, "Catalyst", 4],
    Razor: ["Electro", 4, "Claymore", 2],
    Dori: ["Electro", 4, "Claymore", 0],
    TravelerElectro: ["Electro", 5, "Sword", 0],

    Navia: ["Geo", 5, "Claymore", 8],
    Itto: ["Geo", 5, "Claymore", 6],
    Zhongli: ["Geo", 5, "Polearm", 6],
    Chiori: ["Geo", 5, "Sword", 6],
    Albedo: ["Geo", 5, "Sword", 4],
    Gorou: ["Geo", 4, "Bow", 2],
    Yunjin: ["Geo", 4, "Polearm", 2],
    Kachina: ["Geo", 4, "Polearm", 2],
    Ningguang: ["Geo", 4, "Catalyst", 0],
    Noelle: ["Geo", 4, "Claymore", 0],
    TravelerGeo: ["Geo", 5, "Sword", 0],

    Neuvillette: ["Hydro", 5, "Catalyst", 12],
    Mualani: ["Hydro", 5, "Catalyst", 12],
    Furina: ["Hydro", 5, "Sword", 10],
    Nilou: ["Hydro", 5, "Sword", 10],
    Xingqiu: ["Hydro", 4, "Sword", 10],
    Yelan: ["Hydro", 5, "Bow", 10],
    Ayato: ["Hydro", 5, "Sword", 6],
    Kokomi: ["Hydro", 5, "Catalyst", 6],
    Tartaglia: ["Hydro", 5, "Bow", 6],
    Mona: ["Hydro", 5, "Catalyst", 4],
    Sigewinne: ["Hydro", 5, "Sword", 4],
    Barbara: ["Hydro", 4, "Catalyst", 2],
    Candace: ["Hydro", 4, "Polearm", 0],

    Bennett: ["Pyro", 4, "Sword", 12],
    Arlecchino: ["Pyro", 5, "Polearm", 12],
    HuTao: ["Pyro", 5, "Polearm", 10],
    Xiangling: ["Pyro", 4, "Polearm", 8],
    Lyney: ["Pyro", 5, "Bow", 6],
    Chevreuse: ["Pyro", 4, "Polearm", 6],
    Diluc: ["Pyro", 5, "Claymore", 4],
    Gaming: ["Pyro", 4, "Claymore", 4],
    Yanfei: ["Pyro", 4, "Catalyst", 2],
    Klee: ["Pyro", 5, "Catalyst", 2],
    Thoma: ["Pyro", 4, "Polearm", 2],
    Yoimiya: ["Pyro", 5, "Bow", 2],
    Amber: ["Pyro", 4, "Bow", 0],
    Dehya: ["Pyro", 5, "Claymore", 0],
    Xinyan: ["Pyro", 4, "Claymore", 0],
  };
}
//#endregion

function calculateTime() {
  let total = 0;
  for (const minutesData of document.querySelectorAll(".minutes")) {
    total += Number(minutesData.value * 60);
  }
  for (const secondsData of document.querySelectorAll(".seconds")) {
    total += Number(secondsData.value);
  }
  total -=
    document.getElementById("minutes-bonus").value * 60 +
    document.getElementById("seconds-bonus").value;
  let minutes = total / 60;
  if (minutes < 10) minutes = "0" + minutes;
  let seconds = total % 60;
  if (seconds < 10) seconds = "0" + seconds;
  document.getElementById("total-time").innerText = `${Math.floor(
    minutes
  )}:${seconds}`;
}
