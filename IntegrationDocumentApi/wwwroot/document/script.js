let menus = [];
let selectedSubmenu = null;

function addMenu() {
  const menuName = prompt("Menü adı giriniz:");
  if (!menuName) return;

  const menu = {
    name: menuName,
    submenus: []
  };
  menus.push(menu);
  renderMenus();
}

function addSubmenu(menuIndex) {
  const submenuName = prompt("Alt Menü adı giriniz:");
  if (!submenuName) return;

  menus[menuIndex].submenus.push({ name: submenuName, content: "" });
  renderMenus();
}

function renderMenus() {
  const menuList = document.getElementById("menuList");
  menuList.innerHTML = "";

  menus.forEach((menu, menuIndex) => {
    const li = document.createElement("li");
    li.textContent = menu.name;

    menu.submenus.forEach((submenu, subIndex) => {
      const subLi = document.createElement("li");
      subLi.textContent = "↳ " + submenu.name;
      subLi.style.marginLeft = "15px";
      subLi.onclick = () => selectSubmenu(menuIndex, subIndex);
      li.appendChild(subLi);
    });

    const addSubBtn = document.createElement("button");
    addSubBtn.textContent = "+ Alt Menü";
    addSubBtn.style.marginLeft = "10px";
    addSubBtn.onclick = () => addSubmenu(menuIndex);
    li.appendChild(document.createElement("br"));
    li.appendChild(addSubBtn);

    menuList.appendChild(li);
  });
}

function selectSubmenu(menuIndex, subIndex) {
  selectedSubmenu = { menuIndex, subIndex };
  const submenu = menus[menuIndex].submenus[subIndex];
  document.getElementById("contentTitle").textContent = submenu.name;
  document.getElementById("contentArea").textContent = submenu.content;
  document.getElementById("contentInput").value = submenu.content;
}

function saveContent() {
  if (!selectedSubmenu) {
    alert("Lütfen önce bir alt menü seçin.");
    return;
  }
  const newContent = document.getElementById("contentInput").value;
  menus[selectedSubmenu.menuIndex].submenus[selectedSubmenu.subIndex].content = newContent;
  document.getElementById("contentArea").textContent = newContent;
}
