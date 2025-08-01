// API URL’leri
const API_MENUS = 'https://localhost:7179/api/menus';
const API_SUBMENUS = 'https://localhost:7179/api/submenus';
const API_CONTENTS = 'https://localhost:7179/api/contents';

// Veriler için değişkenler
let menus = [];
let submenus = [];
let contents = [];
let currentSearchTerm = ''; // Mevcut arama terimini saklamak için

const menuListEl = document.getElementById('menuList');
const contentEl = document.getElementById('content');
const contentSearchInput = document.getElementById('contentSearchInput');

// İçerik gösterme fonksiyonu, Markdown + HTML destekli
function showContentBySubmenuId(submenuId) {
    // Aktif alt menüyü işaretle
    document.querySelectorAll('.submenu-item.active').forEach(el => el.classList.remove('active'));
    const activeEl = document.querySelector(`.submenu-item[data-submenuid='${submenuId}']`);
    if (activeEl) activeEl.classList.add('active');

    // Mevcut başlık listelerini temizle (çoğalmayı önlemek için)
    document.querySelectorAll('.submenu-headings-wrapper').forEach(el => el.remove());

    const contentObj = contents.find(c => c.submenuId === submenuId);

    if (contentObj) {
        marked.setOptions({
            highlight: function (code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            },
            langPrefix: 'hljs language-',
            sanitize: false
        });

        let rawHtmlContent = marked.parse(contentObj.text);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawHtmlContent;

        // --- Formları sarmalama ---
        const forms = tempDiv.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.closest('.api-form-card')) {
                const wrapperDiv = document.createElement('div');
                wrapperDiv.className = 'api-form-card';
                form.parentNode.insertBefore(wrapperDiv, form);
                wrapperDiv.appendChild(form);
            }
        });
        // --- Form sarmalama sonu ---

        // Başlıkları seç (h2 ve h3)
        const headings = tempDiv.querySelectorAll('h2, h3');

        // Menüdeki ilgili alt menüyü bul
        const submenuLi = document.querySelector(`.submenu-item[data-submenuid='${submenuId}']`);

        if (submenuLi && headings.length > 0) {
            // Başlık listesini oluştur
            const headingsUl = document.createElement('ul');
            headingsUl.className = 'submenu-headings';

            headings.forEach(heading => {
                // Başlık için id yoksa oluştur (scroll hedefi için)
                if (!heading.id) {
                    heading.id = heading.textContent.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
                }

                const li = document.createElement('li');
                li.className = 'submenu-heading-item';
                li.textContent = heading.textContent;
                li.style.cursor = 'pointer';

                li.addEventListener('click', () => {
                    const target = document.getElementById(heading.id);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });

                headingsUl.appendChild(li);
            });

            // Başlık listesini alt menünün kardeşi olarak ekle
            const headingsWrapperLi = document.createElement('li');
            headingsWrapperLi.className = 'submenu-headings-wrapper';
            headingsWrapperLi.appendChild(headingsUl);

            submenuLi.insertAdjacentElement('afterend', headingsWrapperLi);
        }

        // Mevcut arama terimi varsa içeriği vurgula
        if (currentSearchTerm) {
            highlightTextNodes(tempDiv, currentSearchTerm, 'highlighted-text');
        }

        contentEl.innerHTML = `<div class="markdown-content">${tempDiv.innerHTML}</div>`;
        hljs.highlightAll();

        addCopyButtonsToCodeBlocks();

    } else {
        contentEl.innerHTML = `<p>Bu alt menüye ait içerik bulunamadı.</p>`;
    }

    // İçerik görüntülendiğinde kaydırma pozisyonunu başa al (arama yapılmadığında)
    if (!currentSearchTerm) {
        contentEl.scrollTop = 0;
    }
}


// Belirli bir arama terimini metin düğümlerinde vurgulayan fonksiyon
function highlightTextNodes(node, searchTerm, highlightClass) {
    const lowerSearchTerm = searchTerm.toLowerCase();

    const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function (node) {
                const parent = node.parentNode;
                if (parent && (parent.nodeName === 'SCRIPT' ||
                    parent.nodeName === 'STYLE' ||
                    parent.nodeName === 'PRE' ||
                    parent.nodeName === 'A' ||
                    parent.nodeName === 'CODE' ||
                    parent.nodeName === 'BUTTON' ||
                    parent.nodeName === 'INPUT' ||
                    parent.classList.contains('hljs') ||
                    parent.classList.contains('api-form-card')
                )) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        },
        false
    );

    let currentNode;
    const nodesToProcess = [];

    while (currentNode = walker.nextNode()) {
        nodesToProcess.push(currentNode);
    }

    nodesToProcess.forEach(textNode => {
        let text = textNode.nodeValue;
        const parent = textNode.parentNode;

        if (text.toLowerCase().includes(lowerSearchTerm)) {
            const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            const highlightedHtml = text.replace(regex, `<span class="${highlightClass}">$1</span>`);

            const tempSpan = document.createElement('span');
            tempSpan.innerHTML = highlightedHtml;

            parent.replaceChild(tempSpan, textNode);
        }
    });
}

// Menüleri ve alt menüleri oluştur
function renderMenuTree(filteredMenus = null) {
    const menuSource = filteredMenus || menus;
    menuListEl.innerHTML = '';

    menuSource.forEach(menu => {
        const menuLi = document.createElement('li');
        menuLi.className = 'menu-item';

        // Menü başlığı (div)
        const menuTitle = document.createElement('div');
        menuTitle.className = 'menu-title';
        menuTitle.textContent = menu.title;

        // Icon
        const arrowIcon = document.createElement('i');
        arrowIcon.className = 'fas fa-chevron-right';
        menuTitle.appendChild(arrowIcon);
        menuLi.appendChild(menuTitle);

        // Alt Menü listesi
        const submenuUl = document.createElement('ul');
        submenuUl.className = 'submenu-list';

        const relatedSubmenus = filteredMenus && menu.matchedSubmenus
            ? menu.matchedSubmenus
            : submenus.filter(sm => sm.menuId === menu.id);

        relatedSubmenus.forEach(sm => {
            const submenuLi = document.createElement('li');
            submenuLi.className = 'submenu-item';
            submenuLi.textContent = sm.title;
            submenuLi.setAttribute('data-submenuid', sm.id);

            submenuLi.addEventListener('click', () => {
                showContentBySubmenuId(sm.id);
                currentSearchTerm = '';
                if (contentSearchInput) {
                    contentSearchInput.value = '';
                }
            });

            submenuUl.appendChild(submenuLi);
        });

        menuLi.appendChild(submenuUl);
        menuListEl.appendChild(menuLi);

        // Tıklanabilirlik (AÇ/KAPA)
        menuTitle.addEventListener('click', () => {
            submenuUl.classList.toggle('expanded');
            arrowIcon.classList.toggle('fa-chevron-right');
            arrowIcon.classList.toggle('fa-chevron-down');
        });

        // Eğer filtreli gelmişse default olarak açık göster
        if (filteredMenus) {
            submenuUl.classList.add('expanded');
            arrowIcon.classList.remove('fa-chevron-right');
            arrowIcon.classList.add('fa-chevron-down');
        }
    });
}


// API'den verileri çek ve render et
async function loadData() {
    try {
        const [menusRes, submenusRes, contentsRes] = await Promise.all([
            fetch(API_MENUS),
            fetch(API_SUBMENUS),
            fetch(API_CONTENTS)
        ]);

        if (!menusRes.ok || !submenusRes.ok || !contentsRes.ok) {
            throw new Error('API isteklerinden biri başarısız oldu.');
        }

        menus = await menusRes.json();
        submenus = await submenusRes.json();
        contents = await contentsRes.json();

        renderMenuTree();

    } catch (error) {
        contentEl.innerHTML = `<p>Veriler yüklenirken hata oluştu: ${error.message}</p>`;
        console.error(error);
    }
}

// Sayfa yüklendiğinde verileri yükle
window.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupMenuSearch();
    setupContentSearch();
});

function setupMenuSearch() {
    const menuSearchInput = document.getElementById('menuSearchInput');

    if (!menuSearchInput) return;

    menuSearchInput.addEventListener('input', function () {
        const searchTerm = this.value.trim().toLowerCase();

        // Menü aramasında içerik arama kutusunu ve terimini temizle
        currentSearchTerm = '';
        if (contentSearchInput) {
            contentSearchInput.value = '';
        }

        if (!searchTerm) {
            renderMenuTree(); // Tümünü göster
            return;
        }

        const filteredMenus = menus
            .map(menu => {
                const relatedSubmenus = submenus.filter(sm =>
                    sm.menuId === menu.id &&
                    sm.title.toLowerCase().includes(searchTerm)
                );

                const isMenuMatched = menu.title.toLowerCase().includes(searchTerm);

                if (isMenuMatched || relatedSubmenus.length > 0) {
                    return {
                        ...menu,
                        matchedSubmenus: relatedSubmenus.length > 0 ? relatedSubmenus : submenus.filter(sm => sm.menuId === menu.id)
                    };
                }

                return null;
            })
            .filter(Boolean);

        renderMenuTree(filteredMenus);

        document.querySelectorAll('.submenu-list').forEach(ul => {
            ul.classList.add('expanded');
        });
        document.querySelectorAll('.menu-title .fas').forEach(icon => {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
        });
    });
}

function searchContentsAndShow(searchTerm) {
    currentSearchTerm = searchTerm.trim(); // Arama terimini kaydet

    if (!currentSearchTerm) {
        renderMenuTree();
        if (submenus.length > 0) {
            showContentBySubmenuId(submenus[0].id);
        }
        return;
    }

    const lowerTerm = currentSearchTerm.toLowerCase();

    const matchedContentIds = contents.filter(c => c.text.toLowerCase().includes(lowerTerm)).map(c => c.submenuId);

    if (matchedContentIds.length === 0) {
        contentEl.innerHTML = `<p>Aramanıza uygun içerik bulunamadı.</p>`;
        menuListEl.innerHTML = '';
        return;
    }

    const filteredMenus = menus
        .map(menu => {
            const matchedSubmenusForMenu = submenus.filter(sm =>
                sm.menuId === menu.id && matchedContentIds.includes(sm.id)
            );

            if (matchedSubmenusForMenu.length > 0) {
                return {
                    ...menu,
                    matchedSubmenus: matchedSubmenusForMenu
                };
            }
            return null;
        })
        .filter(Boolean);

    renderMenuTree(filteredMenus);

    const firstMatchedSubmenuId = matchedContentIds[0];
    if (firstMatchedSubmenuId) {
        // İçeriği göster ve vurgulamayı yap
        showContentBySubmenuId(firstMatchedSubmenuId);

        // İçerik yüklendikten sonra ilk vurgulanan kelimeye kaydır
        // Küçük bir gecikme eklemek, tarayıcının DOM'u güncellemesine olanak tanır.
        setTimeout(() => {
            const firstHighlighted = contentEl.querySelector('.highlighted-text');
            if (firstHighlighted) {
                firstHighlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100); // 100ms gecikme
    }
}

// İçerik arama inputunu bağla
function setupContentSearch() {
    if (!contentSearchInput) return;

    contentSearchInput.addEventListener('input', (e) => {
        searchContentsAndShow(e.target.value);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnGeneratePdf');

    btn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/pdf/generate');

            if (!response.ok) {
                alert('PDF oluşturulurken hata oluştu!');
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'dokuman.pdf';
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Beklenmeyen bir hata oluştu: ' + error.message);
        }
    });
});


function addCopyButtonsToCodeBlocks() {
    document.querySelectorAll('pre > code').forEach((codeBlock) => {
        const pre = codeBlock.parentElement;

        // Kopyalama butonu oluştur
        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.innerHTML = '📋 Kopyala';

        // Tıklama olayında kopyalama işlemi
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codeBlock.innerText);
                button.innerText = '✅ Kopyalandı!';
                setTimeout(() => {
                    button.innerText = '📋 Kopyala';
                }, 1500);
            } catch (err) {
                button.innerText = '❌ Hata!';
            }
        });

        // pre elementine butonu ekle
        pre.style.position = 'relative'; // konumlandırma için
        button.style.position = 'absolute';
        button.style.top = '30px';
        button.style.right = '30px';
        button.style.padding = '10px 10px';
        button.style.fontSize = '1rem';
        button.style.cursor = 'pointer';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.background = '#808080';
        button.style.color = 'white';
        button.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';

        pre.appendChild(button);
    });
}
