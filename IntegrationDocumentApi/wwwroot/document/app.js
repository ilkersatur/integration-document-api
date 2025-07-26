const apiBase = "https://localhost:7179/api"; // kendi API adresinle değiştir

let menus = [];
let submenus = [];
let contents = [];

let selectedMenuId = null;
let selectedSubmenuId = null;

const menuListEl = document.getElementById("menuList");
const contentTitleEl = document.getElementById("contentTitle");
const contentInputEl = document.getElementById("contentInput");
const btnAddMenu = document.getElementById("btnAddMenu");
const btnAddSubmenu = document.getElementById("btnAddSubmenu");
const btnSaveContent = document.getElementById("btnSaveContent");

// Menüleri API'den yükle
async function loadMenus() {
    const res = await fetch(`${apiBase}/menus`);
    menus = await res.json();
    await loadSubmenus();
    renderMenus();
}

// Alt menüleri API'den yükle
async function loadSubmenus() {
    const res = await fetch(`${apiBase}/submenus`);
    submenus = await res.json();
}

// İçerikleri API'den yükle
async function loadContents() {
    const res = await fetch(`${apiBase}/contents`);
    contents = await res.json();
}

// Menüleri ve alt menüleri listele
function renderMenus() {
    menuListEl.innerHTML = "";

    menus.forEach(menu => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        const titleDiv = document.createElement("div");
        titleDiv.textContent = menu.title;
        titleDiv.style.cursor = "pointer";
        titleDiv.onclick = () => selectMenu(menu.id);
        li.appendChild(titleDiv);

        // Butonlar container
        const btnGroup = document.createElement("div");

        // Menü Düzenle butonu
        const editMenuBtn = document.createElement("button");
        editMenuBtn.className = "btn btn-sm btn-outline-primary me-1";
        editMenuBtn.textContent = "Düzenle";
        editMenuBtn.onclick = async (e) => {
            e.stopPropagation();
            const newTitle = prompt("Menü adını değiştirin:", menu.title);
            if (!newTitle) return;

            const updatedMenu = { ...menu, title: newTitle };
            const res = await fetch(`${apiBase}/menus/${menu.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedMenu)
            });

            if (res.ok) {
                await loadMenus();
            }
        };
        btnGroup.appendChild(editMenuBtn);

        // Menü Sil butonu
        const delMenuBtn = document.createElement("button");
        delMenuBtn.className = "btn btn-sm btn-outline-danger";
        delMenuBtn.textContent = "Sil";
        delMenuBtn.onclick = async (e) => {
            e.stopPropagation();
            if (!confirm(`'${menu.title}' menüsünü silmek istediğinize emin misiniz?`)) return;

            const res = await fetch(`${apiBase}/menus/${menu.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                await loadMenus();
            }
        };
        btnGroup.appendChild(delMenuBtn);

        li.appendChild(btnGroup);

        // Alt menüler listesi
        const submenuUl = document.createElement("ul");
        submenuUl.className = "list-group mt-2 ps-3";

        submenus.filter(s => s.menuId === menu.id).forEach(submenu => {
            const subLi = document.createElement("li");
            subLi.className = "list-group-item d-flex justify-content-between align-items-center";

            const subTitle = document.createElement("div");
            subTitle.textContent = submenu.title;
            subTitle.style.cursor = "pointer";
            subTitle.onclick = () => selectSubmenu(submenu.id);
            subLi.appendChild(subTitle);

            const subBtnGroup = document.createElement("div");

            // Alt Menü Düzenle
            const editSubBtn = document.createElement("button");
            editSubBtn.className = "btn btn-sm btn-outline-primary me-1";
            editSubBtn.textContent = "Düzenle";
            editSubBtn.onclick = async (e) => {
                e.stopPropagation();
                const newTitle = prompt("Alt menü adını değiştirin:", submenu.title);
                if (!newTitle) return;

                const updatedSubmenu = { ...submenu, title: newTitle };
                const res = await fetch(`${apiBase}/submenus/${submenu.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedSubmenu)
                });

                if (res.ok) {
                    await loadMenus();
                }
            };
            subBtnGroup.appendChild(editSubBtn);

            // Alt Menü Sil
            const delSubBtn = document.createElement("button");
            delSubBtn.className = "btn btn-sm btn-outline-danger";
            delSubBtn.textContent = "Sil";
            delSubBtn.onclick = async (e) => {
                e.stopPropagation();
                if (!confirm(`'${submenu.title}' alt menüsünü silmek istediğinize emin misiniz?`)) return;

                const res = await fetch(`${apiBase}/submenus/${submenu.id}`, {
                    method: "DELETE"
                });

                if (res.ok) {
                    await loadMenus();
                }
            };
            subBtnGroup.appendChild(delSubBtn);

            subLi.appendChild(subBtnGroup);
            submenuUl.appendChild(subLi);
        });

        li.appendChild(submenuUl);

        menuListEl.appendChild(li);
    });
}

// Menü seçildiğinde alt menü ekleme aktif olur
function selectMenu(menuId) {
    selectedMenuId = menuId;
    selectedSubmenuId = null;
    contentTitleEl.textContent = "İçerik";
    contentInputEl.value = "";
    contentInputEl.disabled = true;
    btnAddSubmenu.disabled = false;
    btnSaveContent.disabled = true;
}

// Alt menü seçildiğinde içerik yüklenir
function selectSubmenu(submenuId) {
    selectedSubmenuId = submenuId;
    const submenu = submenus.find(s => s.id === submenuId);
    contentTitleEl.textContent = submenu.title;

    const content = contents.find(c => c.submenuId === submenuId);
    contentInputEl.value = content ? content.text : "";
    contentInputEl.disabled = false;
    btnSaveContent.disabled = false;
}

// Yeni Menü Ekle
btnAddMenu.onclick = async () => {
    const title = prompt("Yeni menü adı girin:");
    if (!title) return;

    const res = await fetch(`${apiBase}/menus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
    });

    if (res.ok) {
        await loadMenus();
    }
};

// Yeni Alt Menü Ekle
btnAddSubmenu.onclick = async () => {
    if (!selectedMenuId) return alert("Önce bir menü seçin.");

    const title = prompt("Yeni alt menü adı girin:");
    if (!title) return;

    const res = await fetch(`${apiBase}/submenus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, menuId: selectedMenuId })
    });

    if (res.ok) {
        await loadMenus();
    }
};

// İçerik Kaydet
btnSaveContent.onclick = async () => {
    if (!selectedSubmenuId) return alert("Önce bir alt menü seçin.");

    let content = contents.find(c => c.submenuId === selectedSubmenuId);
    const text = contentInputEl.value;

    if (content) {
        // Güncelle
        const res = await fetch(`${apiBase}/contents/${content.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...content, text, submenuId: selectedSubmenuId })
        });

        if (res.ok) {
            await loadContents();
            alert("Güncellendi");
        }
    } else {
        // Yeni ekle
        const res = await fetch(`${apiBase}/contents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, submenuId: selectedSubmenuId })
        });

        if (res.ok) {
            await loadContents();
            alert("Eklendi");
        }
    }
};

async function init() {
    await loadMenus();
    await loadContents();
    btnAddSubmenu.disabled = true;
    btnSaveContent.disabled = true;
}

init();
