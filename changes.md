### change

- `test/dev/shadow_test.html` — Hostile CSS·스트라이크 존·격리 패널·토글; 페이지·패널 12px·#000·#fff; Hostile 시각 완화(26px·연보라 등) 및 `#shadow-test-notice` 안내

### feat

- 표에서 다중 셀(드래그 범위) 선택 시 B/I/U·취소선·위첨자·아래첨자·정렬·글꼴·글자 크기·글자색·배경색을 모든 선택 셀에 일괄 적용, `history.pause`로 undo 한 번에 롤백(`table.multiCellFormat.js`, `_commandExecutor.js`, `align.js`, `font.js`, `fontSize.js`, `fontColor.js`, `backgroundColor.js`)

### fix

- 표 다중 셀 선택 후 툴바 서식 클릭 시 `wysiwyg` blur가 먼저 실행되어 선택 상태가 지워지고 서식이 적용되지 않던 문제 — 툴바·메뉴 트레이 `mousedown`(캡처)에서 `selectedCells`를 스냅샷해 `click` 처리 시 사용(`handler_toolbar.js`, `handler_ww_mouse.js`, `table.multiCellFormat.js`)
- Shadow DOM에서 포인터 이벤트의 `event.target`이 호스트로 리타겟될 때 실제 히트 요소를 쓰도록 `getEventTarget`이 `composedPath()`를 사용 — 표 셀 드래그 선택, 셀 컨트롤러(팝업) 외부 클릭 판별 등에 반영(`domQuery.js`)
- 표 셀 선택 종료 시 `selectedCell`이 없으면 `displayCell`이 `null`이 되어 컨트롤러가 열리지 않던 경우 — `fixedCell`로 폴백(`table.selection.js`)
- Shadow 모드 등에서 `commonAncestor`가 텍스트 노드가 아닐 때 `format` 없이 형제 `BR` 정리 코드가 실행되며 예외 → `catch`의 `formatBlock` `execCommand`가 입력마다 호출되던 문제 수정(`defaultLineManager.js`)
- 기본 줄 래핑 시 `dom.utils.createElement`(전역 `document` 전용) 대신 `commonCon.ownerDocument.createElement`를 사용하고, `formatBlock` 폴백은 `queueMicrotask`로 한 틱 뒤 실행해 입력 처리와 동기 `execCommand` 재진입 경고를 줄임(`defaultLineManager.js`)
- Shadow/툴바 등에서 브라우저가 `rangeCount === 0`으로 비운 뒤에도 `selection.init()`이 `#createDefaultRange()`로 `_range`를 덮어써, 부분 선택 직후 볼드 등이 빈 태그만 감싸거나 문단이 쪼개지던 문제 완화 — `anchor`/`focus`로 range 복원, 포커스가 wysiwyg 밖(또는 호스트 `shadowRoot` 밖)일 때는 비접힌 저장 range 유지(`selection.js`)
- 툴바 `mousedown` 직후 Shadow(또는 window)의 **비접힌** 선택을 `_range`에 클론해 두고, 이어지는 `selectionchange`→`init()`이 접힌 Range로 덮어쓰려 할 때 유지(`_toolbarPreserveSelection`, `snapshotExpandedRangeIfLive`) — Shadow에서 볼드가 빈 `<strong>`만 감싸던 케이스(`handler_toolbar.js`, `handler_ww_mouse.js`, `selection.js`)
- 툴바 스냅샷 성공 시 `focus()`로 선택이 무너지지 않게 하고, `click`에서 명령 전 `setRange`로 복원; 툴바·메뉴 `mousedown`은 **캡처** 단계로 등록(`handler_toolbar.js`, `eventOrchestrator.js`)
- Shadow 모드: `window` **`pointerdown` 캡처**에서 툴바 히트 시 먼저 스냅샷; 툴바 `mousedown`은 이미 잡힌 선택을 초기화하지 않음; `click` 시 `wysiwyg.focus()` 후 `cloneRange()`로 복원(`eventOrchestrator.js`, `handler_toolbar.js`)
- **`Selection`이 생성 시점의 `shadowRoot`(항상 null)를 캐시**해 Shadow에서도 `window.getSelection()`만 쓰이던 치명적 버그 수정 — `contextProvider.shadowRoot`를 매번 읽어 `getSelection()` 사용(`selection.js`)
- Shadow DOM(`options.shadowRoot`)에서 툴바 서식 시 잘못된 Selection/Range로 줄바꿈·오동작 나던 문제 완화 — 명시 `shadowRoot`를 Selection에 사용, 중첩 `shadowRoot` 탐지 시 `contains(wysiwyg)` 검증(`contextProvider.js`, `constructor.js`)
- `selection.get()`에서 저장 Range를 매번 `addRange`로 되살리던 로직 제거 — `selectionchange`와 맞물려 Chrome `document.execCommand()` 재귀 경고가 반복되던 원인(`selection.js`)
- `document`의 `selectionchange`에서 `ShadowRoot.getSelection()`을 사용하도록 정렬(`eventOrchestrator.js`)
