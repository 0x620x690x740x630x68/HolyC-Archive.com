const GITHUB_USERNAME = "0x620x690x740x630x68";
const REPO_NAME = "TempleArchive";
const TARGET_FOLDERS = ["Games", "Utilities", "Demos", "ZealOS", "Misc", "Forks", "Hymns"];

let globalArchiveCategories = {};
document.addEventListener("DOMContentLoaded", () => {
    initializeAutomation();
});

async function initializeAutomation() {
    const rootNode = document.getElementById("directory-root");
    if (!rootNode) return;

    try {
        const response = await fetch(
            `https://cdn.jsdelivr.net/gh/${GITHUB_USERNAME}/${REPO_NAME}@main/directory.json`);

        if (!response.ok) {
            rootNode.innerHTML = "<div style='color:#FF5555; padding: 20px;'>CRITICAL ERROR: Failed to fetch directory mapping file.</div>";
            return;
        }

        globalArchiveCategories = await response.json();
        const categories = globalArchiveCategories;

        for (const folder of TARGET_FOLDERS) {
            const rawItems = categories[folder];
            if (!rawItems || rawItems.length === 0) continue;

            rawItems.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

            const pathSafeName = folder.replace(/\s+/g, '');
            const systemPath = `/Archive/${pathSafeName}/`;

            const sectionBlock = document.createElement("div");
            sectionBlock.className = "directory-section";
            sectionBlock.id = folder.toLowerCase();
            sectionBlock.style.scrollMarginTop = "180px";
            sectionBlock.innerHTML = `
            <div class="directory-banner">
            <span class="path">V:${systemPath}</span>
            <span id="count-${pathSafeName}">0 File(s) Available</span>
            </div>
            <table class="file-table">
            <thead>
            <tr>
            <th>File Name</th>
            <th>Author / Description</th>
            <th style="text-align: right;">Action</th>
            </tr>
            </thead>
            <tbody id="files-target-${pathSafeName}"></tbody>
            </table>
            `;
            rootNode.appendChild(sectionBlock);

            const tbodyTarget = document.getElementById(`files-target-${pathSafeName}`);
            const countTarget = document.getElementById(`count-${pathSafeName}`);

            countTarget.innerText = `${rawItems.length} File(s) Available`;

            for (const file of rawItems) {
                const tr = document.createElement("tr");
                tr.className = "file-row";

                const rawDownloadUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_USERNAME}/${REPO_NAME}@main/${folder}/${file.name}`;

                let finalDescriptionHTML = "";
                if (file.author && file.author.toLowerCase().startsWith("author:")) {
                    finalDescriptionHTML = `<span style="color: #55FFFF; font-weight: bold; display: block; margin-bottom: 4px;">${file.author}</span>${file.description || ''}`;
                } else {
                    finalDescriptionHTML = `<span style="color: #AAAAAA; display: block; margin-bottom: 4px;">${file.author || 'Author: Unknown/Community'}</span>${file.description || 'No documentation string allocated for this source file binary.'}`;
                }

                tr.id = "proj-" + file.name;
                tr.innerHTML = `
                <td class="file-name-cell">
                <span class="file-link-text" style="color: #FFFF55; font-weight: bold;">${file.name}</span>
                </td>
                <td class="file-desc-cell">${finalDescriptionHTML}</td>
                <td class="file-action-cell">
                <button onclick="triggerDirectDownload('${rawDownloadUrl}', '${file.name}', this)" class="action-dl">DOWNLOAD</button>
                </td>
                `;
                tbodyTarget.appendChild(tr);
            }
        }
    } catch (error) {
        console.error("Failed executing automated folder parse stream matrix processing:", error);
    }
}

async function triggerDirectDownload(fileUrl, filename, element) {
    const originalText = element.innerText || element.textContent;
    try {
        element.innerText = "FETCHING...";
        element.style.borderColor = "#FFFF55";
        element.style.color = "#FFFF55";

        const dynamicAnchor = document.createElement('a');
        dynamicAnchor.href = fileUrl;
        dynamicAnchor.download = filename;
        dynamicAnchor.target = "_blank";

        document.body.appendChild(dynamicAnchor);
        dynamicAnchor.click();
        document.body.removeChild(dynamicAnchor);

        element.innerText = "SUCCESS";
        element.style.borderColor = "#55FF55";
        element.style.color = "#55FF55";

        setTimeout(() => {
            element.innerText = originalText;
            element.style.borderColor = "";
            element.style.color = "";
        }, 2000);

    } catch (err) {
        console.error("Direct download execution pipeline collapsed:", err);
        element.innerText = "ERROR";
        element.style.borderColor = "#FF5555";
        element.style.color = "#FF5555";

        setTimeout(() => {
            element.innerText = originalText;
            element.style.borderColor = "";
            element.style.color = "";
        }, 3000);
    }
}

function showSuggestions() {
    const query = document.getElementById("archive-search").value.toLowerCase();
    const box = document.getElementById("suggestions-box");
    box.innerHTML = "";

    if (query.trim() === "") {
        box.style.display = "none";
        return;
    }

    let matchCount = 0;

    for (const folder in globalArchiveCategories) {
        const rawItems = globalArchiveCategories[folder];
        if (!rawItems) continue;

        for (const file of rawItems) {
            if (matchCount >= 8) break;

            const fileNameLower = (file.name || "").toLowerCase();
            const fileAuthorLower = (file.author || "").toLowerCase();
            const fileDescLower = (file.description || "").toLowerCase();

            if (fileNameLower.includes(query) || fileAuthorLower.includes(query) || fileDescLower.includes(query)) {
                matchCount++;

                const div = document.createElement("div");
                div.style.padding = "10px";
                div.style.cursor = "pointer";
                div.style.borderBottom = "1px solid #333";
                div.style.fontFamily = "monospace";
                div.style.backgroundColor = "transparent";

                div.innerHTML = `
                <div style="color: #FFFF55; font-weight: bold; margin-bottom: 2px;">${file.name}</div>
                <div style="color: #55FFFF; font-size: 11px; margin-bottom: 2px;">${file.author || 'Author: Unknown'}</div>
                <div style="color: #AAAAAA; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${file.description || 'No description string allocated.'}
                </div>
                `;

                div.onmouseenter = () => div.style.backgroundColor = "#0000AA";
                div.onmouseleave = () => div.style.backgroundColor = "transparent";

                div.onclick = () => {
                    const targetRow = document.getElementById("proj-" + file.name);
                    if (targetRow) {
                        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

                        targetRow.style.backgroundColor = "#555500";
                        setTimeout(() => targetRow.style.backgroundColor = "", 1500);
                    }
                    document.getElementById("archive-search").value = "";
                    box.style.display = "none";
                };

                box.appendChild(div);
            }
        }
    }

    box.style.display = matchCount > 0 ? "block" : "none";
}

document.addEventListener("click", (e) => {
    if (e.target.id !== "archive-search") {
        const box = document.getElementById("suggestions-box");
        if (box) box.style.display = "none";
    }
});
