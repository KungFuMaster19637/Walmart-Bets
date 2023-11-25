//Constants
const currentCycle = 1;
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
    .setAttribute("src", `Shop/Cycle${cycle}.png`);
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

function updateTotalCost() {
  var totalCost = 0;
  $(".cost").each(function () {
    var cost = parseInt($(this).attr("data-cost"));
    if (!isNaN(cost)) {
      $(this).text("Cost: " + cost);
      totalCost += cost;
    }
  });

  //Check Bennett + Xiangling Combo:
  if (
    characterList.includes("Bennett") &&
    characterList.includes("Xiangling")
  ) {
    totalCost += 2;
  }

  //Check Xingqiu + Yelan Combo:
  if (characterList.includes("Xingqiu") && characterList.includes("Yelan")) {
    totalCost += 2;
  }

  if (!isNaN(totalCost)) {
    $("#total-cost").text("Total Cost: " + totalCost);
    if (totalCost > totalBudget) $("#over-budget").show();
    else $("#over-budget").hide();
    $(".character .img")
      .filter(function () {
        return $(this).attr("data-cost") > totalBudget - totalCost;
      })
      .addClass("disabled");
    /*
        if (current5Stars > max5Stars)
            $("#over-5star").show();
        else $("#over-5star").hide();
        */
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

    $("#characterpicker").append(`
    <div class="character" style="display: inline-block; position: relative; min-width: 64px; min-height: 64px;">
      <img src="${characterImage}" alt="${characterName}" data-rar="${characterRarity}" data-ele="${characterElement}" data-weap="${characterWeapon}" style="width: 64px; height: 90px;">
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
        <p style="color: white; font-size: 36px; text-shadow: 2px 2px 2px black;position: absolute; top: 0; left: 0;">${characterCost}</p>
      </div>
    </div>
  `);
  });
}
function fillEmptySlots() {
  $(".character-selected").each(function () {
    $(this).find("img").attr("src", "Images/Characters/Unknown.png");
    $(this).find("img").attr("alt", "");
    $(this).find("p").attr("data-cost", 0);
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
    updateTotalCost();
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

    /*
        if (characterRarity == 5)
            current5Stars++;
            */

    updateTotalCost();
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
    /*
        if (parentDiv.find('p').attr('data-rar') == 5)
            current5Stars--;
         */
    $(".character img[alt^=" + clearChar + "]").removeClass("disabled");
    updateTotalCost();
  });

  $("#close-all").click(function () {
    fillEmptySlots();
    //current5Stars = 0;
    characterList.length = 0;
    $(".character img").removeClass("disabled").removeClass("selected");
    updateTotalCost();
  });
});

function loadManualCharacterCosts() {
  characterCostMap = {
    //Character: Element, Rarity, Weapon, Cost
    Heizou: ["Anemo", 4, "Catalyst", 2],
    Sucrose: ["Anemo", 4, "Catalyst", 4],
    Faruzan: ["Anemo", 4, "Bow", 4],
    Sayu: ["Anemo", 4, "Claymore", 2],
    Lynette: ["Anemo", 4, "Sword", 2],
    Kazuha: ["Anemo", 5, "Sword", 12],
    Venti: ["Anemo", 5, "Bow", 6],
    Jean: ["Anemo", 5, "Sword", 2],
    Wanderer: ["Anemo", 5, "Catalyst", 4],
    Xiao: ["Anemo", 5, "Polearm", 2],
    TravelerAnemo: ["Anemo", 5, "Sword", 2],
    Diona: ["Cryo", 4, "Bow", 2],
    Kaeya: ["Cryo", 4, "Sword", 4],
    Layla: ["Cryo", 4, "Sword", 2],
    Rosaria: ["Cryo", 4, "Polearm", 4],
    Chongyun: ["Cryo", 4, "Claymore", 4],
    Mika: ["Cryo", 4, "Catalyst", 0],
    Freminet: ["Cryo", 4, "Claymore", 0],
    // Charlotte: ["Cryo", 4, "Catalyst", 0],
    Ayaka: ["Cryo", 5, "Sword", 8],
    Eula: ["Cryo", 5, "Claymore", 2],
    Ganyu: ["Cryo", 5, "Bow", 6],
    Shenhe: ["Cryo", 5, "Polearm", 6],
    Aloy: ["Cryo", 5, "Bow", 0],
    Qiqi: ["Cryo", 5, "Sword", 0],
    Wriothesley: ["Cryo", 5, "Catalyst", 4],
    Alhaitham: ["Dendro", 5, "Sword", 8],
    Baizhu: ["Dendro", 5, "Catalyst", 4],
    Nahida: ["Dendro", 5, "Catalyst", 12],
    TravelerDendro: ["Dendro", 5, "Sword", 6],
    Tighnari: ["Dendro", 5, "Bow", 6],
    Collei: ["Dendro", 4, "Bow", 2],
    Kaveh: ["Dendro", 4, "Claymore", 2],
    Kirara: ["Dendro", 4, "Claymore", 4],
    Yaoyao: ["Dendro", 4, "Polearm", 4],
    Fischl: ["Electro", 4, "Bow", 10],
    Beidou: ["Electro", 4, "Claymore", 2],
    Sara: ["Electro", 4, "Bow", 4],
    Kuki: ["Electro", 4, "Sword", 6],
    Razor: ["Electro", 4, "Claymore", 2],
    Dori: ["Electro", 4, "Claymore", 0],
    Lisa: ["Electro", 4, "Catalyst", 4],
    Raiden: ["Electro", 5, "Polearm", 10],
    Yae: ["Electro", 5, "Catalyst", 6],
    Cyno: ["Electro", 5, "Polearm", 2],
    TravelerElectro: ["Electro", 5, "Sword", 0],
    Keqing: ["Electro", 5, "Sword", 6],
    Gorou: ["Geo", 4, "Bow", 2],
    Ningguang: ["Geo", 4, "Catalyst", 0],
    Noelle: ["Geo", 4, "Claymore", 0],
    Yunjin: ["Geo", 4, "Polearm", 4],
    Itto: ["Geo", 5, "Claymore", 2],
    Zhongli: ["Geo", 5, "Polearm", 4],
    Albedo: ["Geo", 5, "Sword", 4],
    TravelerGeo: ["Geo", 5, "Sword", 0],
    Xingqiu: ["Hydro", 4, "Sword", 10],
    Barbara: ["Hydro", 4, "Catalyst", 2],
    Candace: ["Hydro", 4, "Polearm", 0],
    Kokomi: ["Hydro", 5, "Catalyst", 8],
    Yelan: ["Hydro", 5, "Bow", 10],
    Ayato: ["Hydro", 5, "Sword", 4],
    Tartaglia: ["Hydro", 5, "Bow", 6],
    Mona: ["Hydro", 5, "Catalyst", 2],
    Nilou: ["Hydro", 5, "Sword", 8],
    // Neuvillette: ["Hydro", 5, "Catalyst", 12],
    // Furina: ["Hydro", 5, "Sword", 8],
    Bennett: ["Pyro", 4, "Sword", 12],
    Xiangling: ["Pyro", 4, "Polearm", 10],
    Yanfei: ["Pyro", 4, "Catalyst", 0],
    Thoma: ["Pyro", 4, "Polearm", 2],
    Amber: ["Pyro", 4, "Bow", 0],
    Xinyan: ["Pyro", 4, "Claymore", 0],
    HuTao: ["Pyro", 5, "Polearm", 8],
    Diluc: ["Pyro", 5, "Claymore", 4],
    Yoimiya: ["Pyro", 5, "Bow", 0],
    Klee: ["Pyro", 5, "Catalyst", 0],
    Dehya: ["Pyro", 5, "Claymore", 0],
    Lyney: ["Pyro", 5, "Bow", 8],
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
