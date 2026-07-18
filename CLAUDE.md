# CLAUDE.md — 首爾同行 Seoul Trip PWA

## 專案是什麼
三人首爾 5 日遊(8/7–8/11)的旅遊導覽 PWA,部署在 GitHub Pages,手機加到主畫面使用。
單檔架構:所有 UI 與邏輯都在 `index.html`(vanilla JS,無框架、無建置步驟)。
`service-worker.js` 提供離線;HTML 採 network-first、資產 cache-first,更新時記得 bump `CACHE` 版本號。
資料存 localStorage(鍵:`sm_names`, `sm_exp`, `sm_rate`, `sm_settle`)。

## 不可破壞的原則
- 保持零建置:純 HTML/CSS/JS,直接開檔可用,不引入 bundler 或框架。
- 保持免帳號、離線可用。外部請求只允許:匯率 API(open.er-api.com)、Google Fonts、(若新增)免金鑰的地圖圖磚與圖片。
- 相對路徑(部署在 /seoul-trip/ 子路徑下)。
- 行動優先,max-width 520px 的單欄版面。
- 分帳與匯率的計算邏輯已驗證正確,重構 UI 時不要動演算法(computeBalances / settleTransfers)。

## 設計系統(已存在,沿用)
- 色票:紙白 #F1F2EE / 墨 #15171C / 鈷藍 #274BDB / 珊瑚 #EA4E27,類別色見 CSS `--coral --violet --teal --gold --pink`。
- 字體:Fraunces(標題)、Space Mono(時間/金額)、系統中文黑體(內文)。
- 視覺母題:行程時間軸 = 地鐵路線圖(站點節點、類別色)。新功能延續這個語言。

## 待辦(按優先序)
1. **Today 置頂卡**:依裝置日期判斷——行前顯示出發倒數;旅途中顯示「今天 Day N」＋下一個行程項目與剩餘時間;行程結束顯示總結。放在行程分頁最上方。
2. **深色模式**:prefers-color-scheme 自動 + 手動切換(存 localStorage)。dark-first 調色,深色下鈷藍要提亮(如 #5B7CFF),維持對比可讀性。
3. **景點卡照片**:PLACES 每筆加 `img` 欄位。圖片放 repo 的 `img/` 資料夾(壓縮過的 webp,寬 800px 內),卡片頂部加 16:9 圖。無圖時優雅退回純文字卡。
4. **每日路線小地圖**:行程分頁每天標題下嵌 Leaflet + OpenStreetMap(免金鑰),把當天各站以類別色標記並用折線串連。DAYS 資料需為每站補 `lat`/`lng`。離線時隱藏地圖不報錯。
5. **行程打勾**:每個行程項目可標記完成(存 localStorage),完成的站點節點變實心並降低透明度。
6. **分帳匯出/匯入**:把 expenses+names 序列化成 base64 代碼,一鍵複製;另一台手機貼上即可合併(以 id 去重)。UI 放在分帳頁底部。
7. **天氣卡**:須知頁加首爾未來數日天氣(Open-Meteo 免費免金鑰 API),離線時顯示上次快取。
8. **微互動打磨**:卡片進場 stagger 動畫、tab 切換過場、respect prefers-reduced-motion。

## 驗收方式
- 每項改完用 Playwright 以 390×844 viewport 截圖確認(行程/指南/分帳/匯率/須知五頁),不要只看 code。
- `node --check` 驗證 script 語法。
- 改 index.html 或 SW 後,service-worker.js 的 CACHE 版本 +1。

## 已知歷史
- v1 行程時間軸曾因 grid 兩欄/三元素不符而破版,已修(`.stop` 為三欄 `48px 18px minmax(0,1fr)`),勿回退。
- SW 曾為 cache-first 導致更新卡舊版,已改 network-first for HTML,勿回退。
