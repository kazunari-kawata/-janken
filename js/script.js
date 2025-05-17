$(function () {
    const correctCodeList = [
        "ジーズアカデミー",
        "G's Academy",
        "G'sアカデミー",
        "ジーズアカデミー福岡",
        "G's Academy Fukuoka",
    ];

    // ──────────── ①ステート変数＆定数の定義 ────────────
    let monologueActive = false; // 独白モードかどうか
    let currentLine = 0; // 今表示中のセリフ番号
    let gameStarted = false; // ゲーム操作解禁フラグ

    const monologueLines = [
        // 独白セリフ一覧
        "……メンヘラ彼女のアヤちゃんに部屋に閉じ込められてしまった",
        "まずは部屋を見回そう",
        "スペースキーを押すとスマホのライトを使うことができる",
        "部屋にあるものはクリックして調べることができる",
        "部屋を脱出する方法を見つけないと",
    ];
    function drawDark() {
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // ──────────── ②ポップアップデータ ────────────
    const popupData = {
        clock: "深夜の2時半だ。しんどい",
        window: "窓はビクとも動かない。\nアヤちゃんの腕力でのみ開けられる",
        shelf: "ものすごい冊数の「恋空」と「赤い糸」が並んでいる",
        xoxo: "賃貸なのに壁に直書きはダメだよ...",
        potara: "アヤちゃんがよくつけてるポタラだ",
        socks: "アヤちゃんの5本指靴下だ。腐臭がする",
        handball:
            "アヤちゃんがストレスがたまると壁打ちに使っているハンドボールだ",
        speaker: "ずっと同じ曲が無限リピートされている",
        teddy: "この熊にマイクが仕込まれていることを僕は知っている",
        plant: "アヤちゃんが自分で品種改良したと言う観葉植物だ",
        cat: "アヤちゃんに怯えて暮らす猫",
        painting: "アヤちゃんの前衛的な自画像",
        perfume: [
            "アヤちゃんが使っている香水だ。何かの肉が焼け焦げたような匂いがする",
            "裏面に何か書いてある。\n合言葉は「出会いの場所」",
        ],
        diary: [
            "アヤちゃんの日記の１ページ目だ<br>「ジーズアカデミーで、初めて“おはよう”って言ってくれた日、<br>帰ってから7時間泣いた。安心して怖くなったと」",
            "アヤちゃんの日記の２ページ目だ<br>「あなたがくれたUSB、まだ開けとらん<br>でも毎晩、冷蔵庫に入れて寝とる。溶けたら中身こぼれそうで怖いやん？」",
            "アヤちゃんの日記の３ページ目だ<br>「大名の猫カフェに行った日、あの時抱っこしとった猫、覚えとる？<br>あの子、今うちにおるよ。あなたの匂いが好きみたいやけん」",
            "アヤちゃんの日記の４ページ目だ<br>「忘れたふり、上手くなったね。でもウチ、ぜんぶ録っとるけん。<br>音も、呼吸も、謝ってないのも」",
            "「ちゃんと声に出して謝ってほしいな」",
        ],
    };

    // ──────────── ②スタート画面の処理 ────────────
    $("#start-screen").fadeIn();
    // スタート時に光る+タイトルコール
    $("#start-button").on("click", function () {
        const title = $(".start-title");

        // 光るアニメーションクラスを付与（再適用のため一旦削除してから付け直してもよい）
        title.removeClass("title-glow"); // ← 直前に付いてたらリセットするため
        void title[0].offsetWidth; // ← 再適用トリック
        title.addClass("title-glow");

        // タイトルコール再生とその後の処理
        const audio = new Audio("../materials/タイトルコール.mp3");
        audio.play().catch((err) => {
            console.error("音声再生に失敗:", err);
            fadeOutAndStartMonologue();
        });

        audio.onended = function () {
            fadeOutAndStartMonologue();
        };
    });

    // 音声再生が終わってから、画面をフェードアウトして独白開始
    function fadeOutAndStartMonologue() {
        $("#start-screen").fadeOut(500, function () {
            showMonologue();
        });
    }

    // ──────────── ③独白表示＆進行関数 ────────────
    function showMonologue() {
        monologueActive = true; // ← 独白モードにする
        currentLine = 0;
        $("#popup-overlay").fadeIn();
        $(".popup-body").html(
            monologueLines[currentLine].replace(/\n/g, "<br>")
        );
    }

    $(".popup-content").on("click", function (e) {
        e.stopPropagation(); // 背景クリックを止める
        if (!monologueActive) return;
        currentLine++;
        if (currentLine < monologueLines.length) {
            $(".popup-body").html(
                monologueLines[currentLine].replace(/\n/g, "<br>")
            );
        } else {
            monologueActive = false; // 独白終了
            gameStarted = true; // ゲーム操作解禁
            $("#popup-overlay").fadeOut();
        }
    });

    // ──────────── ④ポップアップ共通の閉じる処理 ────────────
    $("#popup-overlay").on("click", function (e) {
        if (e.target === this) $(this).fadeOut(); // 背景クリックで閉じる
    });
    $(".popup-close").on("click", function () {
        $("#popup-overlay").fadeOut(); // ×ボタンで閉じる
    });
    $(document).on("click", "#code-input", function (e) {
        e.stopPropagation(); // input 内クリックで閉じない
    });

    // ──────────── ⑤クリックアイテム共通処理 ────────────
    $(document).on("click", ".clickable-item", function () {
        const key = $(this).data("popup");
        const txt = popupData[key];
        if (!txt) return;
        $(".popup-body").html(Array.isArray(txt) ? txt[0] : txt);
        $("#popup-overlay").fadeIn();
    });

    // ──────────── ⑥香水クリック（ステップ3） ────────────
    let perfumeClickedOnce = false;
    let perfumeUnlocked = false;

    $(document).on("click", "#perfume", function () {
        if (!perfumeClickedOnce) {
            // １回目説明
            $(".popup-body").html(popupData.perfume[0]);
            $("#popup-overlay").fadeIn();
            perfumeClickedOnce = true;
        } else {
            // ２回目以降は常にヒント＋入力フォームを表示
            showPerfumeHint();
            perfumeUnlocked = true;
        }
    });

    function showPerfumeHint() {
        monologueActive = false; // 念のため独白モードOFF
        const html = `
            <p>${popupData.perfume[1]}</p>
            <input type="text" id="code-input" placeholder="合言葉を入力" />
        `;
        $(".popup-body").html(html);
        $("#popup-overlay").fadeIn();
    }
    // ──────────── ⑦日記クリック（ステップ4） ────────────
    let diaryPage = 0;
    $(document).on("click", "#diary", function () {
        const pages = popupData.diary;
        $(".popup-body").html(pages[diaryPage]);
        $("#popup-overlay").fadeIn();
        diaryPage = (diaryPage + 1) % pages.length;
    });

    // ──────────── ⑧懐中電灯操作（ステップ1） ────────────
    const canvas = $("#flashlight-overlay")[0];
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawDark();
    let flashlightOn = false,
        mouseX = 0,
        mouseY = 0;

    $(window).on("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawDark();
    });
    $(document).on("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (flashlightOn) drawFlashlight();
    });
    $(document).on("keydown", (e) => {
        if (e.code === "Space") {
            flashlightOn = true;
            drawFlashlight();
        }
    });
    $(document).on("keyup", (e) => {
        if (e.code === "Space") {
            flashlightOn = false;
            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawDark();
        }
    });
    function drawFlashlight() {
        ctx.fillStyle = "rgba(0,0,0,0.95)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const r = 100; // ライトの半径
        const g = ctx.createRadialGradient(
            mouseX,
            mouseY,
            0,
            mouseX,
            mouseY,
            r
        );
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.1, "rgba(0,0,0,0.9 )");
        g.addColorStop(0.2, "rgba(0,0,0,0.8 )");
        g.addColorStop(0.3, "rgba(0,0,0,0.7 )");
        g.addColorStop(0.4, "rgba(0,0,0,0.6 )");
        g.addColorStop(0.5, "rgba(0,0,0,0.5 )");
        g.addColorStop(0.6, "rgba(0,0,0,0.4 )");
        g.addColorStop(0.7, "rgba(0,0,0,0.3 )");
        g.addColorStop(0.8, "rgba(0,0,0,0.2 )");
        g.addColorStop(0.9, "rgba(0,0,0,0.1 )");
        g.addColorStop(1, "rgba(0,0,0,0.1)");
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
    }

    // =============================
    // 【ステップ 7】音量チェック（マイク）
    // =============================
    // ・マイクを使って一定時間、音量（声の大きさ）を測定 → バニラJS（Web Audio API）
    // ・基準を超えたらゲームクリア → エンディング画面へ切り替え → jQuery（.fadeIn()等）
    // ・必要なら音声のON/OFF権限の確認も追加する → バニラJS（PromiseとPermission処理）
    $(document).on("input", "#code-input", function () {
        const userInput = $(this).val().trim();
        if (correctCodeList.includes(userInput)) {
            $("#popup-overlay").fadeOut();
            proceedToMicCheck();
        }
    });
    function proceedToMicCheck() {
        console.log("マイクチェックを開始します");
        startMicCheck(); // ← 次で作る関数
    }
    function startMicCheck() {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function (stream) {
                const audioContext = new (window.AudioContext ||
                    window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 512;
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);

                const dataArray = new Uint8Array(analyser.fftSize);
                const threshold = 30; // 声の大きさの基準
                let loudCount = 0;
                const requiredLoud = 2; // 一定以上の音量を何回カウントしたら成功か

                function checkVolume() {
                    analyser.getByteTimeDomainData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        const deviation = dataArray[i] - 128;
                        sum += deviation * deviation;
                    }
                    const volume = Math.sqrt(sum / dataArray.length);

                    if (volume > threshold) {
                        loudCount++;
                        console.log("声が大きい！", loudCount);
                    } else {
                        loudCount = 0;
                    }

                    if (loudCount >= requiredLoud) {
                        stream.getTracks().forEach((track) => track.stop()); // マイク停止
                        showEnding(); // ← エンディング画面へ
                    } else {
                        requestAnimationFrame(checkVolume);
                    }
                }

                checkVolume();
            })
            .catch(function (err) {
                alert("マイクが使えません：" + err.message);
            });
    }
    function showEnding() {
        $("#ending-screen").fadeIn(3000);
    }
});
