    let players = [];

    const playerDialog = document.getElementById("playerDialog");
    const detailDialog = document.getElementById("detailDialog");

    // 画面にメッセージを表示
    function showStatus(message, type = "success") {
        const status = document.getElementById("status");
        status.textContent = message;
        status.className = "status " + type;
        status.scrollIntoView({behavior: "smooth", block: "nearest"});
    }

    function clearStatus() {
        const status = document.getElementById("status");
        status.textContent = "";
        status.className = "status";
    }

    // APIエラーもわかる形で処理
    async function requestApi(url, options = {}) {
        const response = await fetch(url, options);

        if (!response.ok) {
            let message = "HTTP " + response.status;

            try {
                const text = await response.text();
                if (text) {
                    message += "：" + text;
                }
            } catch (error) {
                // エラー本文を取得できない場合はHTTPステータスを表示
            }

            throw new Error(message);
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    }

    // 選手一覧を取得
    async function findAllPlayers(showMessage = false) {
        try {
            const data = await requestApi("/api/players");
            players = Array.isArray(data) ? data : [];
            renderPlayers();
            updateStats();

            if (showMessage) {
                showStatus("選手一覧を更新しました。");
            }
        } catch (error) {
            showStatus("選手一覧の取得に失敗しました。 " + error.message, "error");
            document.getElementById("playerCount").textContent = "一覧を読み込めませんでした";
            document.getElementById("clearSearch").hidden = true;
            document.getElementById("playerTableBody").innerHTML =
                '<tr><td colspan="8" class="empty"><strong>選手一覧を読み込めませんでした</strong><span>サーバーの状態を確認して、ページを再読み込みしてください。</span></td></tr>';
        }
    }

    // HTMLに表示する文字列を安全に処理
    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    // 選手一覧を表示

    function renderPlayers() {
        const keyword = document
            .getElementById("searchInput")
            .value.trim()
            .toLowerCase();

        const filteredPlayers = players.filter(function (player) {
            const searchText = [
                player.name,
                player.team,
                player.nationality,
                player.position
            ].join(" ").toLowerCase();

            return searchText.includes(keyword);
        });

        const tbody = document.getElementById("playerTableBody");

        if (filteredPlayers.length === 0) {
            updatePlayerCount(0, keyword);
            tbody.innerHTML =
                '<tr><td colspan="8" class="empty"><strong>該当する選手がいません</strong><span>検索条件を変更するか、条件を解除してください。</span></td></tr>';
            return;
        }

        updatePlayerCount(filteredPlayers.length, keyword);

        tbody.innerHTML = filteredPlayers.map(function (player) {
            const id = Number(player.id);
            const imagePath = player.imagePath
                ? escapeHtml(player.imagePath)
                : "";

            const photo = imagePath
                ? `<img class="player-photo"
                    src="${imagePath}"
                    alt="${escapeHtml(player.name)}の画像"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="player-photo-placeholder" style="display:none;">⚽</div>`
                : '<div class="player-photo-placeholder">⚽</div>';

            return `
            <tr>
                <td class="player-photo-cell">
                    <div class="player-photo-area">
                        ${photo}
                        <div class="player-photo-actions">
                            <input
                                class="image-upload-input"
                                type="file"
                                id="imageFile-${id}"
                                accept="image/jpeg,image/png,image/webp"
                                onchange="uploadPlayerImage(${id}, this)"
                            >
                            <button
                                class="image-upload-btn"
                                type="button"
                                id="imageButton-${id}"
                                onclick="document.getElementById('imageFile-${id}').click()"
                            >
                                ${imagePath ? "画像変更" : "画像追加"}
                            </button>
                        </div>
                    </div>
                </td>

                <td>
                    <div class="player-name">${escapeHtml(player.name)}</div>
                    <div class="player-id">ID: ${escapeHtml(player.id)}</div>
                </td>

                <td>
                    <span class="number-badge">${escapeHtml(player.number)}</span>
                </td>

                <td>
                    <span class="position-badge">${escapeHtml(player.position)}</span>
                </td>

                <td><span class="cell-primary">${escapeHtml(player.team)}</span></td>
                <td>${escapeHtml(player.nationality)}</td>
                <td class="physical-cell"><span>${escapeHtml(player.height)} cm</span><span>${escapeHtml(player.weight)} kg</span></td>

                <td>
                    <div class="actions">
                        <button class="small-btn" type="button"
                            onclick="showPlayerDetail(${id})">詳細</button>
                        <button class="small-btn" type="button"
                            onclick="openEditModal(${id})">編集</button>
                        <button class="danger-btn" type="button"
                            onclick="deletePlayer(${id})">削除</button>
                    </div>
                </td>
            </tr>
        `;
        }).join("");
    }

    function updatePlayerCount(count, keyword) {
        const countElement = document.getElementById("playerCount");
        const total = players.length;
        countElement.textContent = keyword
            ? `${total}名中 ${count}名を表示`
            : `${count}名を表示`;
        document.getElementById("clearSearch").hidden = !keyword;
    }


    // 統計カードを更新
    function updateStats() {
        document.getElementById("totalPlayers").textContent = players.length;

        if (players.length === 0) {
            document.getElementById("averageHeight").textContent = "—";
            document.getElementById("averageWeight").textContent = "—";
            return;
        }

        const averageHeight = players.reduce(function (sum, player) {
            return sum + Number(player.height || 0);
        }, 0) / players.length;

        const averageWeight = players.reduce(function (sum, player) {
            return sum + Number(player.weight || 0);
        }, 0) / players.length;

        document.getElementById("averageHeight").textContent =
            averageHeight.toFixed(1) + " cm";

        document.getElementById("averageWeight").textContent =
            averageWeight.toFixed(1) + " kg";
    }

    // 選手登録フォームを開く
    function openCreateModal() {
        clearStatus();
        document.getElementById("playerForm").reset();
        document.getElementById("playerId").value = "";
        document.getElementById("formTitle").textContent = "選手を登録";
        document.getElementById("formDescription").textContent =
            "新しい選手の基本情報を入力してください。";
        document.getElementById("submitButton").textContent = "選手を登録";
        clearInvalidFields();
        playerDialog.showModal();
    }

    // 選手編集フォームを開く
    async function openEditModal(id) {
        clearStatus();

        try {
            const player = await requestApi("/api/players/" + id);

            fillPlayerForm(player);

            document.getElementById("formTitle").textContent = "選手情報を編集";
            document.getElementById("formDescription").textContent =
                "選手情報を変更して保存してください。";
            document.getElementById("submitButton").textContent = "変更を保存";

            playerDialog.showModal();
        } catch (error) {
            showStatus("選手情報を取得できませんでした。 " + error.message, "error");
        }
    }

    function fillPlayerForm(player) {
        document.getElementById("playerId").value = player.id;
        document.getElementById("playerName").value = player.name ?? "";
        document.getElementById("playerNumber").value = player.number ?? "";
        document.getElementById("playerPosition").value = player.position ?? "";
        document.getElementById("playerTeam").value = player.team ?? "";
        document.getElementById("playerNationality").value = player.nationality ?? "";
        document.getElementById("playerHeight").value = player.height ?? "";
        document.getElementById("playerWeight").value = player.weight ?? "";
        clearInvalidFields();
    }

    function closePlayerModal() {
        playerDialog.close();
    }

    function clearInvalidFields() {
        document.querySelectorAll("#playerForm .invalid").forEach(function (field) {
            field.classList.remove("invalid");
        });
    }

    // 登録・更新のフォーム送信
    document.getElementById("playerForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        clearStatus();
        clearInvalidFields();

        const form = event.currentTarget;

        if (!form.checkValidity()) {
            form.querySelectorAll("input, select").forEach(function (field) {
                if (field.type !== "hidden" && !field.checkValidity()) {
                    field.classList.add("invalid");
                }
            });

            form.reportValidity();
            return;
        }

        const id = document.getElementById("playerId").value;

        const player = {
            name: document.getElementById("playerName").value.trim(),
            number: Number(document.getElementById("playerNumber").value),
            position: document.getElementById("playerPosition").value,
            team: document.getElementById("playerTeam").value.trim(),
            nationality: document.getElementById("playerNationality").value.trim(),
            height: Number(document.getElementById("playerHeight").value),
            weight: Number(document.getElementById("playerWeight").value)
        };

        // 空白だけの入力を防ぐ
        if (!player.name || !player.team || !player.nationality) {
            showStatus("選手名・所属チーム・国籍を入力してください。", "error");
            return;
        }

        const isEdit = id !== "";
        const submitButton = document.getElementById("submitButton");

        submitButton.disabled = true;
        submitButton.textContent = "保存中...";

        try {
            await requestApi(isEdit ? "/api/players/" + id : "/api/players", {
                method: isEdit ? "PUT" : "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(player)
            });

            closePlayerModal();
            await findAllPlayers(false);
            showStatus(isEdit ? "選手情報を更新しました。" : "選手を登録しました。");
        } catch (error) {
            showStatus(
                (isEdit ? "選手の更新" : "選手の登録") + "に失敗しました。 " + error.message,
                "error"
            );
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = isEdit ? "変更を保存" : "選手を登録";
        }
    });

    // 選手詳細を表示
    async function showPlayerDetail(id) {
        clearStatus();

        try {
            const player = await requestApi("/api/players/" + id);

            // 選手詳細画面の画像を表示
            const detailPhoto = document.getElementById("detailPlayerPhoto");

            if (player.imagePath) {
                const imagePath = escapeHtml(player.imagePath);
                const playerName = escapeHtml(player.name);

                detailPhoto.innerHTML = `
                    <img
                        src="${imagePath}"
                        alt="${playerName}"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                    >
                    <div class="detail-player-photo-placeholder"
                         style="display: none;">
                        画像を表示できません
                    </div>
                `;
            } else {
                detailPhoto.innerHTML = `
                    <div class="detail-player-photo-placeholder">
                        画像未登録
                    </div>
                `;
            }

            const details = [
                ["選手ID", player.id],
                ["選手名", player.name],
                ["背番号", player.number],
                ["ポジション", player.position],
                ["所属チーム", player.team],
                ["国籍", player.nationality],
                ["身長", player.height + " cm"],
                ["体重", player.weight + " kg"]
            ];

            document.getElementById("detailContent").innerHTML =
                details.map(function (item) {
                    return `
                        <div class="detail-item">
                            <div class="detail-label">${escapeHtml(item[0])}</div>
                            <div class="detail-value">${escapeHtml(item[1])}</div>
                        </div>
                    `;
                }).join("");

            detailDialog.showModal();
        } catch (error) {
            showStatus("選手詳細を取得できませんでした。 " + error.message, "error");
        }
    }

    // 選手を削除
    async function deletePlayer(id) {
        const player = players.find(function (item) {
            return Number(item.id) === Number(id);
        });

        const name = player ? player.name : "ID " + id;

        if (!confirm("「" + name + "」を削除しますか？\nこの操作は取り消せません。")) {
            return;
        }

        clearStatus();

        try {
            await requestApi("/api/players/" + id, {
                method: "DELETE"
            });

            await findAllPlayers(false);
            showStatus("選手を削除しました。 " + name);
        } catch (error) {
            showStatus("選手の削除に失敗しました。 " + error.message, "error");
        }
    }
    async function uploadPlayerImage(id, input) {
        const file = input.files[0];

        if (!file) {
            return;
        }

        const button = document.getElementById("imageButton-" + id);

        if (file.size > 5 * 1024 * 1024) {
            showStatus("画像は5MB以下にしてください。", "error");
            input.value = "";
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            showStatus(
                "JPEG・PNG・WebP形式の画像を選択してください。",
                "error"
            );
            input.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        button.disabled = true;
        button.textContent = "アップロード中...";
        clearStatus();

        try {
            const updatedPlayer = await requestApi(
                "/api/players/" + id + "/image",
                {
                    method: "POST",
                    body: formData
                }
            );

            const index = players.findIndex(function (player) {
                return Number(player.id) === Number(id);
            });

            if (index !== -1) {
                players[index] = updatedPlayer;
            }

            // ファイル選択欄を空にしてから再描画
            input.value = "";

            // 最新の選手情報を使って画像を即時反映
            renderPlayers();
            updateStats();

            showStatus("選手画像をアップロードしました。");

        } catch (error) {
            showStatus(
                "画像のアップロードに失敗しました。 " + error.message,
                "error"
            );

        } finally {
            // 再描画後のボタンを取得する
            const currentButton =
                document.getElementById("imageButton-" + id);

            if (currentButton) {
                currentButton.disabled = false;

                const player = players.find(function (item) {
                    return Number(item.id) === Number(id);
                });

                currentButton.textContent =
                        player && player.imagePath
                        ? "画像変更"
                        : "画像追加";
            }

            const currentInput =
                document.getElementById("imageFile-" + id);

            if (currentInput) {
                currentInput.value = "";
            }
        }
    }

    function scrollToPlayers() {
        document.getElementById("playersSection").scrollIntoView({
            behavior: "smooth"
        });
    }

    document.getElementById("searchInput").addEventListener("input", renderPlayers);
    document.getElementById("clearSearch").addEventListener("click", function () {
        document.getElementById("searchInput").value = "";
        renderPlayers();
        document.getElementById("searchInput").focus();
    });

    // 画面を開いたら選手一覧を自動取得
    findAllPlayers();
